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
      }
    } catch (err) {
      console.error(err);
      const msg = { content: 'Une erreur est survenue.', ephemeral: true };
      if (interaction.deferred || interaction.replied) interaction.followUp(msg).catch(() => {});
      else if (interaction.isRepliable()) interaction.reply(msg).catch(() => {});
    }
  },
};
