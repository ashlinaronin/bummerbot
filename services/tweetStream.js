const path = require('path');
const Twit = require('twit');

let listeners = {};
let T = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY || '',
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET || '',
    access_token: process.env.TWITTER_ACCESS_TOKEN || '',
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || ''
});

function registerTweetListener(searchString, cb) {
    const newStream = T.stream('statuses/filter', { track: searchString });
    newStream.on('tweet', tweet => {
        if (typeof cb === 'function') {
            cb(tweet);
        }
    });
    listeners[searchString] = newStream;
}

function removeTweetListener(searchString) {
    listeners[searchString].stop();
    delete listeners[searchString];
}

function removeAllTweetListeners() {
    listeners.forEach(listener => listener.stop());
    listeners = {};
}

module.exports = {
    registerTweetListener,
    removeTweetListener,
    removeAllTweetListeners
};