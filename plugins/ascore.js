const axios = require('axios');

module.exports = {
    name: 'anisearch',
    async execute(m, sock, { args }) {
        const query = args.join(" ");
        if (!query) return sock.sendMessage(m.key.remoteJid, { text: 'Please provide an anime name!' });

        try {
            const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
            const anime = res.data.data[0];
            
            const info = `
📺 *Title:* ${anime.title}
🌟 *Score:* ${anime.score}
📅 *Status:* ${anime.status}
🎞️ *Episodes:* ${anime.episodes}
📝 *Synopsis:* ${anime.synopsis.slice(0, 200)}...
            `;
            
            await sock.sendMessage(m.key.remoteJid, { 
                image: { url: anime.images.jpg.image_url }, 
                caption: info 
            });
        } catch (e) {
            await sock.sendMessage(m.key.remoteJid, { text: 'Anime not found!' });
        }
    }
};
