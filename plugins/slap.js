const axios = require('axios');

module.exports = {
    name: 'slap',
    async execute(m, sock) {
        try {
            const res = await axios.get('https://api.waifu.pics/sfw/slap');
            const user = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 'someone';
            const mention = user !== 'someone' ? `@${user.split('@')[0]}` : 'someone';

            await sock.sendMessage(m.key.remoteJid, { 
                video: { url: res.data.url }, // These are usually GIFs
                gifPlayback: true,
                caption: `*Ouch!* You just slapped ${mention}! 👋`,
                mentions: user !== 'someone' ? [user] : []
            }, { quoted: m });
        } catch (e) {
            await sock.sendMessage(m.key.remoteJid, { text: 'Couldn\'t find a slapping GIF!' });
        }
    }
};
