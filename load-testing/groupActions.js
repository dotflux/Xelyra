// Script for automated group actions: create/add/kick/leave groups, change name/pfp
const axios = require("axios").default;

const BACKEND_URL = "http://localhost:3000"; // Change if needed

async function createGroup(userWithCookies, name, participants) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/groups/create",
      { name, participants },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Create group failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function addParticipants(userWithCookies, group, participants) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/groups/add",
      { group, participants },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Add participants failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function kickParticipant(userWithCookies, group, participant) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/groups/kick",
      { group, participant },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Kick participant failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function leaveGroup(userWithCookies, group) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/groups/leave",
      { group },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Leave group failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function changeGroupName(userWithCookies, groupId, name) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/groups/name",
      { groupId, name },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Change group name failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

async function changeGroupPfp(userWithCookies, groupId, imageUrl) {
  try {
    const res = await axios.post(
      BACKEND_URL + "/home/groups/pfp",
      { groupId, imageUrl },
      { headers: { Cookie: userWithCookies.cookies }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error(
      "Change group pfp failed for",
      userWithCookies.email,
      err.response?.data || err.message
    );
    return null;
  }
}

module.exports = {
  createGroup,
  addParticipants,
  kickParticipant,
  leaveGroup,
  changeGroupName,
  changeGroupPfp,
};
