const { 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder 
} = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'setup',
  description: 'Destek talebi oluşturma mesajını gönderir',
  async execute(message) {
    if (message.author.id !== config.adminUserId) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Yetersiz Yetki')
        .setDescription('Bu komutu kullanma yetkiniz bulunmuyor.')
        .setColor('#FF6B6B')
        .setTimestamp();
      
      return message.reply({ embeds: [errorEmbed] });
    }

    const supportEmbed = new EmbedBuilder()
      .setTitle('🌟 Destek Merkezi')
      .setDescription(`
        ### Yardıma mı ihtiyacınız var?
        Aşağıdaki butona tıklayarak destek ekibimizle iletişime geçebilirsiniz.
        
        📌 **Destek Kategorileri**
        • <:Staff:1350558215540179025> Teknik Destek
        • <:Youtube:1350558228538331178> Abone SS
        • <:MSP_Profile:1350559569486811206> Genel Sorular
        • <:Warning:1350558881096400946> Hata Bildirimi
        
        <a:Lightning_Blue:1350563698829430884> **Hızlı Bilgiler**
        • Ortalama yanıt süresi: 5 dakika
        • 24/7 aktif destek ekibi
        • Profesyonel çözümler
        
        > *Destek ekibimiz size yardımcı olmak için hazır!*`)
      .setImage('https://i.imgur.com/P8knLlQ.png')
      .setColor(config.embedColor)
      .addFields(
        {
          name: '<:Clock:1350517690032459776> Çalışma Saatleri',
          value: '```• Hafta içi: 09:00 - 00:00\n• Hafta sonu: 10:00 - 02:00```',
          inline: true
        },
        {
          name: '<:stats:1350517794147668008> İstatistikler',
          value: '```• Ortalama Yanıt: 5dk\n• Memnuniyet: %99.8```',
          inline: true
        }
      )
      .setFooter({ 
        text: `${message.guild.name} • Destek Sistemi`, 
        iconURL: message.guild.iconURL() 
      })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('Destek Talebi Oluştur')
          .setEmoji('<:Ticket:1350559981849804840>')
          .setStyle(ButtonStyle.Primary)
      );

    const logEmbed = new EmbedBuilder()
      .setTitle('<:Ticket:1350559981849804840> Sistem Güncellemesi')
      .setDescription(`
        ### Destek Sistemi Güncellendi
        
        **Detaylar**
        • Güncelleyen: ${message.author.tag}
        • Kanal: ${message.channel.name}
        • Tarih: <t:${Math.floor(Date.now() / 1000)}:F>
        
        > Destek sistemi başarıyla kuruldu ve aktif!`)
      .setColor(config.embedColor)
      .setTimestamp();

    const logChannel = message.guild.channels.cache.get(config.logChannelId);
    if (logChannel) {
      await logChannel.send({ embeds: [logEmbed] });
    }

    await message.channel.send({
      embeds: [supportEmbed],
      components: [row]
    });
  }
};