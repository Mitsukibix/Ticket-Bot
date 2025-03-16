const { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'başka',
  description: 'Başka soru kontrolü yapar',
  async execute(message) {
    if (!message.member.roles.cache.has(config.supportRoleId)) {
      return message.reply('Bu komutu kullanma yetkiniz yok!');
    }

    if (!message.channel.name.startsWith('ticket-')) {
      return message.reply('Bu komut sadece destek kanallarında kullanılabilir!');
    }

    const embed = new EmbedBuilder()
      .setTitle('<:faq_badge:1350562589653864468> Başka Soru')
      .setDescription('Başka bir sorunuz var mı? Eğer yoksa destek talebiniz kapatılacaktır.')
      .setColor(config.embedColor)
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Talebi Kapat')
      .setEmoji('<:lock_IDS:1350561475806367744>')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
};