const Form = require("../models/Form");
const Response = require("../models/Response");
const AirtableService = require("../services/airtableService");

exports.submitResponse = async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await Form.findById(formId).populate("owner");
    if (!form) return res.status(404).json({ error: "Form not found" });

    const status = req.body.status || "Pending";

    const airtableFields = {};
    const answersToSave = {};

    for (const q of form.questions) {
      let val = req.body[q.questionKey];

      if (q.type === "multipleAttachments") {
        const filesForField = req.files
          ? req.files.filter((f) => f.fieldname === q.questionKey)
          : [];

        if (filesForField.length > 0) {
          val = filesForField.map((f) => ({
            url: `${req.protocol}://${req.get("host")}/uploads/${f.filename}`,
            name: f.originalname,
            type: f.mimetype,
          }));
        } else {
          val = [];
        }
      }

      if (q.type === "multipleSelects") {
        if (typeof val === "string") {
          try {
            val = JSON.parse(val);
          } catch {
            val = [val]; 
          }
        }
      }

      answersToSave[q.questionKey] = val;

      if (val !== undefined && val !== null && val !== "") {
        if (q.type !== "multipleAttachments") {
          airtableFields[q.airtableFieldId] = val;
        }
      }
    }


    const airtable = new AirtableService(form.owner.oauth.accessToken);

    let airtableRecord = { id: "sync_skipped" };

    try {
      const tableName = form.airtableTableName || form.airtableTableId;

      if (tableName && Object.keys(airtableFields).length > 0) {
        const created = await airtable.createRecord(
          form.airtableBaseId,
          tableName,
          airtableFields
        );

        if (created?.id) airtableRecord = created;
      }
    } catch (err) {
      console.error("Airtable Sync Error:", err.response?.data || err.message);

    }

    const response = new Response({
      formId: form._id,
      airtableRecordId: airtableRecord.id || "sync_failed",
      answers: answersToSave,
      status,
    });

    await response.save();

    res.status(201).json(response);
  } catch (err) {
    console.error("Submit Error:", err);
    res.status(500).json({
      error: "Failed to submit response",
      details: err.message,
    });
  }
};

exports.getResponses = async (req, res) => {
  try {
    const { formId } = req.params;
    const responses = await Response.find({ formId }).sort({ createdAt: -1 });
    res.json(responses);
  } catch (err) {
    console.error("Fetch Responses Error:", err);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
};
