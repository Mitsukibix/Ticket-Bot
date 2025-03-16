const { handleTicketClose } = require('../utils/ticketUtils');
const config = require('../../config.json');

module.exports = {
  name: 'close',
  aliases: ['kapat'],
  description: 'Destek talebini kapatır',
  async execute(message) {
    if (!message.channel.name.startsWith('ticket-')) {
      return message.reply('❌ Bu komut sadece destek kanallarında kullanılabilir!');
    }

    await handleTicketClose(message, 'Komut ile kapatıldı', true);
  }
};