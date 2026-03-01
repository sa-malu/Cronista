const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { CARGO_VERIFICADO, VEU_CHANNEL_ID } = require("../config");
const { isAboveBot } = require("../utils/perms");

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = function registerSingularidade(client) {
  // =============================
  // !singularidade
  // =============================
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

  // =============================
  // Botão: atravessar + mensagem no #veu
  // =============================
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.inGuild()) return;
    if (interaction.customId !== "atravessar_veu") return;

    await interaction.deferUpdate().catch(() => {});

    const guild = interaction.guild;
    const member = interaction.member;

    // Canal #veu (fixo)
    const veuChannelId = VEU_CHANNEL_ID || interaction.channelId;
    const veuChannel = await guild.channels.fetch(veuChannelId).catch(() => null);
    if (!veuChannel) return;

    const userMention = `<@${member.id}>`;

    const textosPrimeiraVez = [
      `${userMention} tocou o selo… e o Véu cedeu como névoa antiga.`,
      `${userMention} atravessou. A Margem registrou o primeiro passo.`,
      `O Véu se rasgou por um instante. ${userMention} agora existe na história.`,
      `${userMention} contemplou as Singularidades — e o mundo respondeu.`,
      `Um nome foi escrito no limiar: ${userMention}.`,
      `${userMention} ouviu o chamado do outro lado. E foi aceito.`,
      `A realidade piscou. ${userMention} passou.`,
      `${userMention} atravessou o Véu. Não há retorno para quem viu.`,
    ];

    const textosJaTinha = [
      `${userMention} encostou no selo de novo… como quem testa uma cicatriz.`,
      `${userMention} já carrega o selo. Ainda assim, o Véu observou.`,
      `${userMention} retorna ao limiar. A Margem não esquece.`,
      `O selo de ${userMention} já existe. O gesto, ainda assim, ecoa.`,
    ];

    // Se já tinha cargo
    if (member.roles.cache.has(CARGO_VERIFICADO)) {
      const embed = new EmbedBuilder()
        .setColor("#444444")
        .setTitle("✦ O Véu Reconhece ✦")
        .setDescription(pick(textosJaTinha))
        .setFooter({ text: "Margem • Travessia já registrada" });

      await veuChannel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    // Dá o cargo
    await member.roles.add(CARGO_VERIFICADO).catch(() => {});

    // Mensagem no #veu
    const embed = new EmbedBuilder()
      .setColor("#1E8E3E")
      .setTitle("✦ Véu Atravessado ✦")
      .setDescription(pick(textosPrimeiraVez))
      .addFields({ name: "Selo", value: `<@&${CARGO_VERIFICADO}>`, inline: false })
      .setFooter({ text: "Margem • Uma travessia ocorreu" });

    await veuChannel.send({ embeds: [embed] }).catch(() => {});
  });
};
