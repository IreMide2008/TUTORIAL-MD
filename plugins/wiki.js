const axios = require('axios');

module.exports = {
    name: 'wiki',
    async execute(m, sock, { args }) {
        const query = args.join(" ");
        if (!query) return sock.sendMessage(m.key.remoteJid, { text: 'What do you want to search?' });

        try {
            const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
            const text = `📚 *Wikipedia: ${res.data.title}*\n\n${res.data.extract}`;
            await sock.sendMessage(m.key.remoteJid, { text });
        } catch (e) {
            await sock.sendMessage(m.key.remoteJid, { text: 'Could not find anything on that.' });
        }
    }
};
