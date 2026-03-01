const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { TOKEN } = require("./config");

const registerPunishments = require("./handlers/punishments");
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

// 🔹 Registrar módulos
registerPunishments(client);
registerWarnsFeed(client);

client.login(TOKEN);
