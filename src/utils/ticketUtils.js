const { 
  ChannelType, 
  PermissionFlagsBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');
const config = require('../../config.json');
const logger = require('./logger');

async function createTicket(interaction) {
  try {
    if (!interaction?.guild || !interaction?.user) {
      logger.error('Invalid interaction object');
      return null;
    }

    const guild = interaction.guild;
    const user = interaction.user;

    const existingTicket = guild.channels.cache.find(
      channel => channel.name === `ticket-${user.username.toLowerCase()}`
    );

    if (existingTicket) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('<:Warning:1350558881096400946> Aktif Destek Talebi')
        .setDescription(`Zaten açık bir destek talebiniz bulunuyor: ${existingTicket}`)
        .setColor('#FF6B6B')
        .setTimestamp();

      await interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true
      });
      return null;
    }

    let category = guild.channels.cache.find(
      c => c.name === config.ticketCategory && c.type === ChannelType.GuildCategory
    );

    if (!category) {
      category = await guild.channels.create({
        name: config.ticketCategory,
        type: ChannelType.GuildCategory
      });
    }

    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      parent: category,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel, 
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        },
        {
          id: config.supportRoleId,
          allow: [
            PermissionFlagsBits.ViewChannel, 
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages
          ]
        }
      ]
    });

    const welcomeEmbed = new EmbedBuilder()
      .setTitle('<:Ticket:1350559981849804840> Yeni Destek Talebi')
      .setDescription(`
        ### Hoş Geldiniz ${user.toString()}! 
        
        Destek ekibimiz sizinle ilgilenecektir. Lütfen aşağıdaki bilgileri dikkate alın:
        
        <:MSP_Profile:1350559569486811206> **Nasıl Yardımcı Olabiliriz?**
        • Sorununuzu detaylı bir şekilde açıklayın
        • Mümkünse ekran görüntüleri paylaşın
        • Sabırlı olun, ekibimiz en kısa sürede size dönüş yapacaktır
        
        <a:Lightning_Blue:1350563698829430884> **Hızlı Bilgi**
        • Destek ekibimiz online ve hazır
        • Ortalama yanıt süremiz: 5-10 dakika
        • Acil durumlar önceliklidir`)
      .addFields(
        { 
          name: '<:member:1350517770051260578> Talep Sahibi', 
          value: user.tag, 
          inline: true 
        },
        { 
          name: '<:Clock:1350517690032459776> Oluşturulma', 
          value: `<t:${Math.floor(Date.now() / 1000)}:R>`, 
          inline: true 
        },
        {
          name: '<:Ticket:1350559981849804840> Talep ID',
          value: ticketChannel.id.slice(-8),
          inline: true
        }
      )
      .setColor(config.embedColor)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ 
        text: `${guild.name} • Destek Sistemi`, 
        iconURL: guild.iconURL() 
      })
      .setTimestamp();

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('claim_ticket')
          .setLabel('Talebi Üstlen')
          .setEmoji('👋')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Talebi Kapat')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Danger)
      );

    const notificationEmbed = new EmbedBuilder()
      .setTitle('📬 Yeni Destek Talebi')
      .setDescription(`${user.toString()} bir destek talebi oluşturdu!`)
      .setColor('#2ECC71')
      .setTimestamp();

    await ticketChannel.send({
      content: `<@&${config.supportRoleId}>`,
      embeds: [welcomeEmbed],
      components: [buttons]
    });

    await logAction(guild, '<:Ticket:1350559981849804840> Yeni Talep', `${user.tag} yeni bir destek talebi oluşturdu`);
    logger.info(`Yeni destek talebi: ${user.tag}`);
    
    const successEmbed = new EmbedBuilder()
      .setTitle('✅ Talep Oluşturuldu')
      .setDescription(`Destek talebiniz başarıyla oluşturuldu: ${ticketChannel}`)
      .setColor('#2ECC71')
      .setTimestamp();

    await interaction.reply({
      embeds: [successEmbed],
      ephemeral: true
    });

    return ticketChannel;
  } catch (error) {
    logger.error('Error creating ticket:', error);
    const errorEmbed = new EmbedBuilder()
      .setTitle('❌ Hata')
      .setDescription('Destek talebi oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
      .setColor('#FF6B6B')
      .setTimestamp();

    try {
      await interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true
      });
    } catch (replyError) {
      logger.error('Error sending error reply:', replyError);
    }
    return null;
  }
}

