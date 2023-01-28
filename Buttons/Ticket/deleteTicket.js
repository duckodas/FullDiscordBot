const { EmbedBuilder } = require("discord.js");
const Tickets = require("../../Schemas/Tickets");
const TicketSetup = require("../../Schemas/TicketSetup");
const TicketCount = require("../../Schemas/TicketCount");
const { createTranscript } = require("discord-html-transcripts");

module.exports = {
  id: "delete_ticket",
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

    const TicketCountDB = TicketCount.findOne({ GuildID: guild.id });
    const Count = (await TicketCountDB.countDocuments()).toString();

    const TChannel = guild.channels.cache.get(TicketSetupDB.TranscriptID);

    const attachment = await createTranscript(channel, {
      limit: -1,
      returnType: "attachment",
      saveImages: true,
      minify: true,
      fileName: `Ticket-${TicketsDB.CreatorTag}-${Count}.html`,
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
        content: `> **Alert:** Ticket already deleted`,
        ephemeral: true,
      });

    await i.reply({
      content: `> **Alert:** You deleted the ticket`,
      ephemeral: true,
    });

    await Tickets.findOneAndUpdate(
      {
        ChannelID: channel.id,
      },
      { Closed: true, Deleted: true, Archived: true }
    );

    channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription(`Ticket will be deleted in \`5\` seconds!`),
      ],
    });

    TicketsDB.MembersID.forEach((m) => {
      channel.permissionOverwrites.edit(m, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false,
      });
    });

    TChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Blurple")
          .addFields({
            name: `Data:`,
            value: `
            \`-\` **Ticket ID:** ${Count}
            \`-\` **Ticket Creator ID:** ${TicketsDB.CreatorID}
            \`-\` **Ticket Creator:** ${TicketsDB.CreatorTag}
            \`-\` **Ticket Created at:** ${TicketsDB.CreatedAt}
            \`-\` **Closed By:** ${member}`,
          })
          .setFooter({
            text: `Created at ${TicketsDB.CreatedAt}`,
            iconURL: guild.iconURL(),
          }),
      ],
      files: [attachment],
    });
    setTimeout(() => {
      Tickets.findOneAndDelete({
        GuildID: guild.id,
        ChannelID: channel.id,
      }).catch((err) => console.log(err));

      channel.delete();
    }, 5 * 1000);
  },
};
