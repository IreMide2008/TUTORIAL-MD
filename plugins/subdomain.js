const axios = require('axios');

module.exports = {
    name: 'subdomain',
    async execute(m, sock, { args }) {
        const domain = args[0];
        if (!domain) return sock.sendMessage(m.key.remoteJid, { text: 'Enter a domain!' });

        try {
            const res = await axios.get(`https://api.hackertarget.com/hostsearch/?q=${domain}`);
            await sock.sendMessage(m.key.remoteJid, { text: `📂 *SUBDOMAINS FOUND:*\n\n${res.data}` });
        } catch (e) {
            await sock.sendMessage(m.key.remoteJid, { text: 'Error scanning subdomains.' });
        }
    }
};
