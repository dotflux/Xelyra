import { XelyraClient } from "../xelyra-bot-sdk/src/client";

const bot = new XelyraClient({
  token:
    "2ccfefe7-3f7a-455c-b380-4ce1091a8100.500942629202bf0388fe1632902f95b67ef7e02c0dd57439149256b66cd5237f",
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

bot.command(
  "butonTest",
  async (ctx) => {
    await ctx.send(
      "Embed with buttons",
      [
        {
          title: "Button test",
          description: "this is an embed with buttons",
          color: "#5865F2",
        },
      ],
      [
        {
          name: "Primary",
          color: "primary",
          customId: "handler1",
        },
        {
          name: "Secondary",
          color: "secondary",
          customId: "handler2",
        },
        {
          name: "Delete",
          color: "danger",
          customId: "deleteHandler",
        },
      ]
    );
  },
  [],
  "This is a test command for buttons"
);

bot.registerButtonCallback("buttonTest", "handler1", async (ctx) => {
  await ctx.send("Primary Clicked");
});

bot.registerButtonCallback("buttonTest", "handler2", async (ctx) => {
  await ctx.send("Secondary Clicked");
});

bot.registerButtonCallback("buttonTest", "deleteHandler", async (ctx) => {
  const message = await ctx.getMessage();
  await message.delete();
});
bot.login();
