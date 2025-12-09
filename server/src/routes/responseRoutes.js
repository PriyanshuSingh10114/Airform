const router = require("express").Router();
const { submitResponse, getResponses } = require("../controllers/responseController");
const { requireAuth } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

router.post("/:formId", upload.any(), submitResponse);
router.get("/:formId/list", requireAuth, getResponses);

module.exports = router;
