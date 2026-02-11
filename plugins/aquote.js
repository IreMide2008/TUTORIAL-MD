const axios = require('axios');

module.exports = {
    name: 'aquote',
    async execute(m, sock) {
        try {
            const res = await axios.get('https://animechan.io/api/v1/quotes/random');
            const { quote, character, anime } = res.data.data;
            const text = `💬 "${quote}"\n\n— *${character}* (${anime})`;
            await sock.sendMessage(m.key.remoteJid, { text });
        } catch (e) {
            await sock.sendMessage(m.key.remoteJid, { text: 'No quotes found today.' });
        }
    }
};
