require("dotenv").config();
const fs = require("fs-extra");
const path = require("path");
const pino = require("pino");
const chalk = require("chalk");
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");
const moment = require("moment-timezone");

// Modules
const { TELEGRAM_TOKEN } = require("./token");
const { incrementReset, resetData } = require("./resetManager");
const handler = require("./bot"); 

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    Browsers,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const sessionsDir = path.join(__dirname, 'sessions');
fs.ensureDirSync(sessionsDir);

// Global Stats & Console Logs for UI
let stats = { bots: 0, users: 0, uptime: "0%" };
let consoleLogs = []; // Stores logs for the "Server Logs" UI
const activeBots = new Map();
const startTime = Date.now();

// Utility for UI logging
const uiLog = (msg) => {
    const log = `[${moment().format("HH:mm:ss")}] ${msg}`;
    consoleLogs.push(log);
    if (consoleLogs.length > 50) consoleLogs.shift(); // Keep last 50
    console.log(chalk.blue(log));
};

// ===============================
//        WEB & API ROUTES
// ===============================

// Update stats for the Dashboard UI
app.get('/stats', (req, res) => {
    const diff = Date.now() - startTime;
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    
    res.json({
        bots: activeBots.size,
        users: stats.users,
        uptime: `${hours}h ${mins}m`,
        serverStatus: "Online",
        resets: resetData.count
    });
});

// Fetch Logs for the "Server Logs" UI button
app.get('/logs', (req, res) => res.json(consoleLogs));

// Pairing API for the Dashboard "Generate" button
app.get('/pairing', async (req, res) => {
    let num = req.query.number?.replace(/\D/g, "");
    if (!num) return res.status(400).json({ message: "Number required" });

    uiLog(`Pairing request for +${num}`);
    try {
        const code = await startWhatsAppBot(num, null, true);
        res.json({ code });
    } catch (err) {
        res.status(500).json({ message: "Failed to generate code." });
    }
});

app.listen(PORT, () => uiLog(`Server active on port ${PORT}`));

// ===============================
//        TELEGRAM INTERFACE
// ===============================
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `🚀 *TUTORIAL–MD CONTROL*\n\nPairing via Panel or /pair <number>`, { parse_mode: "Markdown" });
});

bot.onText(/\/pair (.+)/, async (msg, match) => {
    let phoneNumber = match[1].replace(/\D/g, "");
    bot.sendMessage(msg.chat.id, `⏳ Generating code for +${phoneNumber}...`);
    await startWhatsAppBot(phoneNumber, msg.chat.id);
});

// ===============================
//     WHATSAPP CORE LOGIC
// ===============================
async function startWhatsAppBot(phoneNumber, telegramChatId = null, isWebRequest = false) {
    const sessionDir = path.join(sessionsDir, `session_${phoneNumber}`);
    await fs.ensureDir(sessionDir);

    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        browser: Browsers.ubuntu("Chrome"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        }
    });

    activeBots.set(phoneNumber, sock);
    sock.ev.on("creds.update", saveCreds);

    if (!state.creds?.registered) {
        await delay(3000);
        try {
            let code = await sock.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            
            if (telegramChatId) bot.sendMessage(telegramChatId, `✅ *CODE:* \`${code}\``, { parse_mode: "Markdown" });
            if (isWebRequest) return code; 
        } catch (e) {
            uiLog(`Error in pairing +${phoneNumber}`);
            if (telegramChatId) bot.sendMessage(telegramChatId, "❌ Failed.");
        }
    }

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === "open") {
            uiLog(`Connected: +${phoneNumber}`);
            stats.users++;
            if (telegramChatId) bot.sendMessage(telegramChatId, `🎉 Successfully Linked!`);
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            activeBots.delete(phoneNumber);
            if (reason !== DisconnectReason.loggedOut) {
                uiLog(`Reconnecting +${phoneNumber}...`);
                startWhatsAppBot(phoneNumber, telegramChatId);
            } else {
                uiLog(`Logged out: +${phoneNumber}`);
                fs.removeSync(sessionDir);
            }
        }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        try { await handler(sock, m); } catch (e) {}
    });
}

// Reconnect sessions on boot
const init = async () => {
    uiLog("Initializing TUTORIAL-MD Dashboard...");
    if (fs.existsSync(sessionsDir)) {
        const sessions = fs.readdirSync(sessionsDir);
        for (const session of sessions) {
            const num = session.replace("session_", "");
            if (num) startWhatsAppBot(num);
        }
    }
};

init();
