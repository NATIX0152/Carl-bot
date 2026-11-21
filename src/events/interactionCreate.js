const { Events, MessageFlags } = require('discord.js');
const { createTicket, parseTopic, isStaff } = require('../utils/tickets');

const fail = (i, content = '❌ Une erreur est survenue.') =>
  (i.deferred || i.replied ? i.followUp({ content, flags: MessageFlags.Ephemeral }) : i.reply({ content, flags: MessageFlags.Ephemeral })).catch(() => {});

module.exports = {
  name: Events.InteractionCreate,
  async execute(client, interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (cmd) await cmd.execute(interaction);
      } else if (interaction.isModalSubmit() && interaction.customId.startsWith('panel:')) {
        await client.commands.get('panelticket').handleModal(interaction);
      } else if (interaction.isButton()) {
        if (interaction.customId.startsWith('ticket_open:')) {
          const [, staffRoleId, categoryId] = interaction.customId.split(':');
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });
          const { channel, existed } = await createTicket({
            guild: interaction.guild,
            user: interaction.user,
            reason: 'Ticket ouvert depuis le panel.',
            staffRoleId: staffRoleId === '0' ? null : staffRoleId,
            categoryId: categoryId === '0' ? null : categoryId,
          });
          await interaction.editReply(existed ? `⚠️ Tu as déjà un ticket : ${channel}` : `✅ Ticket créé : ${channel}`);
        } else if (interaction.customId === 'ticket_close') {
          const info = parseTopic(interaction.channel);
          if (!info) return;
          if (!isStaff(interaction.member, interaction.channel) && interaction.user.id !== info.ownerId) {
            return interaction.reply({ content: '❌ Tu ne peux pas fermer ce ticket.', flags: MessageFlags.Ephemeral });
          }
          await interaction.reply('🔒 Ticket fermé, suppression du salon dans 5 secondes...');
          setTimeout(() => interaction.channel.delete('Ticket fermé').catch(() => {}), 5000);
        }
      }
    } catch (e) {
      console.error('[interaction]', e);
      await fail(interaction, e.code === 50013 ? '❌ Il me manque des permissions (Gérer les salons / rôles).' : undefined);
    }
  },
};
