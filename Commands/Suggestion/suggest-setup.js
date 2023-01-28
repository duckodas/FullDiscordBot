const {
  SlashCommandBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} = require("discord.js");
const SuggestionSetup = require("../../Schemas/SuggestionSetup");
const Suggestions = require("../../Schemas/Suggestions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`suggest-panel`)
    .setDescription(`manage the suggestion system`)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("setup")
        .setDescription(`set the suggestion system for the server up`)
        .addChannelOption((option) => {
          return option
            .setName(`suggest_channel`)
            .setDescription(`Chose a specific channel to send suggests to`)
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText);
        })
        .addRoleOption((option) => {
          return option
            .setName(`manager_role`)
            .setDescription(`Provide a role to manage suggestions`)
            .setRequired(true);
        })
        .addStringOption((option) => {
          return option
            .setName(`embedcolor`)
            .setDescription(`Chose a embed color to use on embeds`)
            .setRequired(true)
            .addChoices(
              { name: `custom_green`, value: `#009F81` },
              { name: `custom_red`, value: `#D84559` },
              { name: `invisible`, value: `#303135` },
              { name: `blurple`, value: `#5865F2` },
              { name: `yellow`, value: `#FEE75C` },
              { name: `white`, value: `#FFFFFF` },
              { name: `fuchsia`, value: `#EB459E` },
              { name: `green`, value: `#57F287` }
            );
        })
        .addStringOption((option) => {
          return option
            .setName(`accept_color`)
            .setDescription(`Chose a color on accepted suggestions`)
            .setRequired(true)
            .addChoices(
              { name: `custom_green`, value: `#009F81` },
              { name: `custom_red`, value: `#D84559` },
              { name: `invisible`, value: `#303135` },
              { name: `blurple`, value: `#5865F2` },
              { name: `yellow`, value: `#FEE75C` },
              { name: `white`, value: `#FFFFFF` },
              { name: `fuchsia`, value: `#EB459E` },
              { name: `green`, value: `#57F287` }
            );
        })
        .addStringOption((option) => {
          return option
            .setName(`declined_color`)
            .setDescription(`Chose a color on declined suggestions`)
            .setRequired(true)
            .addChoices(
              { name: `custom_green`, value: `#009F81` },
              { name: `custom_red`, value: `#D84559` },
              { name: `invisible`, value: `#303135` },
              { name: `blurple`, value: `#5865F2` },
              { name: `yellow`, value: `#FEE75C` },
              { name: `white`, value: `#FFFFFF` },
              { name: `fuchsia`, value: `#EB459E` },
              { name: `green`, value: `#57F287` }
            );
        });
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("delete")
        .setDescription(`delete the suggestion data on the server`);
    }),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, channel, message, options } = interaction;
    const i = interaction;

    if (interaction.options.getSubcommand() === "setup") {
      const channel = options.getChannel("suggest_channel");
      const role = options.getRole("manager_role");
      const embedColor = options.getString("embedcolor");
      const acceptedColor = options.getString("accept_color");
      const declined_color = options.getString("declined_color");

      await SuggestionSetup.findOneAndUpdate(
        { GuildID: guild.id },
        {
          SuggestChannel: channel.id,
          ManagerRole: role.id,
          embedColor: embedColor,
          AcceptColor: acceptedColor,
          DeclineColor: declined_color,
        },
        {
          new: true,
          upsert: true,
        }
      );

      i.reply({
        content: `> **Success:** Suggestion System has been created!`,
        ephemeral: true,
      });
    }
    if (interaction.options.getSubcommand() === "delete") {
      await SuggestionSetup.findOneAndDelete(
        { GuildID: guild.id },
        {
          GuildID: guild.id,
        }
      );

      await Suggestions.deleteMany(
        { GuildID: guild.id, ChannelID: channel.id },
        {
          GuildID: guild.id,
        }
      );

      if (!SuggestionSetup)
        return i.reply({
          content: `> **Warning:** There is no data to delete...`,
          ephemeral: true,
        });

      i.reply({
        content: `> **Success:** You deleted the data related to the suggestion system`,
        ephemeral: true,
      });
    }
  },
};
