import { XelyraClient } from "../xelyra-bot-sdk/src/client";

const bot = new XelyraClient({
  token:
    "6e75c183-60c8-4838-8ba8-839ab7db2d62.0779012d6382319da9abaa0cc43be2b4392f343ee46bbd4dfeac8d72cd631979",
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

bot.command("test", async (ctx) => {
  await ctx.send("TEST!");
});

bot.command("embedtest", async (ctx) => {
  await ctx.send("Here is a sample embed!", [
    {
      title: "Welcome to Xelyra!",
      description:
        "This is a modern Discord-style embed. You can use **bold**, *italic*, and more!",
      color: "#5865F2",
      image: "https://cataas.com/cat",
      fields: [
        { name: "Field 1", value: "Some value" },
        { name: "Field 2", value: "Another value" },
      ],
    },
  ]);
});

bot.login();
