const path = require('path');
const Twit = require('twit');

let listeners = {};
let retweetedIds = [];


let T = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY || '',
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET || '',
    access_token: process.env.TWITTER_ACCESS_TOKEN || '',
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || ''
});

function registerTweetListener(searchString, cb) {
    const newStream = T.stream('statuses/filter', { track: searchString });
    newStream.on('tweet', tweet => {
        if (isNewStatus(tweet) && typeof cb === 'function') {
            cb(getUrlFromTweet(tweet));
        }
    });
    listeners[searchString] = newStream;
}

function isNewStatus(tweet) {
    if (tweet.retweeted_status) {
        if (retweetedIds.indexOf(tweet.retweeted_status.id_str) > -1) {
            return false;
        } else {
            retweetedIds.push(tweet.retweeted_status.id_str);
            return true;
        }
    }

    return true;
}

function getUrlFromTweet(tweet) {
    const user = tweet.quoted_status ? tweet.quoted_status.user.screen_name : tweet.user.screen_name;
    const statusId = tweet.quoted_status ? tweet.quoted_status.id_str : tweet.id_str;
    return `https://twitter.com/${ user }/status/${ statusId }`;
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