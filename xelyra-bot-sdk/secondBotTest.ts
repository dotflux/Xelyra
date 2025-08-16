import { XelyraClient } from "../xelyra-bot-sdk/src/client";

const bot = new XelyraClient({
  token: "YOUR_TOKEN_HERE",
  gatewayUrl: "http://localhost:3000/bot",
});

bot.on("ready", () => {
  console.log("Bot connected & authenticated!");
});

bot.command(
  "greet",
  async (ctx) => {
    const options = ctx.args;

    const msg = await ctx.send(`${options.message} ${options.name}`);
    const delay = (d: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, d * 1000);
      });
    };
    console.log(msg.id);
    console.log(msg.channelId);
    await delay(3);
    await msg.edit(`Goodbye, Mr.${options.name}`);
    await delay(2);
    await msg.delete();
  },
  [
    {
      name: "name",
      type: "STRING",
      description: "name of user",
      required: true,
    },
    {
      name: "message",
      type: "STRING",
      description: "message to send",
      required: true,
    },
  ]
);

bot.command("secondButton", async (ctx) => {
  const msg = await ctx.send(
    "Hello, world!",
    [],
    [
      {
        name: "Accept",
        customId: "handler1",
        color: "success",
      },
      {
        name: "Decline",
        customId: "handler2",
        color: "danger",
      },
    ]
  );
  console.log(msg.id);
  console.log(msg.channelId);
});

bot.command("ping", async (ctx) => {
  await ctx.send("You thought I was a bot?");
});

bot.registerButtonCallback("secondButton", "handler1", async (ctx) => {
  await ctx.send("You accepted the offer!");
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const msg = ctx.getMessage();
  await msg.edit(
    "You accepted the offer!",
    [
      {
        title: "Accepted",
        description: "You accepted the offer! There is no going back now",
        color: "#00ff00",
      },
    ],
    []
  );
});

bot.registerButtonCallback("secondButton", "handler2", async (ctx) => {
  const msg = ctx.getMessage();
  await msg.edit(
    "You declined the offer!, however its not accepted",
    [
      {
        title: "Not allowed!",
        description: "You are not allowed to decline this offer",
        color: "#ff0000",
      },
    ],
    [{ name: "Accept", color: "success", customId: "handler1" }]
  );
});

bot.login();
