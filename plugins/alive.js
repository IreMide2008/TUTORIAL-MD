module.exports = {
    name: 'alive',
    async execute(m, sock, { config }) {
        await sock.sendMessage(m.key.remoteJid, { 
            text: `*Hello! ${config.botName} is active and ready.* 🥸✅`,
            contextInfo: { externalAdReply: { title: "TUTORIAL-MD", body: "Minato", sourceType: 1, showAdAttribution: true }}
        });
    }
};
