const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const Tickets = require("../../Schemas/Tickets");
const TicketSetup = require("../../Schemas/TicketSetup");

module.exports = {
  id: "archive_ticket",
  cooldown: 10000,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, channel, member, message } = interaction;
    const i = interaction;

    const TicketSetupDB = await TicketSetup.findOne({
      GuildId: guild.id,
    });
    if (!TicketSetupDB)
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#303135")
            .setDescription(`Can't find any data on the ticket system:/`),
        ],
        ephemeral: true,
      });

    const TicketsDB = await Tickets.findOne({
      GuildId: guild.id,
      ChannelID: channel.id,
    });
    if (!TicketsDB)
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#303135")
            .setDescription(`Can't find any data on this ticket:/`),
        ],
        ephemeral: true,
      });

    if (!member.roles.cache.find((r) => r.id === TicketSetupDB.SupportRoleID))
      return i.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#303135")
            .setDescription(`Your not allowed to use this action!`),
        ],
        ephemeral: true,
      });

    if (TicketsDB.Deleted == true)
      return i.reply({
        content: `> **Alert:** Ticket has deleted can't use any actions`,
        ephemeral: true,
      });

    if (TicketsDB.Archived == true)
      return i.reply({
        content: `> **Alert:** Ticket already archived`,
        ephemeral: true,
      });

    await i.reply({
      content: `> **Alert:** You archived the ticket`,
      ephemeral: true,
    });

    channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription(`Ticket archived by ${member}.`),
      ],
    });
    const supportpanel = await channel.send({
      embeds: [
        new EmbedBuilder().setColor("#303135").setDescription(
          `
              \`-\` Want to open the ticket again after you closed it press re-open
              \`-\` Want to delete the ticket press "Delete"!
              `
        ),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`open_ticket`)
            .setLabel(`Re-open`)
            .setEmoji("💬")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`delete_ticket`)
            .setLabel(`Delete`)
            .setEmoji("⛔")
            .setStyle(ButtonStyle.Danger)
        ),
      ],
    });

    channel.edit({ parent: TicketSetupDB.ArchiveCategoryID });
    message.delete(TicketsDB.MessageID);

    await Tickets.findOneAndUpdate(
      {
        ChannelID: channel.id,
      },
      { Archived: true, MessageID: supportpanel.id }
    );
  },
};
