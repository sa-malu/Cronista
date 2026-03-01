const { Events, EmbedBuilder } = require("discord.js");
const { isAboveBot } = require("../utils/perms");

module.exports = function registerEscrituras(client) {
  client.on(Events.MessageCreate, async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;

    const lower = message.content.trim().toLowerCase();
    if (lower !== "!escrituras") return;

    const botMember = message.guild.members.me;
    if (!isAboveBot(message.member, botMember)) return; // não apaga, só ignora

    const embed = new EmbedBuilder()
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

    await message.channel.send({ embeds: [embed] });
  });
};
