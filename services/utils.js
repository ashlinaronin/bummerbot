function getRandomItemFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomArrayIndex(array) {
    return Math.floor(Math.random() * array.length);
}

module.exports = {
    getRandomItemFromArray,
    getRandomArrayIndex
};