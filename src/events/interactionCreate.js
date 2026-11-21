const {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder,
} = require('discord.js');
const config = require('../config');
const catalog = require('../catalog');
const { isStaff } = require('../utils/staff');
const { createTicket, ticketEmbed, staffButtons, sendTranscript } = require('../utils/ticket');

function offerFromTopic(channel) {
  const [, userId, offerId] = channel.topic.split(':');
  return { userId, offer: catalog.find((o) => o.id === offerId) };
}

async function updateStatus(interaction, status) {
  const { userId, offer } = offerFromTopic(interaction.channel);
  const method = interaction.message.embeds[0].fields[3].name.includes('PayPal') ? 'paypal' : 'litecoin';
  await interaction.update({
    embeds: [ticketEmbed(offer, method, userId, status)],
    components: [staffButtons(status === 'paid' ? { paid: true } : { paid: true, done: true })],
  });
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (interaction.isAutocomplete()) {
        const cmd = client.commands.get(interaction.commandName);
        if (cmd?.autocomplete) await cmd.autocomplete(interaction);
        return;
      }

      if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (cmd) await cmd.execute(interaction);
        return;
      }

      if (interaction.isButton()) {
        const id = interaction.customId;

        if (id === 'order:start') {
          const menu = new StringSelectMenuBuilder()
            .setCustomId('order:offer')
            .setPlaceholder('Choisis ton boost')
            .addOptions(catalog.map((o) => ({
              label: `${o.label} — ${o.price} €`, description: o.description, value: o.id,
            })));
          return interaction.reply({ content: 'Quel boost veux-tu ?', components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
        }

        if (id.startsWith('order:pay:')) {
          const [, , offerId, method] = id.split(':');
          await interaction.deferUpdate();
          const res = await createTicket(interaction, offerId, method);
          const content = res.existing
            ? `Tu as déjà un ticket ouvert : ${res.existing}`
            : `Ticket créé : ${res.channel} ✅`;
          return interaction.editReply({ content, components: [] });
        }

        if (id.startsWith('ticket:')) {
          if (!isStaff(interaction.member)) {
            return interaction.reply({ content: 'Réservé au staff.', ephemeral: true });
          }
          if (id === 'ticket:paid') return updateStatus(interaction, 'paid');
          if (id === 'ticket:done') return updateStatus(interaction, 'done');
          if (id === 'ticket:close') {
            await interaction.reply('Fermeture du ticket dans 5 secondes…');
            await sendTranscript(interaction.channel).catch(console.error);
            setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
          }
        }
        return;
      }

      if (interaction.isStringSelectMenu() && interaction.customId === 'order:offer') {
        const offerId = interaction.values[0];
        const row = new ActionRowBuilder().addComponents(
          ...Object.entries(config.payments).map(([key, p]) =>
            new ButtonBuilder().setCustomId(`order:pay:${offerId}:${key}`).setLabel(p.label).setEmoji(p.emoji).setStyle(ButtonStyle.Secondary)),
        );
        return interaction.update({ content: 'Choisis ton moyen de paiement :', components: [row] });
      }
    } catch (err) {
      console.error(err);
      const msg = { content: 'Une erreur est survenue.', ephemeral: true };
      if (interaction.deferred || interaction.replied) interaction.followUp(msg).catch(() => {});
      else interaction.reply(msg).catch(() => {});
    }
  },
};
