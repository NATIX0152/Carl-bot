// Remplace {user} {username} {server} {count} dans un message d'arrivée/départ
function formatTemplate(tpl, member) {
  return tpl
    .replaceAll('{user}', `<@${member.id}>`)
    .replaceAll('{username}', member.user.username)
    .replaceAll('{server}', member.guild.name)
    .replaceAll('{count}', String(member.guild.memberCount));
}

module.exports = { formatTemplate };
