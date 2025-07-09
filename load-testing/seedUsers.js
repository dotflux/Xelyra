// Script to seed random users into ScyllaDB for load testing
const cassandra = require("cassandra-driver");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const USER_COUNT = parseInt(process.argv[2], 10) || 100;
const KEYSPACE = "xelyra";
const TABLE = "users";
const SALT_ROUNDS = 10;

// Update these with your ScyllaDB connection details
const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"], // or your scylla docker IP
  localDataCenter: "datacenter1",
  keyspace: KEYSPACE,
});

function randomString(length) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function createUser() {
  const id = uuidv4();
  const username = `testuser_${Math.random().toString(36).substring(2, 10)}`;
  const email = `${username}@test.local`;
  const plainPassword = Math.random().toString(36).substring(2, 12);
  const password = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  const createdAt = new Date();
  const query = `INSERT INTO xelyra.users (id, username, email, password, created_at) VALUES (?, ?, ?, ?, ?)`;
  const params = [id, username, email, password, createdAt];
  await client.execute(query, params, { prepare: true });
  return { id, username, email, plainPassword };
}

(async () => {
  try {
    await client.connect();
    const users = [];
    let outputLines = [];
    for (let i = 0; i < USER_COUNT; i++) {
      const user = await createUser();
      users.push(user);
      outputLines.push(
        `${user.id},${user.username},${user.email},${user.plainPassword}`
      );
      console.log(
        `[${i + 1}] UUID: ${user.id}, Username: ${user.username}, Email: ${
          user.email
        }, Password: ${user.plainPassword}`
      );
    }
    await client.shutdown();
    // Write to seeded_users.txt
    const fs = require("fs");
    fs.writeFileSync("seeded_users.txt", outputLines.join("\n"), "utf-8");
    console.log(
      `\nSeeded ${USER_COUNT} users successfully. Saved to seeded_users.txt.`
    );
  } catch (err) {
    console.error("Error seeding users:", err);
    await client.shutdown();
    process.exit(1);
  }
})();
