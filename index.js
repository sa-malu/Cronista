const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  EmbedBuilder
} = require("discord.js");

// =============================
// 🔧 CLIENT
// =============================
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
// 🔧 CONFIG (troque os IDs)
// =============================
const TOKEN = process.env.TOKEN; // Railway: Variables -> TOKEN
const CARGO_VERIFICADO = "1476714100804554862";
// Canal onde o Cronista escreve após atravessar (seu “Véu/boas-vindas”)
const CANAL_BOAS_VINDAS = "1476710153016578171";
// Canal de logs (história / registros)
const CANAL_LOG = "1476725674403172515";

// =============================
// 🧰 HELPERS
// =============================
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmt = (template, userTag) => template.replaceAll("{user}", userTag);

async function getChannelSafe(guild, channelId) {
  try {
    return await guild.channels.fetch(channelId);
  } catch (err) {
    console.error("Falha ao buscar canal:", channelId, err);
    return null;
  }
}

// Logs de erros pra não “sumir” no Railway
process.on("unhandledRejection", (err) => console.error("unhandledRejection:", err));
process.on("uncaughtException", (err) => console.error("uncaughtException:", err));

if (!TOKEN) {
  console.error("TOKEN não encontrado nas variáveis de ambiente (Railway -> Variables -> TOKEN).");
}

// =============================
// 📜 FRASES (após atravessar)
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

// =============================
// ✅ READY
// =============================
client.once("ready", () => {
  console.log("📜 Cronista desperto. A história começou.");
});

// =============================
// 🗝️ COMANDOS: !singularidade e !escrituras
// =============================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  // ========== !singularidade (Portal) ==========
  if (message.content === "!singularidade") {
    await message.delete().catch(() => {});

    // Evita duplicar: procura se já existe uma mensagem do bot com esse botão no canal
    const recentes = await message.channel.messages.fetch({ limit: 50 }).catch(() => null);
    if (recentes) {
      const jaExiste = recentes.some(m =>
        m.author.id === client.user.id &&
        m.components?.[0]?.components?.some(c => c.customId === "atravessar_veu")
      );
      if (jaExiste) return;
    }

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

    return;
  }

  // ========== !escrituras (Regras em Embed) ==========
  if (message.content === "!escrituras") {
    await message.delete().catch(() => {});

    // Evita duplicar mesmo após reinício
    const recentes = await message.channel.messages.fetch({ limit: 50 }).catch(() => null);
    if (recentes) {
      const jaExiste = recentes.some(m =>
        m.author.id === client.user.id &&
        m.embeds?.[0]?.title === "✦ EDICTUM DO ASTRARIUM ✦"
      );
      if (jaExiste) return;
    }

    const embed = new EmbedBuilder()
      .setTitle("✦ EDICTUM DO ASTRARIUM ✦")
      .setDescription("Ao atravessar o Véu, você aceita estas Leis.")
      .addFields(
        {
          name: "I. Da Convivência",
          value: "Respeite aqueles que compartilham a Trama com você.\nAtaques pessoais, preconceito ou assédio não serão tolerados."
        },
        {
          name: "II. Do Conteúdo",
          value: "Nada ilegal, explícito extremo ou que comprometa a estabilidade do ambiente.\nO mundo deve permanecer habitável."
        },
        {
          name: "III. Da Ordem",
          value: "Evite spam, flood ou perturbações desnecessárias.\nCada espaço possui sua função — use-os corretamente."
        },
        {
          name: "IV. Das Interferências",
          value: "Divulgação de outros domínios apenas com permissão.\nInterferências indevidas serão contidas."
        },
        {
          name: "V. Da Autoridade",
          value: "Constelações e Arquitetos zelam pela estabilidade da Trama.\nSuas decisões visam manter o equilíbrio do mundo."
        },
        {
          name: "VI. Do Bom Senso",
          value: "Se algo ameaça a harmonia do Astrarium, não o faça.\nA Singularidade desperta, mas também exige responsabilidade."
        }
      )
      .setFooter({ text: "O Véu separa mundos. Quem o atravessa, aceita suas Leis." });

    await message.channel.send({ embeds: [embed] });

    return;
  }
});

// =============================
// 🌌 BOTÃO: ATRAVESSAR O VÉU
// =============================
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "atravessar_veu") return;
  if (!interaction.inGuild()) return;

  // Evita “This interaction failed” sem mandar mensagem privada
  await interaction.deferUpdate().catch(() => {});

  // Se já tem cargo, não faz nada
  if (interaction.member.roles.cache.has(CARGO_VERIFICADO)) return;

  // Dá o cargo
  await interaction.member.roles.add(CARGO_VERIFICADO).catch(console.error);

  // Mensagem no Véu/boas-vindas APÓS atravessar
  const canalVeu = await getChannelSafe(interaction.guild, CANAL_BOAS_VINDAS);
  if (canalVeu) {
    try {
      await canalVeu.send(fmt(pick(mensagensAposAtravessar), interaction.user.tag));
    } catch (err) {
      console.error("Falha ao enviar no canal do Véu:", err);
    }
  }

  // Log opcional
  const canalLog = await getChannelSafe(interaction.guild, CANAL_LOG);
  if (canalLog) {
    canalLog.send(`✦ ${interaction.user.tag} atravessou o Véu.`);
  }
});

// =============================
// 📜 LOGS
// =============================
client.on("guildMemberAdd", async (member) => {
  const canalLog = await getChannelSafe(member.guild, CANAL_LOG);
  if (canalLog) canalLog.send(`🟢 ${member.user.tag} entrou no servidor.`);
});

client.on("guildMemberRemove", async (member) => {
  const canalLog = await getChannelSafe(member.guild, CANAL_LOG);
  if (canalLog) canalLog.send(`🔴 ${member.user.tag} saiu do servidor.`);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  const guild = newState.guild || oldState.guild;
  const canalLog = await getChannelSafe(guild, CANAL_LOG);
  if (!canalLog) return;

  if (!oldState.channel && newState.channel) {
    canalLog.send(`🎙️ ${newState.member.user.tag} entrou em **${newState.channel.name}**.`);
  }

  if (oldState.channel && !newState.channel) {
    canalLog.send(`📞 ${oldState.member.user.tag} saiu de call.`);
  }
});

client.on("messageDelete", async (message) => {
  if (!message.guild) return;
  if (message.author?.bot) return;

  const canalLog = await getChannelSafe(message.guild, CANAL_LOG);
  if (!canalLog) return;

  const conteudo = message.content?.trim()
    ? message.content
    : "*Mensagem sem conteúdo (ou embed/anexo)*";

  canalLog.send(`🕯️ Mensagem apagada de **${message.author.tag}**:\n> ${conteudo}`);
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (!oldMessage.guild) return;
  if (oldMessage.author?.bot) return;

  // Às vezes o Discord manda update sem conteúdo mudar
  if (oldMessage.content === newMessage.content) return;

  const canalLog = await getChannelSafe(oldMessage.guild, CANAL_LOG);
  if (!canalLog) return;

  const antes = oldMessage.content?.trim()
    ? oldMessage.content
    : "*Sem conteúdo textual*";

  const depois = newMessage.content?.trim()
    ? newMessage.content
    : "*Sem conteúdo textual*";

  canalLog.send(
`✏️ Um fragmento foi reescrito por **${oldMessage.author.tag}**

📝 Antes:
> ${antes}

📜 Depois:
> ${depois}`
  );
});

// =============================
// 🚀 LOGIN
// =============================
client.login(TOKEN);
