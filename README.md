# Xelyra 🚀

> **The Next-Generation Communication Platform** - A modern, Discord-inspired chat application with cutting-edge AI integration, real-time messaging, and an extensible bot SDK.

![Xelyra Landing Page](frontend/src/assets/landing_page.gif)
_Welcome to Xelyra: Modern, sleek, and built for the future of communication._

## 🌟 **Revolutionary Features**

### 🤖 **AI-Powered Personal Assistant (Xyn)**

Meet **Xyn**, your intelligent AI companion integrated directly into Xelyra. Xyn can:

- **Generate AI profile pictures** from text descriptions
- **Automatically update account details** through natural conversation
- **Create custom images** on demand
- **Provide contextual assistance** across the platform

![Meet Xyn](frontend/src/assets/meet_xyn.png)
_Meet Xyn: Your friendly, always-available AI assistant in Xelyra._

**AI-Generated Profile Pictures:**

![AI Profile Picture Generation](frontend/src/assets/xyn_changes_generated_pfp.gif)
_Watch as Xyn generates a unique profile picture for you using AI, based on your description!_

**File-Based Profile Updates:**

![File-Based Profile Updates](frontend/src/assets/xyn_changes_byfile.png)
_Easily update your profile picture by uploading an image file—Xyn handles the rest._

**Natural Language Account Management:**

![Natural Language Account Management](frontend/src/assets/xyn_changes_name.gif)
_Change your display name and other details just by chatting with Xyn—no forms required!_

### 🔧 **Advanced Bot SDK & Developer Tools**

**Developer Portal:**

![Developer Portal](frontend/src/assets/developer_page.gif)
_Powerful developer dashboard for managing your applications, bots, and integrations._

**Comprehensive SDK Documentation:**

![SDK Documentation](frontend/src/assets/sdk_documentation.gif)
_In-depth, interactive SDK documentation to help you build bots and integrations quickly._

**Rich Message Formats & Embeds:**

![Message Formats and Embeds](frontend/src/assets/formats_and_embed.gif)
_Send messages with rich embeds, formatting, and media for a dynamic chat experience._

#### **🚀 Xelyra Bot SDK - The Most Advanced Bot Framework**

Our SDK is designed for maximum extensibility and ease of use:

```typescript
import { XelyraClient } from "xelyra-bot-sdk";

const bot = new XelyraClient({
  token: "YOUR_BOT_TOKEN",
  gatewayUrl: "http://localhost:3000/bot",
});

// Register slash commands with descriptions and options
bot.command(
  "weather",
  async (ctx) => {
    const city = ctx.args.city || "New York";
    const weather = await getWeather(city);
    await ctx.send(`Weather in ${city}: ${weather.temperature}°C`);
  },
  [{ name: "city", type: "string", description: "City name", required: false }],
  "Get weather information for a city"
);

// Advanced message manipulation
bot.command("poll", async (ctx) => {
  const message = await ctx.send("React to vote!", [
    {
      title: "Community Poll",
      description: "What feature should we add next?",
      fields: [
        { name: "🎮", value: "Gaming integration", inline: true },
        { name: "🎵", value: "Music bots", inline: true },
        { name: "📊", value: "Analytics dashboard", inline: true },
      ],
    },
  ]);

  // Edit messages dynamically
  setTimeout(async () => {
    await bot.editMessage(message.id, "Poll closed!", [
      {
        title: "Final Results",
        description: "Gaming integration wins!",
      },
    ]);
  }, 60000);
});

bot.login();
```

**Key SDK Features:**

- **Real-time WebSocket communication** with automatic reconnection
- **Slash command registration** with validation and auto-completion
- **Rich embed support** with customizable fields, colors, and formatting
- **Message editing and deletion** with full CRUD operations
- **Event-driven architecture** for responsive bot interactions
- **TypeScript support** with full type safety
- **Modular design** for easy extension and customization

### 🔐 **Enterprise-Grade Authentication System**

**Secure OTP Verification:**

- **Email-based OTP** with 6-digit codes
- **JWT token authentication** with secure cookie storage
- **Password hashing** using bcrypt with salt rounds
- **Session management** with automatic token refresh
- **CSRF protection** with secure cookie policies

**Authentication Flow:**

1. **User Registration** → Email validation → OTP generation → Account creation
2. **Secure Login** → Password verification → JWT token issuance → Session establishment
3. **Token Validation** → Automatic session renewal → Secure logout

### ⚡ **Real-Time Communication Engine**

**WebSocket-Powered Messaging:**

- **Instant message delivery** with sub-second latency
- **Redis-backed scaling** for multi-server deployments
- **Room-based broadcasting** for efficient message routing
- **Connection state management** with automatic reconnection
- **Typing indicators** and presence detection

**Advanced Features:**

