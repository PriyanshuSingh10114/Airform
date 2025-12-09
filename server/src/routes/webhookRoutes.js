const router = require("express").Router();
const { handleAirtableWebhook } = require("../controllers/webhookController");
router.post("/airtable", handleAirtableWebhook);
module.exports = router;
