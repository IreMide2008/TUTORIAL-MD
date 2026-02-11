const axios = require('axios');

module.exports = {
    name: 'ai',
    async execute(m, sock, { args }) {
        const text = args.join(" ");
        if (!text) return sock.sendMessage(m.key.remoteJid, { text: 'Ask me something!' });

        try {
            const res = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(text)}&lc=en`);
            const reply = res.data.success;
            await sock.sendMessage(m.key.remoteJid, { text: `🤖 *AI:* ${reply}` });
        } catch (e) {
            await sock.sendMessage(m.key.remoteJid, { text: 'AI is sleeping right now...' });
        }
    }
};
