const craigslist = require('./craigslist');
const phraseTypes = require('../constants/phraseTypes');
const { getAlternativePhrasing } = require('./phrasing');
const { registerTweetListener, removeTweetListener } = require('./tweetStream');
const { getCoilYouTubeURL } = require('./youtube');
const ONE_MINUTE_MS = 60000;

class IntegrationManager {
    constructor(config) {
        this.config = config;

        this.minutesSinceLastArbysTweet = 0;
        this.arbysSubscription = undefined;
        this.craigslistTimer = undefined;
        this.coilTimer = undefined;
        this.arbysTimer = undefined;
        this.subscribers = [];

        this.init();
    }

    async init() {
        await craigslist.start();
        this.craigslistTimer = setInterval(this.sendCraigslistPost.bind(this), this.config.CRAIGSLIST_POST_INTERVAL_MS);
        this.coilTimer = setInterval(this.sendCoilLink.bind(this), this.config.COIL_POST_INTERVAL_MS);
        this.arbysSubscription = registerTweetListener(this.config.ARBYS_SEARCH_STRING, this.onArbysTweet.bind(this));
        this.arbysTimer = setInterval(() => { this.minutesSinceLastArbysTweet++; }, ONE_MINUTE_MS);
    }

    destroy() {
        clearInterval(this.craigslistTimer);
        clearInterval(this.coilTimer);
        clearInterval(this.arbysTimer);
        removeTweetListener(this.config.ARBYS_SEARCH_STRING);
    }

    async sendCraigslistPost() {
        const post = craigslist.getRandomPost();

        if (post) {
            const msg = `${ getAlternativePhrasing(phraseTypes.SYNTH_POST) } ${ post.link }`;
            return this.sendMessage(msg);
        } else {
            clearInterval(this.craigslistTimer);
            console.error('No craigslist post found, clearing timer');
            return Promise.resolve();
        }
    }

    onArbysTweet(tweetUrl) {
        if (this.minutesSinceLastArbysTweet < this.config.ARBYS_TWEET_INTERVAL_MIN) return;

        return this.sendMessage(tweetUrl);
    }

    async sendCoilLink() {
        const coilPhrasing = getAlternativePhrasing(phraseTypes.COIL_REMINDER);
        const coilUrl = await getCoilYouTubeURL();
        const message = `${ coilPhrasing } ${ coilUrl }`;
        return this.sendMessage(message);
    }

    sendMessage(msg) {
        let subPromises = this.subscribers.map(cb => {
            if (typeof cb === 'function') {
                return cb(msg);
            } else {
                return Promise.resolve();
            }
        });

        return Promise.all(subPromises);
    }

    subscribeToMessage(cb) {
        this.subscribers.push(cb);
    }

    unsubscribe(cb) {
        const index = this.subscribers.indexOf(cb);
        this.subscribers.splice(index, 0);
    }
}

module.exports = IntegrationManager;