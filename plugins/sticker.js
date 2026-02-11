const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 's',
    async execute(m, sock) {
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage || m.message;
        const mime = Object.keys(quoted)[0];

        // Check if the message is an image or video
        if (mime === 'imageMessage' || mime === 'videoMessage') {
            const stream = await downloadContentFromMessage(
                quoted[mime],
                mime === 'imageMessage' ? 'image' : 'video'
            );
            
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const inputPath = path.join(__dirname, `../temp_${Date.now()}.media`);
            const outputPath = path.join(__dirname, `../temp_${Date.now()}.webp`);

            fs.writeFileSync(inputPath, buffer);

            // Using FFmpeg to convert image/video to webp (WhatsApp Sticker format)
            exec(`ffmpeg -i ${inputPath} -vcodec libwebp -filter:v "fps=fps=20,scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${outputPath}`, async (err) => {
                
                if (err) {
                    fs.unlinkSync(inputPath);
                    return sock.sendMessage(m.key.remoteJid, { text: '❌ Failed to convert to sticker.' });
                }

                await sock.sendMessage(m.key.remoteJid, { 
                    sticker: fs.readFileSync(outputPath) 
                }, { quoted: m });

                // Cleanup files
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            });

        } else {
            await sock.sendMessage(m.key.remoteJid, { text: 'Please reply to an image or short video with *.s*' });
        }
    }
};
