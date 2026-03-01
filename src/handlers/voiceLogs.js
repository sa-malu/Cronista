const { Events, EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendVoiceLog } = require("../utils/send");
const { findAuditExecutor } = require("../utils/audit");
const { formatDuration } = require("../utils/duration");

module.exports = function registerVoiceLogs(client) {
  const callTimes = new Map(); // userId -> { joinedAt }

  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const guild = newState.guild;
    if (!guild) return;

    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    const userLine = `<@${member.id}> (${member.user.tag})`;

    const oldChannel = oldState.channelId;
    const newChannel = newState.channelId;

    // 1) Entrou / saiu / moveu (com tempo)
    if (oldChannel !== newChannel) {
      let color = "#1B4F72"; // move = azul padrão
      let action = "";
      let tempoCall = null;

      if (!oldChannel && newChannel) {
        color = "#1E8E3E"; // entrou = verde
        action = `Entrou em <#${newChannel}>`;
        callTimes.set(member.id, { joinedAt: Date.now() });
      } else if (oldChannel && !newChannel) {
        color = "#5B2C83"; // saiu = roxo
        action = `Saiu de <#${oldChannel}>`;

        const data = callTimes.get(member.id);
        if (data?.joinedAt) tempoCall = formatDuration(Date.now() - data.joinedAt);
        callTimes.delete(member.id);
      } else if (oldChannel && newChannel) {
        color = "#1B4F72"; // move = azul
        action = `Moveu de <#${oldChannel}> para <#${newChannel}>`;
        // mantém joinedAt
        if (!callTimes.has(member.id)) callTimes.set(member.id, { joinedAt: Date.now() });
      }

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle("🔊 Registro: Movimento em Voz")
        .addFields(
          { name: "Usuário", value: userLine, inline: false },
          { name: "Ação", value: action, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: "Margem • Voz registrada" });

      if (tempoCall) {
        embed.addFields({ name: "Tempo em call", value: `**${tempoCall}**`, inline: false });
      }

      await sendVoiceLog(guild, embed);
    }

    // 2) Mute/Deafen próprios
    const oldSelfMute = !!oldState.selfMute;
    const newSelfMute = !!newState.selfMute;
    const oldSelfDeaf = !!oldState.selfDeaf;
    const newSelfDeaf = !!newState.selfDeaf;

    if (oldSelfMute !== newSelfMute || oldSelfDeaf !== newSelfDeaf) {
      const changes = [];
      if (oldSelfMute !== newSelfMute) changes.push(`Auto-mudo: **${newSelfMute ? "ativado" : "desativado"}**`);
      if (oldSelfDeaf !== newSelfDeaf) changes.push(`Auto-surdo: **${newSelfDeaf ? "ativado" : "desativado"}**`);

      const embed = new EmbedBuilder()
        .setColor("#171717")
        .setTitle("🎚️ Registro: Estado do Usuário (Voz)")
        .addFields(
          { name: "Usuário", value: userLine, inline: false },
          { name: "Mudança", value: changes.join("\n"), inline: false }
        )
        .setTimestamp()
        .setFooter({ text: "Margem • Ajuste pessoal registrado" });

      await sendVoiceLog(guild, embed);
    }

    // 3) Mute/Deafen pelo servidor (tenta descobrir quem fez)
    const oldServerMute = !!oldState.serverMute;
    const newServerMute = !!newState.serverMute;
    const oldServerDeaf = !!oldState.serverDeaf;
    const newServerDeaf = !!newState.serverDeaf;

    if (oldServerMute !== newServerMute || oldServerDeaf !== newServerDeaf) {
      const changes = [];
      if (oldServerMute !== newServerMute) changes.push(`Mute do servidor: **${newServerMute ? "aplicado" : "removido"}**`);
      if (oldServerDeaf !== newServerDeaf) changes.push(`Surdez do servidor: **${newServerDeaf ? "aplicada" : "removida"}**`);

      const executor = await findAuditExecutor(guild, AuditLogEvent.MemberUpdate, member.id).catch(() => null);

      const embed = new EmbedBuilder()
        .setColor("#0F0F0F")
        .setTitle("🛡️ Registro: Moderação em Voz")
        .addFields(
          { name: "Alvo", value: userLine, inline: false },
          { name: "Mudança", value: changes.join("\n"), inline: false },
          {
            name: "Executor",
            value: executor?.executorId
              ? `<@${executor.executorId}> (${executor.executorTag})`
              : "*Não identificável (sem audit log/permissão ou fora da janela).*",
            inline: false,
          }
        )
        .setTimestamp()
        .setFooter({ text: "Margem • Intervenção registrada" });

      await sendVoiceLog(guild, embed);
    }

    // 4) Câmera e transmissão
    const oldVideo = !!oldState.selfVideo;
    const newVideo = !!newState.selfVideo;
    const oldStream = !!oldState.streaming;
    const newStream = !!newState.streaming;

    if (oldVideo !== newVideo || oldStream !== newStream) {
      const changes = [];
      if (oldVideo !== newVideo) changes.push(`Câmera: **${newVideo ? "ativada" : "desativada"}**`);
      if (oldStream !== newStream) changes.push(`Transmissão: **${newStream ? "iniciada" : "encerrada"}**`);

      const embed = new EmbedBuilder()
        .setColor("#8E2A5A")
        .setTitle("📷 Registro: Vídeo/Transmissão")
        .addFields(
          { name: "Usuário", value: userLine, inline: false },
          { name: "Mudança", value: changes.join("\n"), inline: false }
        )
        .setTimestamp()
        .setFooter({ text: "Margem • Sinais registrados" });

      await sendVoiceLog(guild, embed);
    }
  });
};
