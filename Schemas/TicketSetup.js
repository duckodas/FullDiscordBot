const { Schema, model } = require("mongoose");
const createSchema = new Schema({
  GuildID: String,
  ChannelID: String,
  TranscriptID: String,
  OpenCategoryID: String,
  ClosedCategoryID: String,
  ArchiveCategoryID: String,
  SupportRoleID: String,
});

module.exports = model("TicketSettings", createSchema, "TicketSettings");
