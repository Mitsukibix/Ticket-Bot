const { deleteTicket } = require('../utils/ticketUtils');
const config = require('../../config.json');

module.exports = {
  name: 'delete',
  aliases: ['sil'],
  description: 'Destek kanalını siler',
  async execute(message) {
    try {
      if (!message.member?.roles.cache.has(config.supportRoleId)) {
        return message.reply('❌ Bu komutu kullanma yetkiniz yok!');
      }

      if (!message.channel.name.startsWith('ticket-')) {
        return message.reply('❌ Bu komut sadece destek kanallarında kullanılabilir!');
      }

      await deleteTicket(message);
    } catch (error) {
      console.error('Delete command error:', error);
      await message.reply('❌ Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  }
};