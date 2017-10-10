const phraseTypes = require('./../constants/phraseTypes');
const utils = require('./utils');

const phrases = {
    [phraseTypes.SYNTH_POST]: [
        'omg this thing is such a good deal!',
        'dudes...',
        'wut!',
        'look what i just found you guys',
        'who wants it?',
        'this thing is siqq',
        'lol so cheap',
        'dang',
        'shit'
    ],
    [phraseTypes.COIL_REMINDER]: [
        'have you guys heard this one?',
        'do you know about this band?',
        'i have this on vinyl',
        ':coil:'
    ]
};

function getAlternativePhrasing(phraseType) {
    if (!phrases.hasOwnProperty(phraseType)) return '';

    return utils.getRandomItemFromArray(phrases[phraseType]);
}

module.exports = {
    getAlternativePhrasing
};