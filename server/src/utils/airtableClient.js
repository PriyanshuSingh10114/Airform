const axios = require("axios");

const client = (accessToken) => {
  return axios.create({
    baseURL: "https://api.airtable.com/v0",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
};

module.exports = client;
