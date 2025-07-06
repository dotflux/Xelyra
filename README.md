# Xelyra

A modern, Discord-inspired chat platform with real-time messaging, roles, permissions, and bot/command support.

## Features

- **Real-time chat** (NestJS backend, React/Tailwind frontend)
- **Text and voice channels** with category organization
- **Role-based permissions** for channels and servers
- **Slash commands** and bot support (SDK included)
- **Infinite scroll, message editing/deleting, reply, and more**
- **ScyllaDB/Cassandra** for scalable, high-performance storage
- **Modern UI/UX** inspired by Discord

---

## Project Structure

```
Xelyra/
  backend/      # NestJS API, WebSocket gateway, ScyllaDB integration
  frontend/     # React + Tailwind UI
  xelyra-bot-sdk/ # Bot SDK for building bots/command integrations
```

---

## Getting Started

### 1. Backend (NestJS)

```bash
cd backend
npm install
# Configure your .env (DB, Redis, etc.)
npm run start:dev
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

### 3. Database (ScyllaDB/Cassandra)

- Run the CQL scripts in `backend/src/db/cql_scripts/` in order to set up tables and indexes.
- Make sure your DB connection matches the backend `.env` config.

### 4. Bot SDK (xelyra-bot-sdk)

```bash
cd xelyra-bot-sdk
npm install
```

#### Example SDK Usage

```js
const { XelyraBot } = require("./src/client");
const bot = new XelyraBot({ token: "YOUR_BOT_TOKEN" });
bot.command("ping", (ctx) => ctx.reply("pong!"));
bot.connect();
```

- See `xelyra-bot-sdk/README.md` for more advanced usage, editing/deleting, and command options.

---

## Development Notes

- **Backend:** Uses NestJS, WebSocket Gateway, and ScyllaDB. See `backend/README.md` for API details.
- **Frontend:** React + Tailwind, Discord-like UI, see `frontend/README.md` for component structure.
- **SDK:** Lets you build bots that can send/edit/delete commands, listen for events, and more.
- **Permissions:** Role-based, managed in backend and enforced in UI.

---

## Contributing

- PRs and issues welcome! Please follow code style and add clear commit messages.
- For questions, contact the maintainer or open an issue.

---

## License

MIT (or your license here)
