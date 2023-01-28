const { Schema, model } = require("mongoose");
const createSchema = new Schema({
  GuildID: String,
  TicketCount: String,
});

module.exports = model("TicketCount", createSchema, "TicketCount");
