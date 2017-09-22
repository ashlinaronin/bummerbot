const INTENTS = {
    PLAY_TECHNO: 'play_techno',
    WHO_ARE_YOU: 'who_are_you'
};

const LINKS = {
    TECHNO_VID: 'https://www.youtube.com/watch?v=aUbMJvRj2uU',
    DOH_GIF: 'https://giphy.com/gifs/thesimpsons-the-simpsons-3x24-xT5LMpBWU96Yivdfeo/embed'
};

function getResponseForIntent(intent) {
    switch (intent.value) {
        case (INTENTS.PLAY_TECHNO):
            return `affirmative. playing techno. :techno: ${ LINKS.TECHNO_VID }`;
        case (INTENTS.WHO_ARE_YOU):
            return `i'm bummerbot. :blackheart:`;
        default:
            return null;
    }
}

module.exports = {
    getResponseForIntent
};

