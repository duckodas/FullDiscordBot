const { EmbedBuilder } = require("discord.js");
const Suggestions = require("../../Schemas/Suggestions");
const SuggestionSetup = require("../../Schemas/SuggestionSetup");

module.exports = {
  id: "Delete",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { channel, guild, member, message } = interaction;
    const i = interaction;
    const SuggestionsDB = await Suggestions.findOne({
      GuildID: guild.id,
      ChannelID: channel.id,
      MessageID: message.id,
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
      return i.reply({
        content: `> **Warning:** Your not allowed to use this button:/`,
        ephemeral: true,
      });

    const Embed = EmbedBuilder.from(i.message.embeds[0]);

    Embed.setColor(SuggestionSetupDB.DeclineColor);
    Embed.data.fields[3] = {
      name: `Status:`,
      value: `\`\`\`Deleted\`\`\``,
      inline: true,
    };

    await Suggestions.findOneAndDelete(
      {
        GuildID: guild.id,
        ChannelID: channel.id,
        MessageID: message.id,
      },
      { GuildID: guild.id }
    );

    message.edit({ embeds: [Embed] });

    i.reply({
      content: `> **Success:** You deleted the suggestion!`,
      ephemeral: true,
    });
  },
};
