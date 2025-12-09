const router = require("express").Router();
const { getBases, getTables, createForm, getForms, getForm } = require("../controllers/formController");
const { requireAuth } = require("../middleware/authMiddleware");

// Protected Routes (Builder & Dashboard)
router.get("/bases", requireAuth, getBases);
router.get("/bases/:baseId/tables", requireAuth, getTables);
router.post("/", requireAuth, createForm);
router.get("/my-forms", requireAuth, getForms);

// Public Routes (Viewer)
router.get("/:id", getForm);

module.exports = router;
