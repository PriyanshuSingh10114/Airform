const AirtableService = require("../services/airtableService");
const Response = require("../models/Response");
const User = require("../models/User");

exports.handleAirtableWebhook = async (req, res) => {
  try {
    const { baseId, webhook: { id: webhookId } } = req.body;

    // We need a user token to fetch payloads. 
    // In a real app, we'd store which user owns the webhook or base.
    // For this task, we might assume the webhook is global or we find *any* user connected to this base?
    // OR we find the Form associated with this Base?
    // Let's find a Form that uses this baseId.
    const Form = require("../models/Form");
    const form = await Form.findOne({ airtableBaseId: baseId }).populate("owner");

    if (!form || !form.owner) {
      console.log(`No local form found for base ${baseId}, skipping webhook.`);
      return res.status(200).send("OK");
    }

    const airtable = new AirtableService(form.owner.oauth.accessToken);

    // Ideally we store the last cursor for this webhook in DB to only fetch new events.
    // For now, let's just fetch recent.
    // NOTE: In production, we must track cursor in a WebhookState model.
    const payloadsData = await airtable.getWebhookPayloads(baseId, webhookId);

    for (const payload of payloadsData.payloads) {
      // Handle "changedTablesById"
      /*
        payload: {
          timestamp: "...",
          baseTransactionNumber: 15,
          actionMetadata: { ... },
          changedTablesById: {
            "tblXyz": {
              createdRecordsById: { ... },
              changedRecordsById: { ... },
              destroyedRecordIds: [ ... ]
            }
          }
        }
      */

      if (payload.changedTablesById) {
        for (const [tableId, changes] of Object.entries(payload.changedTablesById)) {
          // If this table is used by one of our forms?
          if (tableId !== form.airtableTableId) continue;
          // (Assuming one form per base/table logic for simplicity, or we check all forms)

          // Handle Updates
          if (changes.changedRecordsById) {
            for (const [recordId, recordChanges] of Object.entries(changes.changedRecordsById)) {
              // Update MongoDB
              // recordChanges.current.cellValuesByFieldId -> { "fld...": "val", ... }

              const updateData = {};
              if (recordChanges.current && recordChanges.current.cellValuesByFieldId) {
                // Map Field IDs to Question Keys? 
                // We stored Question Key -> Airtable Field ID.
                // We need reverse mapping or just update the raw JSON "answers".
                // Since `Response.answers` is Mixed, we can just update logic or replace.
                // But `answers` uses QuestionKey.
                // This is tricky: Airtable sends Field IDs. We need to map back to Form Question Keys if we want consistency.

                const fieldMap = {}; // FieldId -> QuestionKey
                form.questions.forEach(q => fieldMap[q.airtableFieldId] = q.questionKey);

                for (const [fieldId, val] of Object.entries(recordChanges.current.cellValuesByFieldId)) {
                  const key = fieldMap[fieldId];
                  if (key) {
                    updateData[`answers.${key}`] = val;
                  }
                }
              }

              if (Object.keys(updateData).length > 0) {
                await Response.findOneAndUpdate(
                  { airtableRecordId: recordId },
                  { $set: updateData }
                );
                console.log(`Synced update for record ${recordId}`);
              }
            }
          }

          // Handle Deletions
          if (changes.destroyedRecordIds) {
            for (const recordId of changes.destroyedRecordIds) {
              await Response.findOneAndUpdate(
                { airtableRecordId: recordId },
                { status: "deletedInAirtable" }
              );
              console.log(`Marked record ${recordId} as deleted`);
            }
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
