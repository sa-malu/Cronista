const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Message, Partials.Channel]
});

// =============================
// 🔧 CONFIG
// =============================
const TOKEN = process.env.TOKEN;
const CARGO_VERIFICADO = "1476714100804554862";
const CANAL_LOG = "1476725674403172515";
const CANAL_BOAS_VINDAS = "1476710153016578171";
const CANAL_VEU = CANAL_BOAS_VINDAS;

// =============================
// 📜 FRASES DO VÉU (após atravessar)
// =============================
const mensagensAposAtravessar = [
  `🌌 O Véu foi rasgado. **{user}** agora existe nesta história.`,
  `📜 O Cronista escreveu um novo capítulo: **{user}** atravessou.`,
  `🕯️ A narrativa aceitou **{user}**. As páginas se alinharam.`,
  `🌒 Atravessia concluída. **{user}** foi reconhecido além do Véu.`,
  `✨ A Singularidade respondeu. **{user}** entrou no novo mundo.`,
  `🔮 A trama se reorganizou para receber **{user}**.`,
  `📖 Um nome antes ausente agora está escrito: **{user}**.`,
  `🌫️ Entre o visível e o oculto, **{user}** escolheu existir.`,
  `⚜️ O selo foi tocado. **{user}** atravessou o limiar.`,
  `🌓 O Cronista não interfere… exceto por este instante. Bem-vindo(a), **{user}**.`
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fmt(template, userTag) {
  return template.replaceAll("{user}", userTag);
}

// =============================
// ✅ READY
// =============================
client.once("ready", () => {
  console.log("📜 Cronista desperto. A história começou.");
});

// =============================
// 🌌 SINGULARIDADE (mensagem única)
// =============================
// Digite !singularidade no canal #singularidade (uma vez)
// O bot posta o portal e apaga o comando
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!singularidade") {
    const botao = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("atravessar_veu")
        .setLabel("✦ Contemplar as Singularidades")
        .setStyle(ButtonStyle.Secondary)
    );

    await message.channel.send({
      content:
`# 📖 Singularidade

O Véu ainda o separa deste mundo.

Apenas aqueles que contemplam as Singularidades
podem atravessar e existir na história.

Toque o selo abaixo e atravesse.`,
      components: [botao]
    });

    await message.delete().catch(() => {});
  }
});

// =============================
// 🌌 BOTÃO: ATRAVESSAR O VÉU
// =============================
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "atravessar_veu") return;
  if (!interaction.inGuild()) return;

  // evita "This interaction failed"
  await interaction.deferUpdate().catch(() => {});

  // Já atravessou?
  if (interaction.member.roles.cache.has(CARGO_VERIFICADO)) return;

  // Dá o cargo
  await interaction.member.roles.add(CARGO_VERIFICADO).catch(console.error);

  // Mensagem no canal do Véu / boas-vindas (após atravessar)
  try {
    const canalVeu = await interaction.guild.channels.fetch(CANAL_BOAS_VINDAS);
    await canalVeu.send(
      fmt(pick(mensagensAposAtravessar), interaction.user.tag)
    );
  } catch (err) {
    console.error("Falha ao enviar no canal do Véu:", err);
  }

  // Log (opcional)
  const canalLog = await interaction.guild.channels.fetch(CANAL_LOG).catch(() => null);
  if (canalLog) canalLog.send(`✦ ${interaction.user.tag} atravessou o Véu.`);
});

// =============================
// 📜 LOGS BÁSICOS (sem mensagem ao entrar)
// =============================

client.on("guildMemberAdd", (member) => {
  const canal = member.guild.channels.cache.get(CANAL_LOG);
  if (canal) canal.send(`🟢 ${member.user.tag} entrou no servidor.`);
});

client.on("guildMemberRemove", (member) => {
  const canal = member.guild.channels.cache.get(CANAL_LOG);
  if (canal) canal.send(`🔴 ${member.user.tag} saiu do servidor.`);
});

client.on("voiceStateUpdate", (oldState, newState) => {
  const canal = newState.guild.channels.cache.get(CANAL_LOG);
  if (!canal) return;

  if (!oldState.channel && newState.channel) {
    canal.send(`🎙️ ${newState.member.user.tag} entrou em **${newState.channel.name}**.`);
  }

  if (oldState.channel && !newState.channel) {
    canal.send(`📞 ${oldState.member.user.tag} saiu de call.`);
  }
});

client.on("messageDelete", async (message) => {
  if (!message.guild) return;
  if (message.author?.bot) return;

  const canal = message.guild.channels.cache.get(CANAL_LOG);
  if (!canal) return;

  const conteudo = message.content?.trim()
    ? message.content
    : "*Mensagem sem conteúdo (ou embed/anexo)*";

  canal.send(`🕯️ Mensagem apagada de **${message.author.tag}**:\n> ${conteudo}`);
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (!oldMessage.guild) return;
  if (oldMessage.author?.bot) return;

  const canal = oldMessage.guild.channels.cache.get(CANAL_LOG);
  if (!canal) return;

  // Se não mudou o conteúdo, ignora
  if (oldMessage.content === newMessage.content) return;

  const antes = oldMessage.content?.trim()
    ? oldMessage.content
    : "*Sem conteúdo textual*";

  const depois = newMessage.content?.trim()
    ? newMessage.content
    : "*Sem conteúdo textual*";

  canal.send(
`✏️ Um fragmento foi reescrito por **${oldMessage.author.tag}**

📝 Antes:
> ${antes}

📜 Depois:
> ${depois}`
  );
});

client.login(TOKEN);