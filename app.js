const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const WebClient = require('@slack/client').WebClient;
const token = process.env.SLACK_BOT_TOKEN || '';
const getDay = require('./services/weekdays');
const phraseTypes = require('./constants/phraseTypes');
const { getResponseForIntent } = require('./services/intents');
const LanguageProcessor = require('./services/LanguageProcessor');
const IntegrationManager = require('./services/IntegrationManager');
const config = require('./config');

let botUserId, primaryChannelId;
let lpClient, integrationManager, slackRtmClient, slackWebClient;

init();

function init() {
    slackRtmClient = new RtmClient(token, {
        logLevel: 'error',
        dataStore: new MemoryDataStore()
    });

    slackWebClient = new WebClient(token, {
        logLevel: 'error'
    });

    slackRtmClient.on(CLIENT_EVENTS.RTM.AUTHENTICATED, onAuthenticated);
    slackRtmClient.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, onConnectionOpened);
    slackRtmClient.on(RTM_EVENTS.MESSAGE, onMessage);
    slackRtmClient.on(RTM_EVENTS.REACTION_ADDED, onReactionAdded);

    slackRtmClient.start();
}

function end() {
    integrationManager.unsubscribe(sendMessageFromIntegration);
    integrationManager.destroy();
}

function setChannelPurpose() {
    slackWebClient.conversations.setPurpose(primaryChannelId, config.PRIMARY_CHANNEL_PURPOSE);
}

async function onAuthenticated(rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name},
    but not yet connected to a channel`);
    botUserId = rtmStartData.self.id;

    const primaryChannel = rtmStartData.channels.find(c => c.name === config.PRIMARY_CHANNEL_NAME);

    if (!primaryChannel) {
        throw new Error('Bot test channel not found');
    }

    primaryChannelId = primaryChannel.id;
}

async function onConnectionOpened() {
    console.log('Connection opened, initializing LanguageProcessor and IntegrationManager');
    lpClient = new LanguageProcessor();
    integrationManager = new IntegrationManager(config);
    integrationManager.subscribeToMessage(sendMessageFromIntegration);
}

async function sendMessageFromIntegration(msg) {
    if (!msg || typeof msg !== 'string') {
        return Promise.reject('received malformed message from integration manager, skipping');
    }

    slackRtmClient.sendTyping(primaryChannelId);
    return slackRtmClient.sendMessage(msg, primaryChannelId);
}

async function onMessage(message) {
    try {
        if (message.user === botUserId || typeof message.user === 'undefined') return;

        const italicized = /_.*_/.test(message.text);
        if (italicized) {
            slackRtmClient.sendTyping(message.channel);
            slackRtmClient.sendMessage(`${ message.text }, lol`, message.channel);
            slackWebClient.conversations.setTopic(primaryChannelId, message.text);
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
    // TODO check if reaction is to a post by bummerbot
    slackRtmClient.sendTyping(reaction.channel);
    slackRtmClient.sendMessage(`Thanks for the :${ reaction.reaction }:, <@${ reaction.user }>!`, reaction.item.channel);
}