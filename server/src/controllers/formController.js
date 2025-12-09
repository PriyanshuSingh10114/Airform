const Form = require("../models/Form");
const AirtableService = require("../services/airtableService");

// Get Bases
exports.getBases = async (req, res) => {
  try {
    const airtable = new AirtableService(req.user.oauth.accessToken);
    const bases = await airtable.getBases();
    res.json(bases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Tables for a Base
exports.getTables = async (req, res) => {
  try {
    const { baseId } = req.params;
    const airtable = new AirtableService(req.user.oauth.accessToken);
    const tables = await airtable.getTables(baseId);

    // Filter fields to supported types
    const supportedTypes = ["singleLineText", "multilineText", "singleSelect", "multipleSelects", "multipleAttachments"];

    const tablesWithSupportedFields = tables.map(table => ({
      ...table,
      fields: table.fields.filter(field => supportedTypes.includes(field.type))
    }));

    res.json(tablesWithSupportedFields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Form
exports.createForm = async (req, res) => {
  try {
    const { title, airtableBaseId, airtableTableId, questions } = req.body;

    const form = new Form({
      owner: req.user._id,
      title,
      airtableBaseId,
      airtableTableId,
      questions
    });

    await form.save();
    res.status(201).json(form);
  } catch (err) {
    console.error("Create Form Error:", err);
    res.status(400).json({ error: "Failed to create form" });
  }
};

// Get User's Forms (Dashboard)
exports.getForms = async (req, res) => {
  try {
    const forms = await Form.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch forms" });
  }
};

// Get Single Form (for Viewer/Editor)
exports.getForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch form" });
  }
};
