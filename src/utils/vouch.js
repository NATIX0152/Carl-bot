const TRANCHE = 5;
const ROLE_RE = /^Vouch \d+$/;

// Donne le rôle "Vouch N" (N = multiple de 5 atteint), retire les anciens.
async function updateVouchRole(member, count) {
  const tranche = Math.floor(count / TRANCHE) * TRANCHE;
  if (tranche < TRANCHE) return null;
  const name = `Vouch ${tranche}`;
  const guild = member.guild;

  let role = guild.roles.cache.find((r) => r.name === name);
  role ??= await guild.roles.create({ name, color: 0x57f287, reason: 'Palier de vouch atteint' });

  const old = member.roles.cache.filter((r) => ROLE_RE.test(r.name) && r.id !== role.id);
  if (old.size) await member.roles.remove(old, 'Nouveau palier de vouch');
  if (!member.roles.cache.has(role.id)) await member.roles.add(role, 'Palier de vouch atteint');
  return role;
}

module.exports = { updateVouchRole, TRANCHE };
