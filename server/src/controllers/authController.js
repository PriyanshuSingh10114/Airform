const axios = require("axios");
const qs = require("qs");
const crypto = require("crypto");
const User = require("../models/User");

// Helper to generate base64URL encoded string
const base64URLEncode = (str) => {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const sha256 = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest();
};

exports.loginWithAirtable = (req, res) => {
  // 1. Generate robust State (CSRF protection)
  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthState = state;

  // 2. Generate PKCE Code Verifier & Challenge
  const codeVerifier = base64URLEncode(crypto.randomBytes(32));
  req.session.codeVerifier = codeVerifier;
  const codeChallenge = base64URLEncode(sha256(codeVerifier));

  // 3. Construct URL manually to ensure safe encoding
  const queryParams = [
    `response_type=code`,
    `client_id=${process.env.AIRTABLE_CLIENT_ID}`,
    `redirect_uri=${encodeURIComponent(process.env.AIRTABLE_REDIRECT)}`,
    `scope=${encodeURIComponent([
      "data.records:read",
      "data.records:write",
      "schema.bases:read",
      "webhook:manage"
    ].join(" "))}`,
    `state=${state}`,
    `code_challenge=${codeChallenge}`,
    `code_challenge_method=S256`
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
      receivedQuery: req.query
    });
  }

  // validate CSRF state
  if (!state || state !== req.session.oauthState) {
    return res.status(400).send("Invalid state parameter (CSRF mismatch).");
  }

  const codeVerifier = req.session.codeVerifier;

  // cleanup session
  delete req.session.oauthState;
  delete req.session.codeVerifier;

  try {
    // Exchange authorization code for tokens
    const body = qs.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.AIRTABLE_REDIRECT,
      code_verifier: codeVerifier
    });

    const encodedCredentials = Buffer.from(
      `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`
    ).toString("base64");

    const tokenRes = await axios.post(
      "https://airtable.com/oauth2/v1/token",
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${encodedCredentials}`
        }
      }
    );

    const { access_token, refresh_token } = tokenRes.data;

    // Fetch user profile from Airtable
    const meRes = await axios.get("https://api.airtable.com/v0/meta/whoami", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const airtableUser = meRes.data;

    // Find or create local user
    let user = await User.findOne({ airtableUserId: airtableUser.id });

    if (!user) {
      user = await User.create({
        airtableUserId: airtableUser.id,
        email: airtableUser.email,
        name: airtableUser.name,
        oauth: {
          accessToken: access_token,
          refreshToken: refresh_token
        }
      });
    } else {
      // update tokens if user exists
      user.oauth.accessToken = access_token;
      user.oauth.refreshToken = refresh_token;
      await user.save();
    }

    // Save user ID in session
    req.session.userId = user._id;
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Redirect to client with userId
    return res.redirect(`http://localhost:5173/auth/callback?userId=${user._id}`);

  } catch (err) {
    console.error("\nOAuth Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "OAuth failed", details: err.response?.data });
  }
};
