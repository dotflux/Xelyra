import { XelyraClient } from "../xelyra-bot-sdk/src/client";

const bot = new XelyraClient({
  token:
    "c8bdb1c6-b695-4929-9978-da14473eceed.93b4f8a1c4e8d64e51debd6f2c126b6004ead00c836626bc9e9e6951368d1080",
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
  const msg = await ctx.send("Here is a sample embed!", [
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
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await msg.edit("Here is an edited embed!", [
    {
      title: "Edited",
      description: "It got edited!",
      color: "#5865F2",
    },
  ]);
});

bot.login();
