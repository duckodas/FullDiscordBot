const { model, Schema } = require("mongoose");

module.exports = model(
  "suggestions",
  new Schema({
    GuildID: String,
    ChannelID: String,
    MessageID: String,
    MemberID: String,
    MemberTag: String,
    Suggestion: String,
    Accepted: Boolean,
    Declined: Boolean,
    Upvotes: [String],
    Downvotes: [String],
  })
);
