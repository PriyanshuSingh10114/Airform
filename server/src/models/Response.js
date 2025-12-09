const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form" },
    airtableRecordId: String,
    answers: mongoose.Mixed,
    status: { type: String, default: "synced" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Response", responseSchema);
