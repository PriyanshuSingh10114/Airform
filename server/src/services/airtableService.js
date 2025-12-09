const axios = require("axios");

class AirtableService {
    constructor(accessToken) {
        this.client = axios.create({
            baseURL: "https://api.airtable.com/v0",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    async getBases() {
        try {
            const { data } = await this.client.get("/meta/bases");
            return data.bases;
        } catch (error) {
            console.error("Error fetching bases:", error.response?.data || error.message);
            throw new Error("Failed to fetch Airtable bases");
        }
    }

    async getTables(baseId) {
        try {
            const { data } = await this.client.get(`/meta/bases/${baseId}/tables`);
            return data.tables;
        } catch (error) {
            console.error(`Error fetching tables for base ${baseId}:`, error.response?.data || error.message);
            throw new Error("Failed to fetch Airtable tables");
        }
    }

    async createRecord(baseId, tableId, fields) {
        try {
            const { data } = await this.client.post(`/${baseId}/${tableId}`, {
                records: [{ fields }]
            });
            return data.records[0];
        } catch (error) {
            console.error("Error creating record:", error.response?.data || error.message);
            throw new Error("Failed to create Airtable record");
        }
    }

    async getWebhookPayloads(baseId, webhookId, cursor) {
        try {
            const params = {};
            if (cursor) params.cursor = cursor;

            const { data } = await this.client.get(`/bases/${baseId}/webhooks/${webhookId}/payloads`, { params });
            return data;
        } catch (error) {
            console.error("Error fetching webhook payloads:", error.response?.data || error.message);
            throw error;
        }
    }

}

module.exports = AirtableService;
