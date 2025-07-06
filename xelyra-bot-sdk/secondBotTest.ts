import { XelyraClient } from "../xelyra-bot-sdk/src/client";

const bot = new XelyraClient({
  token:
    "f960a071-94ef-4cc7-8fa6-78e76a89ce48.0d3d0805dfd8bad5c741807a508ba5f1b24e9d4d3e330664d6bd6c69e4c6aa5a",
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

bot.command("ping", async (ctx) => {
  await ctx.send("You thought I was a bot?");
});

bot.login();
