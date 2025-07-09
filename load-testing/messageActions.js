// Script for automated messaging actions: create DM, send/edit/delete messages
const axios = require("axios").default;
const http = require("http");
const https = require("https");

const BACKEND_URL = "http://localhost:3000"; // Change if needed

// Create keep-alive agents
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

async function createDm(userWithCookies, recieverId) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/dm",
      { recieverId },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Create DM failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function sendMessage(
  userWithCookies,
  message,
  conversation,
  replyTo = null
) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/messages/send",
      { message, conversation, replyTo },
      {
        headers: {
          Cookie: userWithCookies.cookies,
        },
        httpAgent,
        httpsAgent,
      }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Send message failed for",
      userWithCookies.email,
      err.response?.data || err.message,
      "Payload:",
      { message, conversation, replyTo }
    );
    return null;
  }
}

async function editMessage(userWithCookies, message, messageId, conversation) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/messages/edit",
      { message, messageId, conversation },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Edit message failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function deleteMessage(userWithCookies, message, conversation) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/messages/delete",
      { message, conversation },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Delete message failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

module.exports = {
  createDm,
  sendMessage,
  editMessage,
  deleteMessage,
};
