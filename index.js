const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");

const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");
const { loadModals } = require("./Handlers/modalHandler");
const { loadButtons } = require("./Handlers/buttonHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
});

client.config = require("./config.json");
client.cooldowns = new Collection();
client.commands = new Collection();
client.events = new Collection();
client.modals = new Collection();
client.buttons = new Collection();

loadEvents(client);
client
  .login(client.config.token)
  .then(() => {
    loadCommands(client);
    loadModals(client);
    loadButtons(client);
  })
  .catch((err) => console.log(err));


process.on("unhandledRejection", (reason, promise) => {
      console.log(" [Error_Handling] :: Unhandled Rejection/Catch");
      console.log(reason, "\n", promise);
    });
    process.on("uncaughtException", (err, origin) => {
      console.log(" [Error_Handling] :: Uncaught Exception/Catch");
      console.log(err, "\n", origin);
    });
    process.on("uncaughtExceptionMonitor", (err, origin) => {
      console.log(" [Error_Handling] :: Uncaught Exception/Catch (MONITOR)");
      console.log(err, "\n", origin);
    });
    process.on("multipleResolves", (type, promise, reason) => {
      // console.log(" [Error_Handling] :: Multiple Resolves");
      // console.log(type, promise, reason);
    });
