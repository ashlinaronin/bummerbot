const phraseTypes = require('./../constants/phraseTypes');

const phrases = {
    [phraseTypes.SYNTH_POST]: [
        'omg this thing is such a good deal!',
        'dudes...',
        'wut!',
        'look what i just found you guys',
        'who wants it?'
    ],
    [phraseTypes.COIL_REMINDER]: [
        'have you guys heard this one?',
        'do you know about this band?'
    ]
};

function getAlternativePhrasing(phraseType) {
    if (!phrases.hasOwnProperty(phraseType)) return '';

    return getRandomItemFromArray(phrases[phraseType]);
}

function getRandomItemFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}


module.exports = {
    getAlternativePhrasing
};