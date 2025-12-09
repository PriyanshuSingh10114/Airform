const Form = require("../models/Form");
const AirtableService = require("../services/airtableService");


exports.getBases = async (req, res) => {
  try {
    const airtable = new AirtableService(req.user.oauth.accessToken);
    const bases = await airtable.getBases();
    res.json(bases);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch bases" });
  }
};

exports.getTables = async (req, res) => {
  try {
    const { baseId } = req.params;
    const airtable = new AirtableService(req.user.oauth.accessToken);
    const tables = await airtable.getTables(baseId);

    const supportedTypes = ["singleLineText", "multilineText", "singleSelect", "multipleSelects", "multipleAttachments"];

    const tablesWithSupportedFields = tables.map((table) => ({
      ...table,
      fields: (table.fields || []).filter((field) => supportedTypes.includes(field.type)),
    }));

    res.json(tablesWithSupportedFields);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch tables" });
  }
};

exports.createForm = async (req, res) => {
  try {
    const { title, airtableBaseId, airtableTableId, airtableTableName, questions } = req.body;

    const form = new Form({
      owner: req.user._id,
      title,
      airtableBaseId,
      airtableTableId: airtableTableId || null,
      airtableTableName: airtableTableName || null,
      questions,
    });

    await form.save();
    res.status(201).json(form);
  } catch (err) {
    console.error("Create Form Error:", err);
    res.status(400).json({ error: "Failed to create form" });
  }
};

exports.getForms = async (req, res) => {
  try {
    const forms = await Form.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch forms" });
  }
};

exports.getForm = async (req, res) => {
  try {
    const formId = req.params.formId || req.params.id;
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch form" });
  }
};
