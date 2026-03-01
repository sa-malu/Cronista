function isAboveBot(member, botMember) {
  if (!member || !botMember) return false;
  if (member.id === member.guild.ownerId) return true;
  return member.roles.highest.position > botMember.roles.highest.position;
}

module.exports = { isAboveBot };
