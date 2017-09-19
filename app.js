const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const token = process.env.SLACK_BOT_TOKEN || '';
const getDay = require('./weekdays');
const LanguageProcessor = require('./LanguageProcessor');
const lpClient = new LanguageProcessor();

let rtm = new RtmClient(token, {
    logLevel: 'error',
    dataStore: new MemoryDataStore()
});

// The client will emit an RTM.AUTHENTICATED event on successful connection,
// with the `rtm.start` payload if you want to cache it
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name},
    but not yet connected to a channel`);
});

rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, async message => {
   if (message.text === 'Hello.') {
       rtm.sendMessage(`Hello <@${ message.user }>!`, message.channel);
   } else {
       const entities = await lpClient.detectEntities(message.text);

       if (entities.hasOwnProperty('greetings')) {
           const dayName = getDay();
           rtm.sendMessage(`Hey. ${ dayName }s are the worst... :nate:`, message.channel);
           return;
       }

       if (entities.hasOwnProperty('intent')) {
           const firstIntent = entities.intent[0];
           rtm.sendMessage(`I'm detecting the intent ${ firstIntent.value }`, message.channel);
       } else {
           rtm.sendMessage(`I'm not sure what you're trying to say...`, message.channel);
       }
   }
});

rtm.on(RTM_EVENTS.REACTION_ADDED, reaction => {
    rtm.sendMessage(`Thanks for the :${ reaction.reaction }:, <@${ reaction.user }>!`, reaction.item.channel);
});