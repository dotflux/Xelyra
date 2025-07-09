// Script for automated application/bot actions: create/fetch/update app, create/fetch bot, create/dispatch command
const axios = require("axios").default;

const BACKEND_URL = "http://localhost:3000"; // Change if needed

async function createApplication(userWithCookies, name, description) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/developer/applications/create",
      { name, description },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Create application failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function fetchAppOverview(userWithCookies, appId) {
  try {
    const res = await axios.post(
      BACKEND_URL + `/developer/applications/${appId}/fetch/overview`,
      {},
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Fetch app overview failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function updateAppOverview(userWithCookies, appId, overview) {
  try {
    const res = await axios.post(
      BACKEND_URL + `/developer/applications/${appId}/update/overview`,
      overview,
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Update app overview failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function createBot(userWithCookies, appId, botName) {
  try {
    const res = await axios.post(
      BACKEND_URL + `/developer/applications/${appId}/bots/create`,
      { botName },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Create bot failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function fetchBot(userWithCookies, appId) {
  try {
    const res = await axios.post(
      BACKEND_URL + `/developer/applications/${appId}/fetch/bot`,
      {},
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Fetch bot failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function createCommand(userWithCookies, appId, command, description) {
  try {
    const res = await axios.post(
      BACKEND_URL + `/developer/applications/${appId}/commands/create`,
      { command, description },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Create command failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function dispatchCommand(
  userWithCookies,
  appId,
  commandId,
  conversation
) {
  try {
    const res = await axios.post(
      BACKEND_URL + `/developer/applications/${appId}/commands/dispatch`,
      { commandId, conversation },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Dispatch command failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

module.exports = {
  createApplication,
  fetchAppOverview,
  updateAppOverview,
  createBot,
  fetchBot,
  createCommand,
  dispatchCommand,
};
