const querystring = require('querystring');
const fetch = require('isomorphic-fetch');
const utils = require('./utils');

const baseUrl = 'https://www.googleapis.com/youtube/v3/search';
const options = {
    q: 'coil',
    maxResults: 25,
    part: 'snippet',
    key: process.env.GOOGLE_SEARCH_KEY
};

const coilUrl = `${ baseUrl }?${ querystring.stringify(options)}`;

async function getCoilYouTubeURL() {
    try {
        const response = await fetch(coilUrl);

        if (!response.ok) return null;

        const jsonSearchResults = await response.json();
        const randomVideo = utils.getRandomItemFromArray(jsonSearchResults.items);
        return createYouTubeURL(randomVideo.id.videoId);
    }
    catch (err) {
        console.log('Error fetching Coil YouTube URL', err);
    }
}

function createYouTubeURL(videoId) {
    return `https://youtube.com/watch?v=${ videoId }`;
}

module.exports = {
    getCoilYouTubeURL
};