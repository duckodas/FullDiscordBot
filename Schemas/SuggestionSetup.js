const { model, Schema } = require("mongoose");

module.exports = model(
  "suggestionSetup",
  new Schema({
    GuildID: String,
    SuggestChannel: String,
    ManagerRole: String,
    embedColor: String,
    AcceptColor: String,
    DeclineColor: String,
  })
);
