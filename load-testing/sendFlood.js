// Script to flood a DM with messages for stress testing
const axios = require("axios").default;
const fs = require("fs");
const { loginUser } = require("./userActions");
const messageActions = require("./messageActions");

const BACKEND_URL = "http://localhost:3000"; // Change if needed

async function sendFlood({
  sender,
  receiver,
  messageCount = 1000,
  messageText = "Flood test message",
}) {
  // sender, receiver: user objects with uuid, username, email, plainPassword
  // messageCount: number of messages to send
  // messageText: text to send
  try {
    // 1. Log in sender
    const senderSession = await loginUser(sender);
    if (!senderSession || !senderSession.cookies) {
      throw new Error("Could not log in sender");
    }
    // 2. Create DM with receiver
    const dm = await messageActions.createDm(senderSession, receiver.uuid);
    console.log("DM creation response:", dm);
    let conversationId = null;
    if (dm && dm.conversation && dm.conversation.id) {
      conversationId = dm.conversation.id;
    } else if (dm && dm.conversationId) {
      conversationId = dm.conversationId;
    }
    // Validate conversationId as UUID
    function isValidUUID(uuid) {
      return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        uuid
      );
    }
    console.log("Using conversationId:", conversationId);
    if (!conversationId || !isValidUUID(conversationId)) {
      console.error("Invalid or missing conversationId:", conversationId, dm);
      throw new Error("Could not create valid DM (invalid conversationId)");
    }
    // 3. Flood messages
    const sendPromises = [];
    for (let i = 0; i < messageCount; i++) {
      sendPromises.push(
        messageActions.sendMessage(
          senderSession,
          `${messageText} #${i + 1}`,
          conversationId
        )
      );
      // Optionally, throttle if needed (remove/comment for max speed)
      // if (i % 100 === 0) await new Promise(res => setTimeout(res, 10));
    }
    const results = await Promise.allSettled(sendPromises);
    // Only count as success if response is valid: true
    let success = 0,
      failed = 0;
    for (const r of results) {
      if (r.status === "fulfilled" && r.value && r.value.valid) success++;
      else failed++;
    }
    console.log(`Flood complete: ${success} sent, ${failed} failed.`);
    return { success, failed };
  } catch (err) {
    console.error("Error in sendFlood:", err);
    return { success: 0, failed: messageCount };
  }
}

// Standalone run
if (require.main === module) {
  // Load users
  const users = [];
  const lines = fs.readFileSync("seeded_users.txt", "utf-8").split("\n");
  for (const line of lines) {
    if (line.trim()) {
      const [uuid, username, email, password] = line.split(",");
      users.push({ uuid, username, email, plainPassword: password });
    }
  }
  if (users.length < 2) {
    console.error("Need at least 2 users in seeded_users.txt");
    process.exit(1);
  }
  // Use first two users
  sendFlood({ sender: users[0], receiver: users[1], messageCount: 1000 }).then(
    () => process.exit(0)
  );
}

module.exports = { sendFlood };
