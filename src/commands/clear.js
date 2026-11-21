const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Supprimer des messages dans ce salon')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setContexts(0)
  .addIntegerOption((o) => o.setName('nombre').setDescription('Nombre de messages (1-100)').setMinValue(1).setMaxValue(100).setRequired(true));

async function execute(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    const deleted = await interaction.channel.bulkDelete(interaction.options.getInteger('nombre'), true);
    await interaction.editReply(`🧹 ${deleted.size} message(s) supprimé(s). (Discord ne permet pas de supprimer en masse les messages de plus de 14 jours.)`);
  } catch {
    await interaction.editReply('❌ Impossible de supprimer (permission « Gérer les messages » manquante ?).');
  }
}

module.exports = { data, execute };
