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
// 🔹 Comandos por mensagem
// =============================
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  const content = message.content.trim();
  const lower = content.toLowerCase();

  const botMember = message.guild.members.me;
  if (!botMember) return;

  // =====================================================
  // 📜 Comando !escrituras (postar regras em embed)
  // =====================================================
  if (lower === "!escrituras") {
    // Permissão: apenas acima do bot (igual você queria)
    if (!isAboveBot(message.member, botMember)) {
      return; // não apaga, só ignora
    }

    const regrasEmbed = new EmbedBuilder()
      .setColor("#111111")
      .setTitle("📜 ESCRITURAS — Regras da Comunidade")
      .setDescription(
        [
          "**I. Respeito é lei**",
          "• Sem ofensas, assédio, discriminação ou humilhação.",
          "• Debates são permitidos; ataques pessoais não.",
          "",
          "**II. Sem caos desnecessário**",
          "• Sem spam, flood, copypasta repetida ou provocação só pra arrumar briga.",
          "• Evite caps lock e @menções em excesso.",
          "",
          "**III. Conteúdo permitido**",
          "• Nada de conteúdo sexual explícito, gore ou qualquer coisa ilegal.",
          "• Sem golpes, links suspeitos ou “downloads mágicos”.",
          "",
          "**IV. Convivência**",
          "• Não exponha dados pessoais (seus ou de terceiros).",
          "• Se alguém pedir para parar, pare.",
          "",
          "**V. Moderação**",
          "• A equipe pode apagar mensagens, aplicar timeout, kick ou ban quando necessário.",
          "• Burlar punições (alt/conta secundária) piora a penalidade.",
          "",
          "**VI. Canais e temas**",
          "• Use cada canal para o assunto certo.",
          "• Se não souber onde postar, pergunte.",
          "",
          "**📌 Observação**",
          "A **Margem** registra o que carrega intenção.",
          "Seja alguém que deixa um rastro bom.",
        ].join("\n")
      )
      .setFooter({ text: "Margem da Realidade • Registro Imutável — Cronista" })
      .setTimestamp();

    await message.channel.send({ embeds: [regrasEmbed] });
    return;
  }

  // =====================================================
  // ✦ Comando !singularidade (o seu original)
  // =====================================================
  if (lower !== "!singularidade") return;

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

client.login(TOKEN);



