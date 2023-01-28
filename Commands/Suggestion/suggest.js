const {
  SlashCommandBuilder,
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
} = require("discord.js");
const SuggestionSetup = require("../../Schemas/SuggestionSetup");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Give a idea for a server"),
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild } = interaction;
    const i = interaction
    const SuggestionSetupDB = await SuggestionSetup.findOne({
      GuildID: guild.id,
    });
    if (!SuggestionSetupDB)
      return i.reply({
        content: `> **Warning:** Couldn't find any data on this system:/`,
        ephemeral: true,
      });

    const InputField = new TextInputBuilder()
      .setCustomId("suggest_Modal")
      .setLabel("Please provide as much details as possible")
      .setPlaceholder("Suggestion System!")
      .setMaxLength(300)
      .setMinLength(1)
      .setStyle(TextInputStyle.Paragraph);

    const TestModalTextModalInputRow = new ActionRowBuilder().addComponents(
      InputField
    );

    const modal = new ModalBuilder()
      .setCustomId("suggestModal")
      .setTitle("Suggest System")
      .addComponents(TestModalTextModalInputRow);

    await interaction.showModal(modal);
  },
};
