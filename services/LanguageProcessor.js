const witAccessToken = process.env.WIT_ACCESS_TOKEN || '';
const {Wit, log} = require('node-wit');

class LanguageProcessor {
    constructor() {
        this.client = new Wit({
            accessToken: witAccessToken,
            logger: new log.Logger(log.DEBUG)
        });
    }

    detectEntities(text) {
        return this.client.message(text, {})
            .then(response => response.entities)
            .catch(console.error);
    }
}

module.exports = LanguageProcessor;