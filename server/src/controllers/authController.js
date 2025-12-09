const axios = require("axios");
const qs = require("qs");
const crypto = require("crypto");
const User = require("../models/User");


const base64URLEncode = (buffer) => {
  return Buffer.isBuffer(buffer)
    ? buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    : Buffer.from(buffer).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

exports.loginWithAirtable = (req, res) => {

  const state = crypto.randomBytes(32).toString("hex");
  req.session.oauthState = state;

  const codeVerifier = base64URLEncode(crypto.randomBytes(32)); 
  req.session.codeVerifier = codeVerifier;

  const codeChallenge = base64URLEncode(
    crypto.createHash("sha256").update(codeVerifier).digest()
  );

  const queryParams = [
    `response_type=code`,
    `client_id=${process.env.AIRTABLE_CLIENT_ID}`,
    `redirect_uri=${encodeURIComponent(process.env.AIRTABLE_REDIRECT)}`,
    `scope=${encodeURIComponent([
      "data.records:read",
      "data.records:write",
      "schema.bases:read",
      "webhook:manage",
    ].join(" "))}`,
    `state=${state}`,
    `code_challenge=${codeChallenge}`,
    `code_challenge_method=S256`,
  ].join("&");

  const authUrl = `https://airtable.com/oauth2/v1/authorize?${queryParams}`;
  console.log("\nGenerated OAuth URL (PKCE):\n", authUrl, "\n");
  res.redirect(authUrl);
};

exports.oauthCallback = async (req, res) => {
  console.log("OAuth Callback - Query Params:", req.query);

  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(`Airtable Error: ${error} - ${error_description}`);
  }

  if (!code) {
    return res.status(400).json({
      message: "Missing authorization code.",
      receivedQuery: req.query,
    });
  }

  if (!state || state !== req.session.oauthState) {
    return res.status(400).send("Invalid state parameter (CSRF mismatch).");
  }

  const codeVerifier = req.session.codeVerifier;

  delete req.session.oauthState;
  delete req.session.codeVerifier;

  try {
    const body = qs.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.AIRTABLE_REDIRECT,
      code_verifier: codeVerifier,
    });

    const encodedCredentials = Buffer.from(
      `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`
    ).toString("base64");

    const tokenRes = await axios.post("https://airtable.com/oauth2/v1/token", body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${encodedCredentials}`,
      },
    });

    const { access_token, refresh_token } = tokenRes.data;

    const meRes = await axios.get("https://api.airtable.com/v0/meta/whoami", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const airtableUser = meRes.data;

    let user = await User.findOne({ airtableUserId: airtableUser.id });

    if (!user) {
      user = await User.create({
        airtableUserId: airtableUser.id,
        email: airtableUser.email,
        name: airtableUser.name,
        oauth: {
          accessToken: access_token,
          refreshToken: refresh_token,
        },
      });
    } else {
      user.oauth.accessToken = access_token;
      user.oauth.refreshToken = refresh_token;
      await user.save();
    }

    req.session.userId = user._id;
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const FRONTEND = process.env.FRONTEND_URL || "https://airform-tau.vercel.app";
    return res.redirect(`${FRONTEND.replace(/\/$/, "")}/dashboard?userId=${user._id}`);
  } catch (err) {
    console.error("\nOAuth Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "OAuth failed", details: err.response?.data || err.message });
  }
};
