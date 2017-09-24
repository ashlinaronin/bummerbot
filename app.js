const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const WebClient = require('@slack/client').WebClient;
const token = process.env.SLACK_BOT_TOKEN || '';
const getDay = require('./services/weekdays');
const { getResponseForIntent } = require('./services/intents');
const { registerTweetListener } = require('./services/tweetStream');
const LanguageProcessor = require('./services/LanguageProcessor');

let botUserId;
let botTestChannelId;
let lpClient, rtm, web, arbysSubscription;

init();

function init() {
    lpClient = new LanguageProcessor();

    rtm = new RtmClient(token, {
        logLevel: 'error',
        dataStore: new MemoryDataStore()
    });

    web = new WebClient(token, {
        logLevel: 'error'
    });

    rtm.start();

    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, onAuthenticated);
    rtm.on(RTM_EVENTS.MESSAGE, onMessage);
    rtm.on(RTM_EVENTS.REACTION_ADDED, onReactionAdded);
}

function onArbysTweet(tweet) {
    const user = tweet.quoted_status ? tweet.quoted_status.user.screen_name : tweet.user.screen_name;
    const statusId = tweet.quoted_status ? tweet.quoted_status.id_str : tweet.id_str;
    const url = `https://twitter.com/${user}/status/${statusId}`;
    rtm.sendMessage(url, botTestChannelId);
}

function onAuthenticated(rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name},
    but not yet connected to a channel`);
    botUserId = rtmStartData.self.id;

    const botTestChannel = rtmStartData.channels.find(c => c.name === 'bot_test');
    botTestChannelId = botTestChannel.id;

    arbysSubscription = registerTweetListener('arbys', onArbysTweet);
}

async function onMessage(message) {
    try {
        if (message.user === botUserId || typeof message.user === 'undefined') return;

        const italicized = /_.*_/.test(message.text);
        if (italicized) {
            rtm.sendTyping(message.channel);
            rtm.sendMessage(`${ message.text }, lol`, message.channel);
        }

        const entities = await lpClient.detectEntities(message.text);

        if (entities.hasOwnProperty('greetings')) {
            const dayName = getDay();
            rtm.sendTyping(message.channel);
            rtm.sendMessage(`Oi <@${ message.user }>. ${ dayName }s are meaningless`, message.channel);
            return;
        }

        if (entities.hasOwnProperty('intent')) {
            const firstIntent = entities.intent[0];

            const response = getResponseForIntent(firstIntent);
            if (response) {
                rtm.sendTyping(message.channel);
                rtm.sendMessage(response, message.channel);
            }
        }
    }
    catch (err) {
        console.log('err in rtm_events.message handler', err);
    }
}

function onReactionAdded(reaction) {
    rtm.sendTyping(message.channel);
    rtm.sendMessage(`Thanks for the :${ reaction.reaction }:, <@${ reaction.user }>!`, reaction.item.channel);
}