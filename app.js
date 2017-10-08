const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const WebClient = require('@slack/client').WebClient;
const token = process.env.SLACK_BOT_TOKEN || '';
const getDay = require('./services/weekdays');
const phraseTypes = require('./constants/phraseTypes');
const { getResponseForIntent } = require('./services/intents');
const { registerTweetListener, removeTweetListener } = require('./services/tweetStream');
const craigslist = require('./services/craigslist');
const { getAlternativePhrasing } = require('./services/phrasing');
const { getCoilYouTubeURL } = require('./services/youtube');
const LanguageProcessor = require('./services/LanguageProcessor');
const ARBYS_SEARCH_STRING = 'arbys';
const CRAIGLIST_POST_INTERVAL_MS = 28800000; // 8 hours
const COIL_POST_INTERVAL_MS = 172800000; // 2 days
const PRIMARY_CHANNEL_NAME = 'bot_test';

let botUserId;
let botTestChannelId;
let lpClient, slackRtmClient, slackWebClient, arbysSubscription;
let minutesSinceLastArbysTweet = 0;
let craigslistTimer, coilTimer, arbysTimer;
let retweetedIds = [];

init();

function init() {
    lpClient = new LanguageProcessor();

    slackRtmClient = new RtmClient(token, {
        logLevel: 'error',
        dataStore: new MemoryDataStore()
    });

    slackWebClient = new WebClient(token, {
        logLevel: 'error'
    });

    slackRtmClient.on(CLIENT_EVENTS.RTM.AUTHENTICATED, onAuthenticated);
    slackRtmClient.on(RTM_EVENTS.MESSAGE, onMessage);
    slackRtmClient.on(RTM_EVENTS.REACTION_ADDED, onReactionAdded);

    slackRtmClient.start();
}

function end() {
    removeTweetListener(ARBYS_SEARCH_STRING);
    clearInterval(craigslistTimer);
    clearInterval(coilTimer);
    clearInterval(arbysTimer);
    // TODO: end slackRtmClient?
}

function setChannelTopic() {
    slackWebClient.conversations.setPurpose(botTestChannelId, 'bummerbot is in town');
}

async function sendCraigslistPost() {
    try {
        const post = craigslist.getRandomPost();

        if (post) {
            const msg = `${ getAlternativePhrasing(phraseTypes.SYNTH_POST) } ${ post.link }`;
            await slackRtmClient.sendMessage(msg, botTestChannelId);
        }
    }
    catch (err) {
        console.log('Error sending Craigslist post:', err);
    }
}

async function sendCoilReminder() {
    const reminderPhrasing = getAlternativePhrasing(phraseTypes.COIL_REMINDER);
    const coilUrl = await getCoilYouTubeURL();
    const message = `${ reminderPhrasing } ${ coilUrl }`;
    slackRtmClient.sendMessage(message, botTestChannelId);
}

function onArbysTweet(tweet) {
    if (tweet.retweeted_status) {
        if (retweetedIds.indexOf(tweet.retweeted_status.id_str) > -1) return;

        retweetedIds.push(tweet.retweeted_status.id_str);
    }

    if (minutesSinceLastArbysTweet < 60) return;

    const user = tweet.quoted_status ? tweet.quoted_status.user.screen_name : tweet.user.screen_name;
    const statusId = tweet.quoted_status ? tweet.quoted_status.id_str : tweet.id_str;
    const url = `https://twitter.com/${user}/status/${statusId}`;
    slackRtmClient.sendMessage(url, botTestChannelId);
    minutesSinceLastArbysTweet = 0;
}

async function onAuthenticated(rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name},
    but not yet connected to a channel`);
    botUserId = rtmStartData.self.id;

    const botTestChannel = rtmStartData.channels.find(c => c.name === PRIMARY_CHANNEL_NAME);

    if (!botTestChannel) {
        throw new Error('Bot test channel not found');
    }

    botTestChannelId = botTestChannel.id;

    arbysSubscription = registerTweetListener(ARBYS_SEARCH_STRING, onArbysTweet);

    await craigslist.start();
    craigslistTimer = setInterval(sendCraigslistPost, CRAIGLIST_POST_INTERVAL_MS);

    arbysTimer = setInterval(() => {
        minutesSinceLastArbysTweet++;
    }, 60000);

    setChannelTopic();
}

async function onMessage(message) {
    try {
        if (message.user === botUserId || typeof message.user === 'undefined') return;

        const italicized = /_.*_/.test(message.text);
        if (italicized) {
            slackRtmClient.sendTyping(message.channel);
            slackRtmClient.sendMessage(`${ message.text }, lol`, message.channel);
            slackWebClient.conversations.setTopic(botTestChannelId, message.text);
        }

        const entities = await lpClient.detectEntities(message.text);

        if (entities.hasOwnProperty('greetings')) {
            const dayName = getDay();
            slackRtmClient.sendTyping(message.channel);
            slackRtmClient.sendMessage(`Oi <@${ message.user }>. ${ dayName }s are meaningless`, message.channel);
            return;
        }

        if (entities.hasOwnProperty('intent')) {
            const firstIntent = entities.intent[0];

            const response = getResponseForIntent(firstIntent);
            if (response) {
                slackRtmClient.sendTyping(message.channel);
                slackRtmClient.sendMessage(response, message.channel);
            }
        }
    }
    catch (err) {
        console.log('err in rtm_events.message handler', err);
    }
}

function onReactionAdded(reaction) {
    slackRtmClient.sendTyping(message.channel);
    slackRtmClient.sendMessage(`Thanks for the :${ reaction.reaction }:, <@${ reaction.user }>!`, reaction.item.channel);
}