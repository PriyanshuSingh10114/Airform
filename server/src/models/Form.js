const mongoose = require("mongoose");

const conditionSchema = new mongoose.Schema(
  {
    questionKey: String,
    operator: String,
    value: mongoose.Mixed,
  },
  { _id: false }
);

const rulesSchema = new mongoose.Schema(
  {
    logic: { type: String, default: "AND" },
    conditions: [conditionSchema]
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionKey: String,
    airtableFieldId: String,
    label: String,
    type: String,
    required: Boolean,
    options: [String],
    conditional: rulesSchema,
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    airtableBaseId: String,
    airtableTableId: String,
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Form", formSchema);
