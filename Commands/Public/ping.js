const { SlashCommandBuilder, CommandInteraction, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Pong")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  /**
   * 
   * @param {CommandInteraction} interaction 
   */
  execute(interaction) {
    interaction.reply({content: "pong", ephemeral: true})
  }
}