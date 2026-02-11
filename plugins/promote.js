module.exports = {
    name: 'promote',
    async execute(m, sock) {
        const user = m.message.extendedTextMessage?.contextInfo?.participant || m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!user) return;
        await sock.groupParticipantsUpdate(m.key.remoteJid, [user], "promote");
        await sock.sendMessage(m.key.remoteJid, { text: 'New admin in the house! 👑' });
    }
};
