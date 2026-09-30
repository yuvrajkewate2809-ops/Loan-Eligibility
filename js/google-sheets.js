/**
 * Google Sheets & Record Persistence Module
 * Manages local session history and dynamic synchronization with Google Sheets Webhooks.
 */

class GoogleSheetsService {
  constructor() {
    this.storageKey = window.CONFIG.STORAGE_KEYS.RECORDS_HISTORY;
    this.webhookKey = window.CONFIG.STORAGE_KEYS.SHEETS_WEBHOOK_URL;
  }

  getWebhookUrl() {
    return localStorage.getItem(this.webhookKey) || "";
  }

  setWebhookUrl(url) {
    const cleaned = url.trim();
    if (cleaned) {
      localStorage.setItem(this.webhookKey, cleaned);
    } else {
      localStorage.removeItem(this.webhookKey);
    }
  }

  hasWebhook() {
    const url = this.getWebhookUrl();
    return Boolean(url && url.startsWith("https://script.google.com/macros/s/"));
  }

  /**
   * Save a new assessment record to LocalStorage and sync to Google Sheets
   */
  async saveRecord(recordData) {
    const recordId = "REC-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900);
    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString();

    const record = {
      recordId,
      timestamp,
      formattedDate,
      ...recordData,
      syncStatus: "Local" // "Synced" or "Local" or "Failed"
    };

    // 1. Save to LocalStorage immediately
    const records = this.getAllRecords();
    records.unshift(record);
    this.saveAllRecords(records);

    // 2. Sync to Google Sheets if Webhook is configured
    if (this.hasWebhook()) {
      try {
        await this.syncToGoogleSheets(record);
        record.syncStatus = "Synced to Google Sheets";
        this.saveAllRecords(records);
      } catch (err) {
        console.warn("Google Sheets sync encountered an issue, record preserved locally:", err);
        record.syncStatus = "Pending Sync";
        this.saveAllRecords(records);
      }
    }

    return record;
  }

  /**
   * Synchronize record with Google Apps Script Webhook
   */
  async syncToGoogleSheets(record) {
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) throw new Error("No Google Sheets Webhook URL configured.");

    const payload = {
      recordId: record.recordId,
      timestamp: record.formattedDate,
      fullName: record.fullName || "Applicant",
      age: record.age || "-",
      employmentType: record.employmentType || "-",
      monthlyIncome: record.monthlyIncome || 0,
      existingEmi: record.existingEmi || 0,
      creditScore: record.creditScore || "-",
      loanAmount: record.requestedAmount || record.loanAmount || 0,
      loanType: record.loanType || "-",
      tenureYears: record.tenureYears || "-",
      eligibilityStatus: record.status || record.eligibilityStatus || "Evaluated",
      maxEligibleAmount: record.maxEligibleAmount || 0,
      monthlyEmi: record.requestedMonthlyEmi || record.monthlyEmi || 0,
      foirRatio: (record.projectedFoirPercent || record.foirRatio || "-") + "%",
      riskLevel: record.riskLevel || "Low",
      aiInsights: (record.aiInsights || "").slice(0, 300) // Brief summary for cell limit
    };

    // Google Apps Script requires text/plain or standard POST to avoid CORS preflight blocks
    const response = await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors", // Standard practice for Google Apps Script Web App endpoints
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return { status: "success", syncedAt: new Date().toISOString() };
  }

  getAllRecords() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading local records:", e);
      return [];
    }
  }

  saveAllRecords(records) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (e) {
      console.error("Error saving local records:", e);
    }
  }

  deleteRecord(recordId) {
    const records = this.getAllRecords().filter(r => r.recordId !== recordId);
    this.saveAllRecords(records);
    return records;
  }

  clearAllRecords() {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Export all records to downloadable CSV
   */
  exportToCsv() {
    const records = this.getAllRecords();
    if (records.length === 0) {
      throw new Error("No records available to export.");
    }

    const headers = [
      "Record ID", "Date", "Full Name", "Age", "Employment", "Monthly Income",
      "Existing EMIs", "Credit Score", "Loan Amount", "Loan Type", "Tenure (Yrs)",
      "Status", "Max Eligible Amount", "Monthly EMI", "FOIR %", "Risk Level"
    ];

    const rows = records.map(r => [
      `"${r.recordId || ''}"`,
      `"${r.formattedDate || ''}"`,
      `"${r.fullName || ''}"`,
      r.age || '',
      `"${r.employmentType || ''}"`,
      r.monthlyIncome || 0,
      r.existingEmi || 0,
      r.creditScore || '',
      r.requestedAmount || r.loanAmount || 0,
      `"${r.loanType || ''}"`,
      r.tenureYears || '',
      `"${r.status || ''}"`,
      r.maxEligibleAmount || 0,
      r.requestedMonthlyEmi || 0,
      r.projectedFoirPercent || '',
      `"${r.riskLevel || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CrediPulse_BFSI_Records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export records to JSON file
   */
  exportToJson() {
    const records = this.getAllRecords();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `CrediPulse_BFSI_Records_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

window.GoogleSheetsService = GoogleSheetsService;
