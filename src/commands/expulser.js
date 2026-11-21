const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('expulser')
  .setDescription('Expulser un membre')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .setContexts(0)
  .addUserOption((o) => o.setName('membre').setDescription('Membre à expulser').setRequired(true))
  .addStringOption((o) => o.setName('raison').setDescription('Raison de l\'expulsion').setMaxLength(400));

async function execute(interaction) {
  const member = interaction.options.getMember('membre');
  const reason = interaction.options.getString('raison') ?? 'Aucune raison';
  const err = (c) => interaction.reply({ content: c, flags: MessageFlags.Ephemeral });

  if (!member) return err('❌ Ce membre n\'est pas sur le serveur.');
  if (member.id === interaction.user.id) return err('❌ Tu ne peux pas t\'expulser toi-même.');
  if (member.id === interaction.client.user.id) return err('❌ Je ne peux pas m\'expulser.');
  const isOwner = interaction.guild.ownerId === interaction.user.id;
  if (!isOwner && member.roles.highest.position >= interaction.member.roles.highest.position) {
    return err('❌ Ce membre a un rôle supérieur ou égal au tien.');
  }
  if (!member.kickable) return err('❌ Je ne peux pas expulser ce membre (rôle trop haut).');
  try {
    await member.kick(`${interaction.user.tag} : ${reason}`);
  } catch {
    return err('❌ L\'expulsion a échoué.');
  }
  await interaction.reply(`👢 **${member.user.tag}** a été expulsé. Raison : ${reason}`);
}

module.exports = { data, execute };