async function showCloseModal(interaction) {
  try {
    const modal = new ModalBuilder()
      .setCustomId('close_ticket_modal')
      .setTitle('🔒 Destek Talebini Kapat');

    const reasonInput = new TextInputBuilder()
      .setCustomId('close_reason')
      .setLabel('Kapatma Nedeni')
      .setPlaceholder('Örn: Sorun çözüldü, kullanıcı yardımcı oldu...')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(1000);

    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  } catch (error) {
    logger.error('Error showing close modal:', error);
  }
}

async function handleTicketClose(source, reason, isMessage = false) {
  try {
    if (!source?.channel) {
      logger.error('Invalid source object or missing channel');
      return;
    }

    const channel = source.channel;
    const user = isMessage ? source.author : source.user;

    if (!user?.tag) {
      logger.error('Invalid user object or missing tag');
      return;
    }

    const closeEmbed = new EmbedBuilder()
      .setTitle('<:lock_IDS:1350561475806367744> Talep Kapatıldı')
      .setDescription(`
        ### Destek Talebi Kapatıldı
        
        **Talep Bilgileri**
        • Kapatan: ${user.toString()}
        • Tarih: <t:${Math.floor(Date.now() / 1000)}:F>
        • Kanal: ${channel.name}
        
        **Kapatma Nedeni**
        \`\`\`${reason}\`\`\`
        
        > Talep 24 saat sonra otomatik olarak silinecektir.`)
      .setColor('#FF6B6B')
      .setFooter({ 
        text: `Talep ID: ${channel.id.slice(-8)}`, 
        iconURL: channel.guild.iconURL() 
      })
      .setTimestamp();

    const channelName = channel.name.split('-')[1];
    if (!channelName) {
      logger.error('Invalid channel name format');
      return;
    }

    const member = channel.guild.members.cache.find(
      m => m.user.username.toLowerCase() === channelName.toLowerCase()
    );

    if (member) {
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle('<:Warning:1350558881096400946> Destek Talebiniz Kapatıldı')
          .setDescription(`
            ### Talep Bilgileri
            
            • Sunucu: ${channel.guild.name}
            • Kapatan: ${user.tag}
            • Tarih: <t:${Math.floor(Date.now() / 1000)}:F>
            
            **Kapatma Nedeni**
            \`\`\`${reason}\`\`\`
            
            > Yeni bir sorunuz olursa yeni talep açabilirsiniz!`)
          .setColor('#FF6B6B')
          .setThumbnail(channel.guild.iconURL())
          .setTimestamp();

        await member.send({ embeds: [dmEmbed] });
        await channel.permissionOverwrites.edit(member.id, {
          ViewChannel: false
        });
      } catch (error) {
        logger.warn(`DM gönderilemedi: ${member.user.tag}`, error);
      }
    }

    const deleteButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('delete_ticket')
          .setLabel('Talebi Sil')
          .setEmoji('🗑️')
          .setStyle(ButtonStyle.Danger)
      );

    try {
      if (isMessage) {
        await channel.send({
          embeds: [closeEmbed],
          components: [deleteButton]
        });
      } else {
        await source.reply({
          embeds: [closeEmbed],
          components: [deleteButton]
        });
      }
    } catch (error) {
      logger.error('Error sending close message:', error);
      const fallbackMessage = await channel.send({
        embeds: [closeEmbed],
        components: [deleteButton]
      });
      logger.info('Sent fallback close message:', fallbackMessage.id);
    }

    await logAction(
      channel.guild,
      '🔒 Talep Kapatıldı',
      `${user.tag} bir talebi kapattı\nNeden: ${reason}`
    );
    
    logger.info(`Talep kapatıldı: ${user.tag}`);
  } catch (error) {
    logger.error('Error closing ticket:', error);
    const errorEmbed = new EmbedBuilder()
      .setTitle('❌ Hata')
      .setDescription('Talep kapatılırken bir hata oluştu.')
      .setColor('#FF6B6B')
      .setTimestamp();

    try {
      if (isMessage) {
        await source.reply({ embeds: [errorEmbed] });
      } else {
        await source.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    } catch (replyError) {
      logger.error('Error sending error response:', replyError);
    }
  }
}

