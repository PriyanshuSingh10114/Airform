const router = require("express").Router();
const { loginWithAirtable, oauthCallback } = require("../controllers/authController");

router.get("/airtable", loginWithAirtable);
router.get("/callback", oauthCallback);

module.exports = router;
