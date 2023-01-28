const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Tickets = require("../../Schemas/Tickets");
const TicketSetup = require("../../Schemas/TicketSetup");
const TicketCount = require("../../Schemas/TicketCount");

module.exports = {
  id: "createTicket",
  cooldown: 10000,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member } = interaction;
    const i = interaction;

    const TicketSetupDB = await TicketSetup.findOne({ GuildID: guild.id });
    if (!TicketSetupDB)
      return i.reply({
        content: `> **Alert:** Can't find any data on the setup:/`,
        ephemeral: true,
      });

    const TicketCountDB = TicketCount.findOne({ GuildID: guild.id });
    const Count = ((await TicketCountDB.countDocuments()) + 1).toString();

    const TicketLimit = await Tickets.findOne({
      GuildID: guild.id,
      Creator: member.id,
      Closed: false,
    });
    if (TicketLimit)
      return i.reply({
        content: `> **Warning:** You already have a ticket open`,
        ephemeral: true,
      });

    await guild.channels
      .create({
        name: `${"Ticket" + "-" + interaction.user.username + "-" + Count}`,
        topic: `**Your ID:** ${member.id}\n**Ticket ID:** ${Count}`,
        parent: TicketSetupDB.OpenCategoryID,
        permissionOverwrites: [
          {
            id: member.id,
            allow: [
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
          {
            id: TicketSetupDB.SupportRoleID,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.ManageMessages,
            ],
          },
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.ManageMessages,
            ],
          },
        ],
      })
      .then(async (channel) => {
        await Tickets.create({
          GuildID: guild.id,
          ChannelID: channel.id,
          TicketID: Count,
          CreatorID: member.user.id,
          CreatorTag: member.user.tag,
          MembersID: member.id,
          CreatedAt: new Date().toLocaleString(),
          Deleted: false,
          Closed: false,
          Archived: false,
          MessageID: false,
        })
          .then(async () => {
            await TicketCount.create({
              GuildID: guild.id,
              TicketCount: Count,
            });
          })
          .then(async () => {
            channel.setRateLimitPerUser(3);
          });
        channel.setPosition(0);

        const Embed = new EmbedBuilder()
          .setColor("#5865F2")
          .setAuthor({
            name: `${guild.name} | Ticket ID: ${Count}`,
            icon: guild.iconURL({ dynamic: true }),
          })
          .addFields({
            name: `Information`,
            value: `\`-\` Provide as much details as possible!\n\`-\` Provide a reason for the ticket!`,
          });

        await channel.send({
          embeds: [Embed],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`close_ticket`)
                .setEmoji("⛔")
                .setStyle(ButtonStyle.Secondary)
            ),
          ],
        });

        await channel
          .send({
            content: `${member}`,
          })
          .then((message) => {
            setTimeout(() => {
              message.delete().catch(() => {});
            }, 5 * 1000);
          });

        await i.reply({
          content: `Your ticket has been created: ${channel}!`,
          ephemeral: true,
        });
      });
  },
};