async function claimTicket(interaction) {
  try {
    if (!interaction.member?.roles.cache.has(config.supportRoleId)) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Yetersiz Yetki')
        .setDescription('Destek taleplerini üstlenme yetkiniz bulunmuyor.')
        .setColor('#FF6B6B')
        .setTimestamp();

      return interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true
      });
    }

    const claimEmbed = new EmbedBuilder()
      .setTitle('👋 Talep Üstlenildi')
      .setDescription(`
        ### Destek Ekibi Yanınızda!
        
        ${interaction.user.toString()} artık sizinle ilgileniyor.
        Lütfen sabırlı olun ve sorununuzu detaylı bir şekilde açıklayın.
        
        **Bilgilendirme**
        • Ekip üyemiz size yardımcı olacak
        • Çözüm sürecinde aktif kalın
        • Ek sorularınızı çekinmeden sorun`)
      .setColor('#2ECC71')
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await interaction.reply({ embeds: [claimEmbed] });

    await logAction(
      interaction.guild,
      '👋 Talep Üstlenildi',
      `${interaction.user.tag} bir talebi üstlendi`
    );

    logger.info(`Talep üstlenildi: ${interaction.user.tag}`);
  } catch (error) {
    logger.error('Error claiming ticket:', error);
    const errorEmbed = new EmbedBuilder()
      .setTitle('❌ Hata')
      .setDescription('Talep üstlenilirken bir hata oluştu.')
      .setColor('#FF6B6B')
      .setTimestamp();

    try {
      await interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true
      });
    } catch (replyError) {
      logger.error('Error sending error response:', replyError);
    }
  }
}

async function deleteTicket(source) {
  try {
    const isInteraction = source.isButton?.();
    const member = isInteraction ? source.member : source.member;
    const channel = isInteraction ? source.channel : source.channel;
    const user = isInteraction ? source.user : source.author;

    if (!member || !channel || !user) {
      logger.error('Invalid source object for delete ticket');
      return;
    }

    if (!member.roles.cache.has(config.supportRoleId)) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Yetersiz Yetki')
        .setDescription('Destek taleplerini silme yetkiniz bulunmuyor.')
        .setColor('#FF6B6B')
        .setTimestamp();

      if (isInteraction) {
        await source.reply({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await source.reply({ embeds: [errorEmbed] });
      }
      return;
    }

    if (!channel.name.startsWith('ticket-')) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Geçersiz Kanal')
        .setDescription('Bu komut sadece destek kanallarında kullanılabilir.')
        .setColor('#FF6B6B')
        .setTimestamp();

      if (isInteraction) {
        await source.reply({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await source.reply({ embeds: [errorEmbed] });
      }
      return;
    }

    const deleteEmbed = new EmbedBuilder()
      .setTitle('🗑️ Talep Siliniyor')
      .setDescription(`
        ### Talep Silme İşlemi
        
        Bu destek talebi 5 saniye içinde silinecektir.
        
        **Bilgiler**
        • Silen: ${user.toString()}
        • Kanal: ${channel.name}
        • Tarih: <t:${Math.floor(Date.now() / 1000)}:F>`)
      .setColor('#FF6B6B')
      .setTimestamp();

    await logAction(
      channel.guild,
      '🗑️ Talep Silindi',
      `${user.tag} bir talebi sildi`
    );

    logger.info(`Talep silindi: ${user.tag}`);

    if (isInteraction) {
      await source.reply({ embeds: [deleteEmbed], ephemeral: true });
    } else {
      await source.reply({ embeds: [deleteEmbed] });
    }

    setTimeout(() => channel.delete().catch(error => {
      logger.error('Error deleting channel:', error);
    }), 5000);

  } catch (error) {
    logger.error('Error deleting ticket:', error);
    const errorEmbed = new EmbedBuilder()
      .setTitle('❌ Hata')
      .setDescription('Talep silinirken bir hata oluştu.')
      .setColor('#FF6B6B')
      .setTimestamp();

    try {
      if (source.isButton?.()) {
        await source.reply({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await source.reply({ embeds: [errorEmbed] });
      }
    } catch (replyError) {
      logger.error('Error sending error response:', replyError);
    }
  }
}

async function logAction(guild, title, description) {
  try {
    if (!guild?.channels?.cache) {
      logger.error('Invalid guild object');
      return;
    }

    const logChannel = guild.channels.cache.get(config.logChannelId);
    if (!logChannel) {
      logger.warn('Log kanalı bulunamadı');
      return;
    }

    const logEmbed = new EmbedBuilder()
      .setTitle(`${title}`)
      .setDescription(`
        ### ${title}
        
        **Detaylar**
        ${description}
        
        **Zaman**
        <t:${Math.floor(Date.now() / 1000)}:F>`)
      .setColor(config.embedColor)
      .setFooter({ 
        text: 'Destek Sistemi Logları', 
        iconURL: guild.iconURL() 
      })
      .setTimestamp();

    await logChannel.send({ embeds: [logEmbed] });
  } catch (error) {
    logger.error('Error logging action:', error);
  }
}

module.exports = {
  createTicket,
  handleTicketClose,
  claimTicket,
  deleteTicket,
  logAction,
  showCloseModal
};