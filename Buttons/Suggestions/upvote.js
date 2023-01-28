const { EmbedBuilder } = require("discord.js");
const Suggestions = require("../../Schemas/Suggestions");
const SuggestionSetup = require("../../Schemas/SuggestionSetup");

module.exports = {
  id: "Upvote",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const SuggestionsDB = await Suggestions.findOne({
      GuildID: interaction.guild.id,
      ChannelID: interaction.channel.id,
      MessageID: interaction.message.id,
    });
    if (!SuggestionsDB)
      return interaction.reply({
        content: `> **Warning:** Couldn't find any data on this suggestion:/`,
        ephemeral: true,
      });

    const SuggestionSetupDB = await SuggestionSetup.findOne({
      GuildID: interaction.guild.id,
    });
    if (!SuggestionSetupDB)
      return interaction.reply({
        content: `> **Warning:** Couldn't find any data on this system:/`,
        ephemeral: true,
      });

    const Embed = EmbedBuilder.from(interaction.message.embeds[0]);

    if (SuggestionsDB.Downvotes.includes(interaction.user.id))
      return interaction.reply({
        content: `> **Alert:** Please remove your downvote first, before upvoting`,
        ephemeral: true,
      });

    if (SuggestionsDB.Upvotes.includes(interaction.user.id)) {
      await Suggestions.findOneAndUpdate(
        {
          GuildID: interaction.guild.id,
          ChannelID: interaction.channel.id,
          MessageID: interaction.message.id,
        },
        { $pull: { Upvotes: interaction.user.id } }
      );

      Embed.data.fields[1] = {
        name: `Upvotes:`,
        value: `\`\`\`${SuggestionsDB.Upvotes.length - 1}\`\`\``,
        inline: true,
      };

      interaction.message.edit({ embeds: [Embed] });

      return interaction.reply({
        content: `> **Success:** You removed your vote!`,
        ephemeral: true,
      });
    }
    await Suggestions.findOneAndUpdate(
      {
        GuildID: interaction.guild.id,
        ChannelID: interaction.channel.id,
        MessageID: interaction.message.id,
      },
      { $push: { Upvotes: interaction.user.id } }
    ).then(() => {
      Embed.data.fields[1] = {
        name: `Upvotes:`,
        value: `\`\`\`${SuggestionsDB.Upvotes.length + 1}\`\`\``,
        inline: true,
      };

      interaction.message.edit({ embeds: [Embed] });

      return interaction.reply({
        content: `> **Success:** You added your vote!`,
        ephemeral: true,
      });
    });
  },
};
