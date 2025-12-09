const router = require("express").Router();
const { getBases, getTables, createForm, getForms, getForm } = require("../controllers/formController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/bases", requireAuth, getBases);
router.get("/bases/:baseId/tables", requireAuth, getTables);

router.post("/", requireAuth, createForm);
router.get("/my-forms", requireAuth, getForms);

router.get("/:formId", getForm);
module.exports = router;
