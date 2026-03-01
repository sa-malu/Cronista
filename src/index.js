const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { TOKEN } = require("./config");

const registerSingularidade = require("./handlers/singularidade");
const registerEscrituras = require("./handlers/escrituras");
const registerMessageLogs = require("./handlers/messageLogs");
const registerVoiceLogs = require("./handlers/voiceLogs");
const registerPunishmentsSenescal = require("./handlers/punishmentsSenescal");
const registerWarnsFeed = require("./handlers/warnsFeed");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.once("ready", () => {
  console.log(`📜 Cronista online como ${client.user.tag}`);
});

// handlers
registerSingularidade(client);
registerEscrituras(client);
registerMessageLogs(client);
registerVoiceLogs(client);
registerPunishmentsSenescal(client);
registerWarnsFeed(client);

client.login(TOKEN);
