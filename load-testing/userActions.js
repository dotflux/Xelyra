// Script for automated user actions: login, fetch friends, send/accept/reject/cancel requests
const axios = require("axios").default;
const fs = require("fs");

const BACKEND_URL = "http://localhost:3000"; // Change if needed

// Load users from a file or array (replace with your actual user list)
// Format: [{ uuid, username, email, plainPassword }]
const users = [];
try {
  const lines = fs.readFileSync("seeded_users.txt", "utf-8").split("\n");
  let skipped = 0;
  for (const line of lines) {
    if (line.trim()) {
      const [uuid, username, email, password] = line
        .split(",")
        .map((x) => x && x.trim());
      if (uuid && username && email && password) {
        users.push({ uuid, username, email, plainPassword: password });
      } else {
        skipped++;
        console.warn("Skipped malformed line in seeded_users.txt:", line);
      }
    }
  }
  console.log("Loaded users:", users.length, "| Skipped lines:", skipped);
  console.log("First 5 loaded users:", users.slice(0, 5));
} catch (e) {
  console.error("Could not load seeded_users.txt:", e);
}

async function loginUser(user) {
  try {
    console.log("Attempting login for:", user);
    const payload = { email: user.email, password: user.plainPassword };
    console.log("Login payload:", payload);
    const res = await axios.post(BACKEND_URL + "/login", payload, {
      withCredentials: true,
    });
    const cookies = res.headers["set-cookie"];
    // Convert cookies array to a single Cookie header string
    const cookieHeader = Array.isArray(cookies)
      ? cookies.map((c) => c.split(";")[0]).join("; ")
      : cookies;
    console.log(
      "Login success:",
      user.email,
      "Response:",
      res.data,
      "Cookies:",
      cookieHeader
    );
    return { ...user, cookies: cookieHeader };
  } catch (err) {
    console.error(
      "Login failed for",
      user.email,
      "Payload:",
      { email: user.email, password: user.plainPassword },
      "Error:",
      err.response?.data || err.message,
      "Full error:",
      err
    );
    return null;
  }
}

async function fetchFriends(userWithCookies) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/friends",
      {},
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Fetch friends failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function sendFriendRequest(userWithCookies, recieverName) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/requests/send",
      { recieverName },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Send friend request failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function acceptRequest(userWithCookies, recieverId) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/requests/accept",
      { recieverId },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Accept request failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function rejectRequest(userWithCookies, recieverId) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/requests/reject",
      { recieverId },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Reject request failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function cancelRequest(userWithCookies, recieverId) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/requests/cancel",
      { recieverId },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Cancel request failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

module.exports = {
  users,
  loginUser,
  fetchFriends,
  sendFriendRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
};
