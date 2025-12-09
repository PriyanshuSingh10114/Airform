const Form = require("../models/Form");
const User = require("../models/User");
const Response = require("../models/Response");
const AirtableService = require("../services/airtableService");

// Submit Response
// Submit Response
exports.submitResponse = async (req, res) => {
  try {
    const { formId } = req.params;
    // req.body is populated by multer for text fields
    // req.files is populated by multer for file attachments

    const form = await Form.findById(formId).populate("owner");
    if (!form) return res.status(404).json({ error: "Form not found" });

    const status = req.body.status || "Pending"; // Fix for "status entry" issue
    const airtableFields = {};
    const answersToSave = {};

    form.questions.forEach((q) => {
      let val = req.body[q.questionKey];

      // Handle File Attachments
      if (q.type === "multipleAttachments") {
        // Find files for this field
        // multer puts them in req.files (array) if using .any() or .array()
        const filesForField = req.files
          ? req.files.filter((f) => f.fieldname === q.questionKey)
          : [];

        if (filesForField.length > 0) {
          // Store file metadata + URL
          // Note: In a real app, upload to Cloudinary/S3 for persistent public URLs.
          // valid Airtable attachment = [{ url: "..." }]
          val = filesForField.map((f) => ({
            url: `${req.protocol}://${req.get("host")}/uploads/${f.filename}`,
            name: f.originalname,
            type: f.mimetype,
          }));
        } else {
          val = [];
        }
      } else if (q.type === "multipleSelects") {
        // FormViewer stringifies array for FormData
        if (typeof val === "string") {
          try {
            val = JSON.parse(val);
          } catch (e) {
            // fallback if not json
          }
        }
      }

      // Add to mongo answers
      answersToSave[q.questionKey] = val;

      // Add to Airtable fields (Simple mapping)
      // Note: Airtable Attachments require public URLs. Localhost URLs won't sync to Airtable successfully
      // unless Airtable server can reach this machine (e.g. via ngrok).
      // We process what we can.
      if (val !== undefined && val !== "" && val !== null) {
        if (q.type === "multipleAttachments") {
          // Skip Airtable sync for local files to prevent error, or try sending URLs if you use ngrok
          // airtableFields[q.airtableFieldId] = val.map(f => ({ url: f.url })); 
          // Commented out to avoid Airtable API error with localhost URL
        } else {
          airtableFields[q.airtableFieldId] = val;
        }
      }
    });

    // Save to Airtable
    const airtable = new AirtableService(form.owner.oauth.accessToken);
    let airtableRecord = { id: "skipped_local_file" };

    try {
      // Only Create Record if we have fields to send. 
      // If we have local files only, we might still want to create the record but without files.
      if (Object.keys(airtableFields).length > 0) {
        airtableRecord = await airtable.createRecord(
          form.airtableBaseId,
          form.airtableTableId,
          airtableFields
        );
      }
    } catch (atErr) {
      console.error("Airtable Save Error:", atErr.message);
      // We continue to save to MongoDB even if Airtable fails? 
      // User probably wants that.
    }

    // Save to MongoDB
    const response = new Response({
      formId: form._id,
      airtableRecordId: airtableRecord?.id || "sync_failed",
      answers: answersToSave,
      status: status,
    });
    await response.save();

    res.status(201).json(response);

  } catch (err) {
    console.error("Submit Error:", err);
    res.status(500).json({ error: "Failed to submit response", details: err.message });
  }
};

// Get Responses (for Form Owner)
exports.getResponses = async (req, res) => {
  try {
    const { formId } = req.params;
    // TODO: Verify ownership? The route is currently protected? 
    // responseRoutes.js didn't have requireAuth on getResponses!
    // It should have it.

    const responses = await Response.find({ formId }).sort({ createdAt: -1 });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch responses" });
  }
};
