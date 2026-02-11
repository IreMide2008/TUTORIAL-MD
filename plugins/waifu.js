const axios = require('axios');

module.exports = {
    name: 'waifu',
    async execute(m, sock) {
        try {
            const res = await axios.get('https://api.waifu.pics/sfw/waifu');
            await sock.sendMessage(m.key.remoteJid, { 
                image: { url: res.data.url }, 
                caption: "Here is your Waifu! ✨" 
            }, { quoted: m });
        } catch (e) {
            await sock.sendMessage(m.key.remoteJid, { text: 'Failed to fetch waifu. Try again later.' });
        }
    }
};
