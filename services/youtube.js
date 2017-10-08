const querystring = require('querystring');
const fetch = require('isomorphic-fetch');

const baseUrl = 'https://content.googleapis.com/youtube/v3/search';
const options = {
    q: 'coil',
    maxResults: 25,
    part: 'snippet',
    key: 'AIzaSyAMkHWnLNAvpKte-XA9nh3RheX7lFn_dNM'
};

const coilUrl = `${ baseUrl }?${ querystring.stringify(options)}`;

async function getCoilYouTubeURL() {
    try {
        const results = await fetch(coilUrl);

        if (!results.ok) return null;

        return results[0];
    }
    catch (err) {
        console.log('Error fetching Coil YouTube URL', err);
    }
}

module.exports = {
    getCoilYouTubeURL
};