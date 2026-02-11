const whois = require('whois-json');

module.exports = {
    name: 'whois',
    async execute(m, sock, { args }) {
        const domain = args[0];
        if (!domain) return sock.sendMessage(m.key.remoteJid, { text: 'Enter a domain (e.g. .whois google.com)' });

        try {
            const data = await whois(domain);
            let info = `🔍 *WHOIS REPORT: ${domain}*\n\n`;
            info += `🏢 *Registrar:* ${data.registrar}\n`;
            info += `📅 *Created:* ${data.creationDate}\n`;
            info += `⏳ *Expiry:* ${data.registrarRegistrationExpirationDate}\n`;
            info += `🌐 *Name Servers:* ${data.nameServer}`;
            
            await sock.sendMessage(m.key.remoteJid, { text: info });
        } catch (e) {
            await sock.sendMessage(m.key.remoteJid, { text: 'Domain not found or error fetching data.' });
        }
    }
};
