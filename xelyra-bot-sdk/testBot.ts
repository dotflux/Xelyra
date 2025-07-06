import { XelyraClient } from "../xelyra-bot-sdk/src/client";

const bot = new XelyraClient({
  token:
    "7df1a47d-984c-4f3d-bb94-11a9c7cd1223.e877a3dcedc2afa1b5b63d15cbc0227bdda93c59dc8ceb5e34bca0a6ccbc514d",
  gatewayUrl: "http://localhost:3000/bot",
});

bot.on("ready", () => {
  console.log("Bot connected & authenticated!");
});

bot.command(
  "greet",
  async (ctx) => {
    const options = ctx.args;

    await ctx.send(`${options.emoji}`);
  },
  [
    {
      name: "emoji",
      type: "STRING",
      description: "emoji to send",
      required: true,
    },
  ]
);

bot.command("ping", async (ctx) => {
  await ctx.send("PONG! 🏓");
});

bot.login();
