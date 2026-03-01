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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const TOKEN = process.env.TOKEN;
const CARGO_VERIFICADO = "1476714100804554862";

// =============================
// 🔹 Verifica se usuário está acima do bot
// =============================
function isAboveBot(member, botMember) {
  if (member.id === member.guild.ownerId) return true;

  return member.roles.highest.position > botMember.roles.highest.position;
}

client.once("ready", () => {
  console.log(`📜 Cronista online como ${client.user.tag}`);
});

// =============================
// 🔹 Comando !singularidade
// =============================
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  const content = message.content.trim().toLowerCase();
  if (content !== "!singularidade") return;

  const botMember = message.guild.members.me;

  if (!isAboveBot(message.member, botMember)) {
    await message.delete().catch(() => {});
    return;
  }

  // Evita duplicar portal
  const recentes = await message.channel.messages.fetch({ limit: 50 }).catch(() => null);
  if (recentes) {
    const jaExiste = recentes.some(m =>
      m.author.id === client.user.id &&
      m.components?.[0]?.components?.some(c => c.customId === "atravessar_veu")
    );
    if (jaExiste) {
      await message.delete().catch(() => {});
      return;
    }
  }

  const embed = new EmbedBuilder()
    .setColor("#111111") // Preto elegante
    .setTitle("✦ Singularidade ✦")
    .setDescription(
`O Véu ainda o separa deste mundo.

Apenas aqueles que contemplam as Singularidades
podem atravessar e existir na história.

Toque o selo abaixo e atravesse.`
    )
    .setFooter({ text: "O Véu separa mundos." });

  const botao = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("atravessar_veu")
      .setLabel("✦ Contemplar as Singularidades")
      .setStyle(ButtonStyle.Secondary)
  );

  await message.channel.send({
    embeds: [embed],
    components: [botao]
  });

  await message.delete().catch(() => {});
});

// =============================
// 🔹 Botão atravessar
// =============================
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.inGuild()) return;
  if (interaction.customId !== "atravessar_veu") return;

  await interaction.deferUpdate().catch(() => {});

  if (interaction.member.roles.cache.has(CARGO_VERIFICADO)) return;

  await interaction.member.roles.add(CARGO_VERIFICADO).catch(console.error);
});

// =============================
// 🔹 Comando !escritruas
// =============================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "escrituras") {

    // Permissão: apenas Administrador
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("Você não tem permissão para invocar o Cronista.");
    }

    const regrasEmbed = new EmbedBuilder()
      .setColor(0x5B2C83) // roxo singularidade
      .setTitle("📜 ESCRITURAS — Regras da Comunidade")
      .setDescription(
        [
          "**I. Respeito é lei**",
          "• Sem ofensas, assédio, discriminação ou humilhação.",
          "• Debates são permitidos; ataques pessoais não.",
          "",
          "**II. Sem caos desnecessário**",
          "• Sem spam, flood ou provocações.",
          "• Evite caps lock e @menções excessivas.",
          "",
          "**III. Conteúdo permitido**",
          "• Nada de conteúdo sexual explícito, gore ou ilegal.",
          "• Sem golpes ou links suspeitos.",
          "",
          "**IV. Convivência**",
          "• Não exponha dados pessoais.",
          "• Respeite limites individuais.",
          "",
          "**V. Moderação**",
          "• A equipe pode aplicar timeout, kick ou ban quando necessário.",
          "• Burlar punições resultará em penalidades maiores.",
          "",
          "**VI. Canais e temas**",
          "• Use cada canal corretamente.",
          "",
          "**📌 Observação**",
          "A **Margem** registra o que carrega intenção.",
          "Seja alguém que deixa um rastro digno de memória."
        ].join("\n")
      )
      .setFooter({ text: "Margem da Realidade • Registro Imutável — Cronista" })
      .setTimestamp();

    await message.channel.send({ embeds: [regrasEmbed] });
  }
});

client.login(TOKEN);


