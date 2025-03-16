const { 
  Events,
  InteractionType,
  EmbedBuilder
} = require('discord.js');
const { 
  createTicket, 
  closeTicket, 
  handleTicketClose,
  claimTicket,
  deleteTicket,
  showCloseModal
} = require('../utils/ticketUtils');
const logger = require('../utils/logger');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
          logger.warn(`No command matching ${interaction.commandName} was found.`);
          return;
        }

        await command.execute(interaction);
      } else if (interaction.isButton()) {
        switch (interaction.customId) {
          case 'create_ticket':
            await createTicket(interaction);
            break;
          case 'close_ticket':
            await showCloseModal(interaction);
            break;
          case 'confirm_close_ticket':
            await showCloseModal(interaction);
            break;
          case 'claim_ticket':
            await claimTicket(interaction);
            break;
          case 'delete_ticket':
            await deleteTicket(interaction);
            break;
        }
      } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'close_ticket_modal') {
          const reason = interaction.fields.getTextInputValue('close_reason');
          await handleTicketClose(interaction, reason);
        }
      }
    } catch (error) {
      logger.error('Error handling interaction:', error);
      
      const errorMessage = {
        content: '❌ Bu komutu çalıştırırken bir hata oluştu!',
        ephemeral: true
      };

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      } catch (e) {
        logger.error('Error sending error message:', e);
      }
    }
  }
};