const { Schema, model } = require("mongoose");
const createSchema = new Schema({
  GuildID: String,
  ChannelID: String,
  TicketID: String,
  CreatorID: String,
  CreatorTag: String,
  MembersID: [String],
  CreatedAt: String,
  Deleted: Boolean,
  Closed: Boolean,
  Archived: Boolean,
  MessageID: String, // Required for deletion of messages!
});

module.exports = model("Tickets", createSchema, "Tickets");
