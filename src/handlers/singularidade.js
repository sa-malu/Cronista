const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { CARGO_VERIFICADO } = require("../config");
const { isAboveBot } = require("../utils/perms");

module.exports = function registerSingularidade(client) {
  client.on(Events.MessageCreate, async (message) => {
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
      const jaExiste = recentes.some((m) =>
        m.author.id === client.user.id &&
        m.components?.[0]?.components?.some((c) => c.customId === "atravessar_veu")
      );
      if (jaExiste) {
        await message.delete().catch(() => {});
        return;
      }
    }

    const embed = new EmbedBuilder()
      .setColor("#111111")
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

    await message.channel.send({ embeds: [embed], components: [botao] });
    await message.delete().catch(() => {});
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.inGuild()) return;
    if (interaction.customId !== "atravessar_veu") return;

    await interaction.deferUpdate().catch(() => {});
    if (interaction.member.roles.cache.has(CARGO_VERIFICADO)) return;

    await interaction.member.roles.add(CARGO_VERIFICADO).catch(() => {});
  });
};
