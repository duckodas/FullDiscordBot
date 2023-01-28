const {
  EmbedBuilder,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const Suggestions = require("../../Schemas/Suggestions");
const SuggestionSetup = require("../../Schemas/SuggestionSetup");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`suggest-manage`)
    .setDescription(`Manage a suggestion by accepting or declinding them`)
    .addStringOption((option) => {
      return option
        .setName(`action`)
        .setDescription(`Chose a specific action to use`)
        .setRequired(true)
        .addChoices(
          { name: `accept`, value: `accept` },
          { name: `decline`, value: `decline` },
          { name: `un-respond`, value: `un-respond` }
        );
    })
    .addStringOption((option) => {
      return option
        .setName(`message-id`)
        .setDescription(`Provide a suggestion message id`)
        .setRequired(true);
    }),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { guild, channel, options, member } = interaction;
    const i = interaction;

    const messageId = options.getString("message-id");
    const action = options.getString("action");

    const SuggestionsDB = await Suggestions.findOne({
      GuildID: guild.id,
      ChannelID: channel.id,
      MessageID: messageId,
    });
    if (!SuggestionsDB)
      return i.reply({
        content: `> **Warning:** Couldn't find any data on this suggestion:/`,
        ephemeral: true,
      });

    const SuggestionSetupDB = await SuggestionSetup.findOne({
      GuildID: guild.id,
    });
    if (!SuggestionSetupDB)
      return i.reply({
        content: `> **Warning:** Couldn't find any data on this system:/`,
        ephemeral: true,
      });

    if (!member.roles.cache.find((r) => r.id === SuggestionSetupDB.ManagerRole))
      return interaction.reply({
        content: `> **Warning:** Your not allowed to use these actions!`,
        ephemeral: true,
      });

    const SuggestChannel = guild.channels.cache.get(
      SuggestionSetupDB.SuggestChannel
    );
    const SuggestMessage = await SuggestChannel.messages.fetch(
      SuggestionsDB.MessageID
    );

    const Buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("Upvote")
        .setLabel("✅")
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("Downvote")
        .setLabel("❌")
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("Delete")
        .setLabel("🔒")
        .setStyle(ButtonStyle.Danger)
    );

    const Embed = EmbedBuilder.from(SuggestMessage.embeds[0]);

    switch (action) {
      case "accept":
        {
          if (SuggestionsDB.Accepted == true)
            return i.reply({
              content: `> **Warning:** This suggestion is already accepted`,
              ephemeral: true,
            });
          Embed.setColor(SuggestionSetupDB.AcceptColor);
          Embed.setFooter({ text: `Accepted By ${member.user.tag} at` });
          Embed.setTimestamp();
          Embed.data.fields[3] = {
            name: "**Status**:",
            value: `\`\`\`Accepted\`\`\``,
            inline: true,
          };

          await SuggestMessage.edit({
            content: `<@${SuggestionsDB.MemberID}>`,
            embeds: [Embed],
            components: [Buttons],
          });
          await Suggestions.findOneAndUpdate(
            { GuildID: guild.id, ChannelID: channel.id, MessageID: messageId },
            { Declined: false, Accepted: true }
          );
          i.reply({
            content: `> **Success:** You accepted the suggestion`,
            ephemeral: true,
          });
        }
        break;
      case "decline":
        {
          if (SuggestionsDB.Declined == true)
            return i.reply({
              content: `> **Warning:** This suggestion is already declined`,
              ephemeral: true,
            });
          Embed.setColor(SuggestionSetupDB.DeclineColor);
          Embed.setFooter({ text: `Declined By ${member.user.tag} at` });
          Embed.setTimestamp();
          Embed.data.fields[3] = {
            name: "**Status**:",
            value: `\`\`\`Declined\`\`\``,
            inline: true,
          };

          await SuggestMessage.edit({
            content: `<@${SuggestionsDB.MemberID}>`,
            embeds: [Embed],
            components: [Buttons],
          });
          await Suggestions.findOneAndUpdate(
            { GuildID: guild.id, ChannelID: channel.id, MessageID: messageId },
            { Declined: true, Accepted: false }
          );
          interaction.reply({
            content: `> **Success** You declined the suggestion`,
            ephemeral: true,
          });
        }
        break;
      case "un-respond":
        {
          if (SuggestionsDB.Accepted || SuggestionsDB.Declined == false)
            return i.reply({
              content: `> **Warning:** Suggestion isn't accepted or declined`,
              ephemeral: true,
            });

          Embed.setFooter({ text: `Suggestion started again at` });
          Embed.setTimestamp();
          Embed.setColor(SuggestionSetupDB.embedColor);
          Embed.data.fields[3] = {
            name: "**Status**:",
            value: `\`\`\`Pending\`\`\``,
            inline: true,
          };

          await SuggestMessage.edit({
            content: `** **`,
            embeds: [Embed],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("Upvote")
                  .setLabel("✅")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("Downvote")
                  .setLabel("❌")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("Delete")
                  .setLabel("🔒")
                  .setStyle(ButtonStyle.Danger)
              ),
            ],
          });
          await Suggestions.findOneAndUpdate(
            { GuildID: guild.id, ChannelID: channel.id, MessageID: messageId },
            { Declined: false, Accepted: false }
          );
          i.reply({
            content: `> **Success:** You started the suggestion again!`,
            ephemeral: true,
          });
        }
        break; // End of respond
    }
  },
};
