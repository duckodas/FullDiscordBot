const { Client } = require("discord.js");
const { mongodb } = require("../../config.json");
const { connect } = require("mongoose");

module.exports = {
  name: "ready",
  once: true,
  /**
   *
   * @param {Client} client
   */
  execute(client) {
    connect(mongodb).then(() => {
      console.log(`Mongoose Connected`);
    });
    console.log(`Client is now logged in as ${client.user.username}`);
  },
};