- **Infinite scroll** with efficient pagination
- **Message editing and deletion** with real-time updates
- **File uploads** with progress tracking
- **Reply threading** with context preservation
- **Message reactions** and interactive elements

### 🏗️ **Scalable Architecture**

**Backend Stack:**

- **NestJS** - Enterprise-grade Node.js framework
- **ScyllaDB/Cassandra** - High-performance NoSQL database
- **Redis** - In-memory caching and session storage
- **Socket.IO** - Real-time WebSocket communication
- **Google Gemini AI** - Advanced AI integration

**Frontend Stack:**

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **GSAP** - Smooth animations and transitions

**Database Schema:**

```sql
-- Optimized for high-performance messaging
CREATE TABLE messages (
  id UUID,
  message TEXT,
  user UUID,
  conversation UUID,
  files LIST<FROZEN<file_info>>,
  embeds LIST<TEXT>,
  is_read BOOLEAN,
  edited BOOLEAN,
  created_at TIMEUUID,
  reply_to TIMEUUID,
  PRIMARY KEY ((conversation), created_at)
);

-- Role-based permissions system
CREATE TABLE roles (
  server_id UUID,
  role_id UUID,
  name TEXT,
  level INT,
  color TEXT,
  permissions SET<TEXT>,
  PRIMARY KEY ((server_id), role_id)
);
```

### 🎮 **Server Management & Social Features**

**Server Creation:**

![Server Creation](frontend/src/assets/create_server.gif)
_Create new servers in seconds—customize everything from the name to the icon._

**Friend System:**

![Add Friends](frontend/src/assets/add_friends.gif)
_Add friends and grow your network with a simple, intuitive interface._

**Advanced Features:**

- **Role-based permissions** with granular control
- **Channel categories** for organized communication
- **Server member management** with invite systems
- **File sharing** with support for multiple formats
- **Voice channel support** (coming soon)

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 18+
- ScyllaDB/Cassandra
- Redis
- Google Gemini API key

### **Required Environment Variables**

Create a `.env` file in the `backend` directory with the following variables:

```env
# JWT secret for authentication
JWT_SECRET=your_jwt_secret

# Gmail credentials for OTP/email
GMAIL=your_gmail_address
GMAIL_PASS=your_gmail_app_password

# Google Gemini API key for AI features
GEMINI_API_KEY=your_gemini_api_key

# AI_ID must be set to this value for the app to function correctly
AI_ID=117cd972-3760-47b9-9c38-e6bbc28196f5
```

### **1. Backend Setup**

```bash
cd backend
npm install

# Setup env variables, Scylla db and Redis

# Start development server
npm run start:dev
```

### **2. Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

### **3. Bot SDK Setup**

```bash
cd xelyra-bot-sdk
npm install

```

### **4. Database Initialization**

Run the CQL scripts in order:

```bash
# Execute scripts from backend/src/db/cql_scripts/
# 001_create_keyspace.cql
# 002_create_users.cql
# ... (all scripts in numerical order)
```

## 🔧 **Development & Architecture**

### **Project Structure**

```
Xelyra/
├── backend/                 # NestJS API & WebSocket Gateway
│   ├── src/
│   │   ├── controllers/     # API endpoints
│   │   ├── logic/          # Business logic (flat, modular)
│   │   ├── services/       # Database operations
│   │   ├── gateways/       # WebSocket handlers
│   │   └── db/            # ScyllaDB integration
├── frontend/               # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/     # Modular React components
│   │   ├── assets/         # Images, GIFs, icons
│   │   └── hooks/          # Custom React hooks
└── xelyra-bot-sdk/         # Extensible Bot SDK
    ├── src/
    │   ├── client.ts       # Main SDK client
    │   ├── structures/     # Data structures
    │   └── types.ts        # TypeScript definitions
```

### **Key Design Principles**

- **Flat Logic Architecture** - No nested if/else, modular functions
- **Separation of Concerns** - Controllers, logic, and services are distinct
- **Type Safety** - Full TypeScript coverage across the stack
- **Real-time First** - WebSocket-driven architecture
- **AI Integration** - Seamless AI features throughout the platform

## 🌟 **Innovation Highlights**

### **AI-First Design**

- **Natural language processing** for account management
- **AI-generated content** (images, responses)
- **Contextual assistance** across all features
- **Intelligent automation** for repetitive tasks

### **Developer Experience**

- **Comprehensive SDK** with full TypeScript support
- **Real-time development** with hot reloading
- **Extensive documentation** with examples
- **Modular architecture** for easy extension

### **Performance & Scalability**

- **ScyllaDB** for high-throughput data storage
- **Redis** for caching and session management
- **WebSocket clustering** for horizontal scaling
- **Optimized queries** with proper indexing

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Setup**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using cutting-edge technologies for the future of communication.**
