const {
  EmbedBuilder,
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const Suggestions = require("../../Schemas/Suggestions");
const SuggestionSetup = require("../../Schemas/SuggestionSetup");

module.exports = {
  id: "suggestModal",
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member } = interaction;

    const SuggestionSetupDB = await SuggestionSetup.findOne({
      GuildID: interaction.guild.id,
    });
    if (!SuggestionSetupDB)
      return interaction.reply({
        content: `> **Warning:** Couldn't find any data on this system:/`,
        ephemeral: true,
      });

    const input = interaction.fields.getTextInputValue("suggest_Modal");

    await guild.channels.cache
      .get(SuggestionSetupDB.SuggestChannel)
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor(SuggestionSetupDB.embedColor)
            .setFooter({
              text: `Suggestion from ${member.user.tag}`,
              iconURL: member.user.avatarURL(),
            })
            .addFields(
              { name: "**Suggestion**:", value: input, inline: false },
              {
                name: "**Upvotes**:",
                value: `\`\`\`0\`\`\``,
                inline: true,
              },
              {
                name: "**Downvotes**:",
                value: `\`\`\`0\`\`\``,
                inline: true,
              },
              {
                name: "**Status**:",
                value: `\`\`\`Pending\`\`\``,
                inline: true,
              },
              { name: "** **", value: `** **`, inline: true } // For Roald's OSD, Can be removed if you want...
            ),
        ],
        components: [
          new ActionRowBuilder().addComponents([
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
              .setStyle(ButtonStyle.Danger),
          ]),
        ],
      })
      .then(async (Message) => {
        await interaction.reply({
          content: `> **Success:** Your suggestion has been sent in <#${SuggestionSetupDB.SuggestChannel}>!`,
          ephemeral: true,
        });
        await Suggestions.create({
          GuildID: guild.id,
          ChannelID: SuggestionSetupDB.SuggestChannel,
          MessageID: Message.id,
          MemberID: member.id,
          MemberTag: member.user.tag,
          Suggestion: input,
          Accepted: false,
          Declined: false,
          Upvotes: [],
          Downvotes: [],
        }).catch((err) => console.log(err));
      });
  },
};
