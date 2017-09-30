const feedparser = require('feedparser-promised');
const feedUrl = 'https://portland.craigslist.org/search/sss?format=rss&query=synth';
const options = {
    uri: feedUrl,
    timeout: 3000,
    gzip: true
};
const ONE_HOUR_MS = 3600000;

let timer;
let posts = [];
let sentPostLinks = [];

async function start() {
    await updatePosts();
    timer = setInterval(updatePosts, ONE_HOUR_MS);
}

function stop() {
    clearInterval(timer);
    posts = [];
}

async function updatePosts() {
    posts = await feedparser.parse(options);
}

function getRandomPost() {
    if (!posts.length) return null;

    const postIndex = getRandomArrayIndex(posts);
    const post = posts[postIndex];

    if (sentPostLinks.indexOf(post.link) > -1) {
        return getRandomPost();
    }

    sentPostLinks.push(post.link);
    posts.splice(postIndex, 1);

    return post;
}

function getRandomArrayIndex(array) {
    return Math.floor(Math.random() * array.length);
}

module.exports = {
    start,
    stop,
    getRandomPost
};
