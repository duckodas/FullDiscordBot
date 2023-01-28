const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const Tickets = require("../../Schemas/Tickets");
const TicketSetup = require("../../Schemas/TicketSetup");

module.exports = {
  id: "close_ticket",
  cooldown: 10000,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, channel, member } = interaction;
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

    if (TicketsDB.Closed == true)
      return i.reply({
        content: `> **Alert:** Ticket already closed`,
        ephemeral: true,
      });

    if (TicketsDB.Deleted == true)
      return i.reply({
        content: `> **Alert:** Ticket has deleted can't use any actions`,
        ephemeral: true,
      });

    await i.reply({
      content: `> **Alert:** You closed the ticket`,
      ephemeral: true,
    });

    channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Yellow")
          .setDescription(`Ticket closed by ${member}.`),
      ],
    });

    channel
      .edit({ parent: TicketSetupDB.ClosedCategoryID })
      .then(async (channel) => {
        TicketsDB.MembersID.forEach((m) => {
          channel.permissionOverwrites.edit(m, {
            ViewChannel: false,
            SendMessages: false,
            ReadMessageHistory: false,
          });
        });
      });
    const supportpanel = await channel.send({
      embeds: [
        new EmbedBuilder().setColor("#303135").setDescription(
          `
            \`-\` Want to save the ticket please press "Archive Ticket"
            \`-\` Want to open the ticket again after you closed it press re-open
            \`-\` Want to delete the ticket press "Delete"!
          `
        ),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`archive_ticket`)
            .setLabel(`Archive Ticket`)
            .setEmoji("📦")
            .setStyle(ButtonStyle.Secondary),
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

    await Tickets.findOneAndUpdate(
      {
        ChannelID: channel.id,
      },
      { Closed: true, MessageID: supportpanel.id }
    );
  },
};
