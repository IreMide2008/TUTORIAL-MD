const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'menu',
    async execute(m, sock, { config }) {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        // Time and Date logic
        const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const time = new Date().toLocaleTimeString('en-US');

        const menuText = `
✨ *${config.botName}* ✨
👤 *Owner:* ${config.ownerName}
⚙️ *Prefix:* [ ${config.prefix} ]
📅 *Date:* ${date}
⏰ *Time:* ${time}

👑 *MAIN COMMANDS*
- .ping
- .alive
- .owner
- .runtime

👥 *GROUP COMMANDS*
- .kick
- .promote
- .tagall
- .hidetag

🎭 *FUN & GAMES*
- .ship
- .dare
- .gay
- .quote
- .fact
- .choose

🛡️ *ETHICAL HACKING*
- .whois <domain>
- .dns <host>
- .subdomain <domain>
- .portscan <ip>
- .hack (Prank)
- .fakeid

📧 *TEMP MAIL*
- .getmail
- .mailinbx <email>

🌸 *ANIME*
- .waifu
- .neko
- .slap
- .aquote
- .anisearch

🛠️ *TOOLS & MEDIA*
- .s (Sticker)
- .ai <text>
- .ss <url>
- .wiki <query>
- .dl <link>

_Powered by Minato_`;

        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(m.key.remoteJid, { 
                image: fs.readFileSync(imagePath), 
                caption: menuText 
            }, { quoted: m });
        } else {
            // Fallback if image is missing
            await sock.sendMessage(m.key.remoteJid, { text: menuText }, { quoted: m });
        }
    }
};
