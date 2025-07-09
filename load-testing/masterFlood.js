// Master flood script: floods all DMs, groups, and server channels with 10,000 messages each
const cassandra = require("cassandra-driver");
const fs = require("fs");
const { loginUser } = require("./userActions");
const messageActions = require("./messageActions");

const BACKEND_URL = "http://localhost:3000";
const KEYSPACE = "xelyra";
const DM_FLOOD_COUNT = 1000;
const GROUP_FLOOD_COUNT = 1000;
const CHANNEL_FLOOD_COUNT = 1000;
const MESSAGE_TEXT = "Flood test message";

// ScyllaDB connection (reuse from seedUsers.js)
const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1",
  keyspace: KEYSPACE,
});

// Load users
function loadUsers() {
  const users = [];
  const lines = fs.readFileSync("seeded_users.txt", "utf-8").split("\n");
  for (const line of lines) {
    if (line.trim()) {
      const [uuid, username, email, password] = line.split(",");
      users.push({ uuid, username, email, plainPassword: password });
    }
  }
  return users;
}

// Query all groups where user is a participant
async function getUserGroups(userId) {
  const query = `SELECT id FROM groups WHERE participants CONTAINS ? ALLOW FILTERING`;
  const result = await client.execute(query, [userId]);
  return result.rows.map((row) => row.id);
}

// Query all servers where user is the owner
async function getUserServers(userId) {
  const query = `SELECT id FROM servers WHERE owner = ? ALLOW FILTERING`;
  const result = await client.execute(query, [userId]);
  return result.rows.map((row) => row.id);
}

// Query all channels in a server
async function getServerChannels(serverId) {
  const query = `SELECT id FROM channels WHERE server = ? ALLOW FILTERING`;
  const result = await client.execute(query, [serverId]);
  return result.rows.map((row) => row.id);
}

// Helper to send promises in batches with delay between each message
async function sendInBatches(
  promises,
  batchSize = 20,
  delayMs = 100,
  perMessageDelayMs = 100
) {
  let results = [];
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    // Send each message in the batch sequentially with per-message delay
    for (const p of batch) {
      results.push(await p);
      await new Promise((res) => setTimeout(res, perMessageDelayMs));
    }
    if (i + batchSize < promises.length) {
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  return results;
}

// Flood a DM between two users
async function floodDM(sender, receiver) {
  const senderSession = await loginUser(sender);
  if (!senderSession || !senderSession.cookies) {
    console.error("Could not log in sender", sender.email);
    return;
  }
  const dm = await messageActions.createDm(senderSession, receiver.uuid);
  let conversationId = null;
  if (dm && dm.conversation && dm.conversation.id) {
    conversationId = dm.conversation.id;
  } else if (dm && dm.conversationId) {
    conversationId = dm.conversationId;
  }
  function isValidUUID(uuid) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      uuid
    );
  }
  if (!conversationId || !isValidUUID(conversationId)) {
    console.error(
      "Invalid or missing conversationId for DM",
      sender.email,
      receiver.email,
      dm
    );
    return;
  }
  const sendPromises = [];
  for (let i = 0; i < DM_FLOOD_COUNT; i++) {
    sendPromises.push(
      messageActions.sendMessage(
        senderSession,
        `${MESSAGE_TEXT} [DM ${i + 1}]`,
        conversationId
      )
    );
  }
  const results = await sendInBatches(sendPromises, 20, 100, 10);
  let success = 0,
    failed = 0;
  for (const r of results) {
    if (r && r.valid) success++;
    else failed++;
  }
  console.log(
    `DM flood ${sender.email} -> ${receiver.email}: ${success} sent, ${failed} failed.`
  );
}

// Flood a group conversation
async function floodGroup(user, groupId) {
  const userSession = await loginUser(user);
  if (!userSession || !userSession.cookies) {
    console.error("Could not log in user for group", user.email);
    return;
  }
  // For groups, conversationId is groupId
  const conversationId = groupId;
  function isValidUUID(uuid) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      uuid
    );
  }
  if (!conversationId || !isValidUUID(conversationId)) {
    console.error(
      "Invalid or missing groupId for group flood",
      user.email,
      groupId
    );
    return;
  }
  const sendPromises = [];
  for (let i = 0; i < GROUP_FLOOD_COUNT; i++) {
    sendPromises.push(
      messageActions.sendMessage(
        userSession,
        `${MESSAGE_TEXT} [Group ${i + 1}]`,
        conversationId
      )
    );
  }
  const results = await sendInBatches(sendPromises, 20, 100, 10);
  let success = 0,
    failed = 0;
  for (const r of results) {
    if (r && r.valid) success++;
    else failed++;
  }
  console.log(
    `Group flood ${user.email} group ${groupId}: ${success} sent, ${failed} failed.`
  );
}

// Flood a channel in a server
async function floodChannel(user, channelId) {
  const userSession = await loginUser(user);
  if (!userSession || !userSession.cookies) {
    console.error("Could not log in user for channel", user.email);
    return;
  }
  // For channels, conversationId is channelId
  const conversationId = channelId;
  function isValidUUID(uuid) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      uuid
    );
  }
  if (!conversationId || !isValidUUID(conversationId)) {
    console.error(
      "Invalid or missing channelId for channel flood",
      user.email,
      channelId
    );
    return;
  }
  const sendPromises = [];
  for (let i = 0; i < CHANNEL_FLOOD_COUNT; i++) {
    sendPromises.push(
      messageActions.sendMessage(
        userSession,
        `${MESSAGE_TEXT} [Channel ${i + 1}]`,
        conversationId
      )
    );
  }
  const results = await sendInBatches(sendPromises, 20, 100, 10);
  let success = 0,
    failed = 0;
  for (const r of results) {
    if (r && r.valid) success++;
    else failed++;
  }
  console.log(
    `Channel flood ${user.email} channel ${channelId}: ${success} sent, ${failed} failed.`
  );
}

// Main orchestrator
(async () => {
  await client.connect();
  const users = loadUsers();

  // 1. Flood all DMs between all users (sequentially)
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (i === j) continue;
      await floodDM(users[i], users[j]);
    }
  }

  // 2. Flood all groups for each user (sequentially)
  for (const user of users) {
    const groupIds = await getUserGroups(user.uuid);
    for (const groupId of groupIds) {
      await floodGroup(user, groupId);
    }
  }

  // 3. Flood all servers/channels for each user (sequentially)
  for (const user of users) {
    const serverIds = await getUserServers(user.uuid);
    for (const serverId of serverIds) {
      const channelIds = await getServerChannels(serverId);
      for (const channelId of channelIds) {
        await floodChannel(user, channelId);
      }
    }
  }

  await client.shutdown();
  console.log("Master flood complete!");
})();
