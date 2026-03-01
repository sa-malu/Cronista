console.log("✅ punishmentsSenescal handler carregado");

const { Events, EmbedBuilder, AuditLogEvent } = require("discord.js");
const { SENESCAL_ID } = require("../config");
const { findAuditExecutor } = require("../utils/audit");
const { sendPunishLog } = require("../utils/send");

module.exports = function registerPunishmentsSenescal(client) {
  // BAN
  client.on(Events.GuildBanAdd, async (ban) => {
    if (!SENESCAL_ID) return;

    const exec = await findAuditExecutor(ban.guild, AuditLogEvent.MemberBanAdd, ban.user.id).catch(() => null);
    if (!exec || exec.executorId !== SENESCAL_ID) return;

    const embed = new EmbedBuilder()
      .setColor("#5B2C83")
      .setTitle("⛓️ Punição: Banimento (Senescal)")
      .addFields(
        { name: "Alvo", value: `<@${ban.user.id}> (${ban.user.tag})`, inline: false },
        { name: "Motivo", value: exec.reason ? exec.reason.slice(0, 1024) : "*Não informado*", inline: false }
      )
      .setTimestamp()
      .setFooter({ text: "Crônicas de Punições • Cronista" });

    await sendPunishLog(ban.guild, embed);
  });

  // UNBAN
  client.on(Events.GuildBanRemove, async (ban) => {
    if (!SENESCAL_ID) return;

    const exec = await findAuditExecutor(ban.guild, AuditLogEvent.MemberBanRemove, ban.user.id).catch(() => null);
    if (!exec || exec.executorId !== SENESCAL_ID) return;

    const embed = new EmbedBuilder()
      .setColor("#1B4F72")
      .setTitle("🔓 Punição: Unban (Senescal)")
      .addFields(
        { name: "Alvo", value: `<@${ban.user.id}> (${ban.user.tag})`, inline: false },
        { name: "Motivo", value: exec.reason ? exec.reason.slice(0, 1024) : "*Não informado*", inline: false }
      )
      .setTimestamp()
      .setFooter({ text: "Crônicas de Punições • Cronista" });

    await sendPunishLog(ban.guild, embed);
  });

  // TIMEOUT aplicado/removido/ajustado
  client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    if (!SENESCAL_ID) return;

    const oldUntil = oldMember.communicationDisabledUntil?.getTime() ?? null;
    const newUntil = newMember.communicationDisabledUntil?.getTime() ?? null;
    if (oldUntil === newUntil) return;

    const exec = await findAuditExecutor(newMember.guild, AuditLogEvent.MemberUpdate, newMember.id).catch(() => null);
    if (!exec || exec.executorId !== SENESCAL_ID) return;

    const applied = !oldUntil && newUntil;
    const removed = oldUntil && !newUntil;
    const action = applied ? "Timeout aplicado" : removed ? "Timeout removido" : "Timeout ajustado";

    const embed = new EmbedBuilder()
      .setColor("#111111")
      .setTitle("⏳ Punição: Timeout (Senescal)")
      .addFields(
        { name: "Alvo", value: `<@${newMember.id}> (${newMember.user.tag})`, inline: false },
        { name: "Ação", value: action, inline: true },
        ...(newUntil ? [{ name: "Até", value: `<t:${Math.floor(newUntil / 1000)}:F>`, inline: true }] : []),
        { name: "Motivo", value: exec.reason ? exec.reason.slice(0, 1024) : "*Não informado*", inline: false }
      )
      .setTimestamp()
      .setFooter({ text: "Crônicas de Punições • Cronista" });

    await sendPunishLog(newMember.guild, embed);
  });

  // KICK (GuildMemberRemove + audit log)
  client.on(Events.GuildMemberRemove, async (member) => {
    if (!SENESCAL_ID) return;

    const exec = await findAuditExecutor(member.guild, AuditLogEvent.MemberKick, member.id).catch(() => null);
    if (!exec || exec.executorId !== SENESCAL_ID) return;

    const embed = new EmbedBuilder()
      .setColor("#8B0000")
      .setTitle("👢 Punição: Kick (Senescal)")
      .addFields(
        { name: "Alvo", value: `<@${member.id}> (${member.user.tag})`, inline: false },
        { name: "Motivo", value: exec.reason ? exec.reason.slice(0, 1024) : "*Não informado*", inline: false }
      )
      .setTimestamp()
      .setFooter({ text: "Crônicas de Punições • Cronista" });

    await sendPunishLog(member.guild, embed);
  });
};
