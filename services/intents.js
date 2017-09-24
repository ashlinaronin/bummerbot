const INTENTS = {
    PLAY_TECHNO: 'play_techno',
    WHO_ARE_YOU: 'who_are_you',
    COIL: 'coil',
    NATE: 'nate',
    WHY_ARBYS: 'why_arbys'
};

const LINKS = {
    TECHNO_VID: 'https://www.youtube.com/watch?v=aUbMJvRj2uU',
};

function getResponseForIntent(intent) {
    switch (intent.value) {
        case (INTENTS.PLAY_TECHNO):
            return `affirmative. playing :techno: ${ LINKS.TECHNO_VID }`;
        case (INTENTS.WHO_ARE_YOU):
            return `i'm bummerbot. :blackheart:`;
        case (INTENTS.COIL):
            return `:coil:`;
        case (INTENTS.NATE):
            return `:nate:`;
        case (INTENTS.WHY_ARBYS):
            return `I'm sorry if it bothers you. I like sandwiches and I want to share them with friends.`;
        default:
            return null;
    }
}

module.exports = {
    getResponseForIntent
};

