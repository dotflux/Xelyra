// Master runner for backend load testing (improved: only valid actions)
const fs = require("fs");
const {
  loginUser,
  sendFriendRequest,
  acceptRequest,
  fetchFriends,
} = require("./userActions");
const messageActions = require("./messageActions");
const serverActions = require("./serverActions");
const groupActions = require("./groupActions");
const appActions = require("./appActions");
const { sendFlood } = require("./sendFlood");

const CONCURRENCY = 20; // Number of parallel users
const ITERATIONS = 200; // Total actions to perform

// Load users from seeded_users.txt
const users = [];
const lines = fs.readFileSync("seeded_users.txt", "utf-8").split("\n");
for (const line of lines) {
  if (line.trim()) {
    const [uuid, username, email, plainPassword] = line.split(",");
    users.push({ uuid, username, email, plainPassword });
  }
}

async function main() {
  const loggedInUsers = [];
  for (const user of users) {
    const session = await loginUser(user);
    if (session && session.cookies) {
      loggedInUsers.push({ ...user, cookies: session.cookies });
    } else {
      console.log(`Login failed for ${user.email}`);
    }
  }
  if (loggedInUsers.length < 2) {
    console.log("Not enough users for DM/group/flood tests.");
    return;
  }
  console.log(`Logged in ${loggedInUsers.length} users.`);

  // --- Step 1: Create DMs between random users ---
  const dmsMap = new Map(); // username -> Set of DM conversation IDs
  for (const user of loggedInUsers) {
    const others = loggedInUsers.filter((u) => u.uuid !== user.uuid);
    const targets = shuffle(others).slice(0, 2);
    for (const target of targets) {
      const dm = await messageActions.createDm(user, target.uuid);
      if (dm && dm.conversation) {
        if (!dmsMap.has(user.username)) dmsMap.set(user.username, new Set());
        dmsMap.get(user.username).add(dm.conversation);
      }
    }
  }

  // --- Step 2: Create groups between random users ---
  const groupMap = new Map(); // username -> Set of group IDs
  for (const user of loggedInUsers) {
    const others = loggedInUsers.filter((u) => u.uuid !== user.uuid);
    const participants = shuffle(others)
      .slice(0, 3)
      .map((u) => u.uuid);
    if (participants.length >= 2) {
      const group = await groupActions.createGroup(
        user,
        "group_" + user.username,
        participants
      );
      if (group && group.groupId) {
        if (!groupMap.has(user.username))
          groupMap.set(user.username, new Set());
        groupMap.get(user.username).add(group.groupId);
      }
    }
  }

  // --- Step 3: Run random valid actions ---
  let completed = 0;
  let errors = 0;
  const results = [];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const allActions = [
    // Messaging in valid DMs
    async (user) => {
      const dms = Array.from(dmsMap.get(user.username) || []);
      if (dms.length === 0) return null;
      return await messageActions.sendMessage(user, randomMessage(), pick(dms));
    },
    // Create server
    async (user) => await serverActions.createServer(user, randomServerName()),
    // Create application
    async (user) =>
      await appActions.createApplication(
        user,
        randomAppName(),
        randomAppDesc()
      ),
    // Create group (with random users)
    async (user) => {
      const others = loggedInUsers.filter((u) => u.uuid !== user.uuid);
      const participants = shuffle(others)
        .slice(0, 3)
        .map((u) => u.uuid);
      if (participants.length < 2) return null;
      return await groupActions.createGroup(
        user,
        "group_" + randomGroupName(),
        participants
      );
    },
  ];

  const promises = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const user = pick(loggedInUsers);
    const action = pick(allActions);
    promises.push(
      action(user).catch((e) => {
        errors++;
      })
    );
    if (promises.length >= CONCURRENCY) {
      await Promise.all(promises);
      promises.length = 0;
    }
  }
  if (promises.length > 0) await Promise.all(promises);

  // --- Print summary ---
  console.log(
    `\nLoad test complete. Actions: ${ITERATIONS}, Errors: ${errors}`
  );
  console.log(
    "DMs created:",
    Array.from(dmsMap.entries())
      .map(([u, d]) => `${u}: [${Array.from(d).join(", ")}]`)
      .join("\n")
  );
  console.log(
    "Groups created:",
    Array.from(groupMap.entries())
      .map(([u, g]) => `${u}: [${Array.from(g).join(", ")}]`)
      .join("\n")
  );
  await runFloodTest(loggedInUsers);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function randomMessage() {
  return "msg_" + Math.random().toString(36).substring(2, 12);
}
function randomServerName() {
  return "server_" + Math.random().toString(36).substring(2, 10);
}
function randomGroupName() {
  return "group_" + Math.random().toString(36).substring(2, 10);
}
function randomAppName() {
  return "app_" + Math.random().toString(36).substring(2, 10);
}
function randomAppDesc() {
  return "desc_" + Math.random().toString(36).substring(2, 20);
}

// Example: Add a flood test at the end of the main runner
async function runFloodTest(loggedInUsers) {
  if (loggedInUsers.length < 2) {
    console.log("Not enough users for flood test.");
    return;
  }
  const sender = loggedInUsers[0];
  const receiver = loggedInUsers[1];
  console.log(
    `\nStarting message flood: ${sender.username} -> ${receiver.username}`
  );
  await sendFlood({
    sender,
    receiver,
    messageCount: 1000,
    messageText: "Flood test message",
  });
}

main();
