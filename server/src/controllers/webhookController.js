const AirtableService = require("../services/airtableService");
const Response = require("../models/Response");

exports.handleAirtableWebhook = async (req, res) => {
  try {
    const { baseId, webhook } = req.body;
    const webhookId = webhook?.id;

    const Form = require("../models/Form");
    const form = await Form.findOne({ airtableBaseId: baseId }).populate("owner");

    if (!form || !form.owner) {
      console.log(`No local form found for base ${baseId}, skipping webhook.`);
      return res.status(200).send("OK");
    }

    const airtable = new AirtableService(form.owner.oauth.accessToken);

    const payloadsData = await airtable.getWebhookPayloads(baseId, webhookId);

    for (const payload of payloadsData.payloads || []) {
      if (!payload.changedTablesById) continue;

      const fieldMap = {};
      (form.questions || []).forEach((q) => {
        if (q.airtableFieldId) fieldMap[q.airtableFieldId] = q.questionKey;
      });

      for (const [tableId, changes] of Object.entries(payload.changedTablesById)) {
        if (form.airtableTableId && tableId !== form.airtableTableId) continue;

        if (changes.changedRecordsById) {
          for (const [recordId, recordChanges] of Object.entries(changes.changedRecordsById)) {
            const updateData = {};
            const cellValues = recordChanges.current?.cellValuesByFieldId || {};
            for (const [fieldId, val] of Object.entries(cellValues)) {
              const key = fieldMap[fieldId];
              if (key) updateData[`answers.${key}`] = val;
            }
            if (Object.keys(updateData).length > 0) {
              await Response.findOneAndUpdate({ airtableRecordId: recordId }, { $set: updateData });
              console.log(`Synced update for record ${recordId}`);
            }
          }
        }

        if (changes.destroyedRecordIds) {
          for (const rid of changes.destroyedRecordIds) {
            await Response.findOneAndUpdate({ airtableRecordId: rid }, { status: "deletedInAirtable" });
            console.log(`Marked record ${rid} as deleted`);
          }
        }
      }
    }

    res.status(200).send("Synced");
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(500).send("Webhook Failed");
  }
};
