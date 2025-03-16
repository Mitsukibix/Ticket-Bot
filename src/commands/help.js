const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'help',
  aliases: ['yardim', 'yardım'],
  description: 'Komut listesini gösterir',
  async execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('<:MSP_Profile:1350559569486811206> Komut Listesi')
      .setColor(config.embedColor)
      .addFields(
        { 
          name: '<:Staff:1350558215540179025> Yetkili Komutları', 
          value: 
            '`.setup` - Destek talebi oluşturma mesajını gönderir\n' +
            '`.sil` - Destek kanalını siler\n' +
            '`.başka` - Başka soru kontrolü yapar'
        },
        { 
          name: '<:member:1350517770051260578> Kullanıcı Komutları', 
          value: 
            '`.kapat` - Destek talebini kapatır\n' +
            '`.yardım` - Bu mesajı gösterir'
        }
      )
      .setFooter({ 
        text: 'Destek Sistemi', 
        iconURL: message.guild.iconURL() 
      })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};