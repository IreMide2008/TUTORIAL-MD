module.exports = {
    name: 'ship',
    async execute(m, sock) {
        if (!m.key.remoteJid.endsWith('@g.us')) return;
        const metadata = await sock.groupMetadata(m.key.remoteJid);
        const participants = metadata.participants;
        const user1 = participants[Math.floor(Math.random() * participants.length)].id;
        const user2 = participants[Math.floor(Math.random() * participants.length)].id;
        
        const lovePercentage = Math.floor(Math.random() * 101);
        const text = `❤️ *MATCHMAKING* ❤️\n\n@${user1.split('@')[0]} x @${user2.split('@')[0]}\n*Love Percentage:* ${lovePercentage}%`;
        
        await sock.sendMessage(m.key.remoteJid, { text, mentions: [user1, user2] });
    }
};
