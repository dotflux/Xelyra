// Script for automated server actions: create server, channel, role
const axios = require("axios").default;

const BACKEND_URL = "http://localhost:3000"; // Change if needed

async function createServer(userWithCookies, name) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/servers/create",
      { name },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Create server failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function createChannel(
  userWithCookies,
  serverId,
  name,
  type = "text",
  category = null
) {
  try {
    const res = await axios.post(
      BACKEND_URL + `/servers/${serverId}/channels/create`,
      { name, type, category },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Create channel failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function createRole(userWithCookies, serverId, name, color = "#FFFFFF") {
  try {
    const res = await axios.post(
      BACKEND_URL + `/servers/${serverId}/roles/create`,
      { name, color },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Create role failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

module.exports = {
  createServer,
  createChannel,
  createRole,
};
