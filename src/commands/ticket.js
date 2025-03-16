const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  PermissionsBitField
} = require('discord.js');
const config = require('../../config.json');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('destek')
    .setDescription('Destek sistemi komutları')
    .addSubcommand(subcommand =>
      subcommand
        .setName('kur')
        .setDescription('Destek sistemini kurar')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('kapat')
        .setDescription('Mevcut destek talebini kapatır')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('sil')
        .setDescription('Destek kanalını siler')
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: 'Bu komutu kullanmak için yetkiniz bulunmuyor.',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      switch (subcommand) {
        case 'kur':
          await handleSetup(interaction);
          break;
        case 'kapat':
          await handleClose(interaction);
          break;
        case 'sil':
          await handleDelete(interaction);
          break;
      }
    } catch (error) {
      logger.error('Komut çalıştırılırken hata:', error);
      await interaction.reply({
        content: 'Komut çalıştırılırken bir hata oluştu.',
        ephemeral: true
      });
    }
  }
};

async function handleSetup(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('<:Ticket:1350559981849804840> Destek Sistemi')
    .setDescription('Yardıma mı ihtiyacınız var? Aşağıdaki butona tıklayarak destek talebi oluşturabilirsiniz!')
    .setColor(config.embedColor)
    .setFooter({ 
      text: interaction.guild.name, 
      iconURL: interaction.guild.iconURL() 
    })
    .setTimestamp();

  const button = new ButtonBuilder()
    .setCustomId('create_ticket')
    .setLabel('Destek Talebi Oluştur')
    .setEmoji('<:Ticket:1350559981849804840>')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);

  await interaction.reply({
    embeds: [embed],
    components: [row]
  });

  logger.info(`Destek sistemi ${interaction.user.tag} tarafından kuruldu`);
}

async function handleClose(interaction) {
  if (!interaction.channel.name.startsWith('destek-')) {
    return interaction.reply({
      content: 'Bu komut sadece destek kanallarında kullanılabilir.',
      ephemeral: true
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('<:lock_IDS:1350561475806367744> Destek Talebini Kapat')
    .setDescription('Bu destek talebini kapatmak istediğinizden emin misiniz?')
    .setColor(config.embedColor)
    .setTimestamp();

  const button = new ButtonBuilder()
    .setCustomId('confirm_close_ticket')
    .setLabel('Talebi Kapat')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(button);

  await interaction.reply({
    embeds: [embed],
    components: [row]
  });
}

async function handleDelete(interaction) {
  if (!interaction.channel.name.startsWith('destek-')) {
    return interaction.reply({
      content: 'Bu komut sadece destek kanallarında kullanılabilir.',
      ephemeral: true
    });
  }

  await interaction.reply('Bu destek talebi 5 saniye içinde silinecek...');
  setTimeout(() => interaction.channel.delete(), 5000);

  logger.info(`Destek talebi ${interaction.user.tag} tarafından silindi`);
}