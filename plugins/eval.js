module.exports = {
    name: 'eval',
    async execute(m, sock, { args, config }) {
        // Only allow the owner to use this
        const sender = m.key.participant || m.key.remoteJid;
        if (!sender.includes("8801719741293")) return sock.sendMessage(m.key.remoteJid, { text: "❌ This command is for my Owner only!" });

        if (!args[0]) return;
        
        try {
            let evaled = await eval(args.join(" "));
            if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
            await sock.sendMessage(m.key.remoteJid, { text: evaled });
        } catch (err) {
            await sock.sendMessage(m.key.remoteJid, { text: String(err) });
        }
    }
};
