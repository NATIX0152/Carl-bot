const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Bannir un membre')
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setContexts(0)
  .addUserOption((o) => o.setName('membre').setDescription('Membre à bannir').setRequired(true))
  .addStringOption((o) => o.setName('raison').setDescription('Raison du ban').setMaxLength(400));

async function execute(interaction) {
  const user = interaction.options.getUser('membre');
  const member = interaction.options.getMember('membre');
  const reason = interaction.options.getString('raison') ?? 'Aucune raison';
  const err = (c) => interaction.reply({ content: c, flags: MessageFlags.Ephemeral });

  if (user.id === interaction.user.id) return err('❌ Tu ne peux pas te bannir toi-même.');
  if (user.id === interaction.client.user.id) return err('❌ Je ne peux pas me bannir.');
  if (member) {
    const isOwner = interaction.guild.ownerId === interaction.user.id;
    if (!isOwner && member.roles.highest.position >= interaction.member.roles.highest.position) {
      return err('❌ Ce membre a un rôle supérieur ou égal au tien.');
    }
    if (!member.bannable) return err('❌ Je ne peux pas bannir ce membre (rôle trop haut).');
  }
  try {
    await interaction.guild.members.ban(user, { reason: `${interaction.user.tag} : ${reason}` });
  } catch {
    return err('❌ Le ban a échoué.');
  }
  await interaction.reply(`🔨 **${user.tag}** a été banni. Raison : ${reason}`);
}

module.exports = { data, execute };
