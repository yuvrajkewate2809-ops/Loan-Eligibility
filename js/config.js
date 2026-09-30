/**
 * AI Loan Eligibility Checker & BFSI Intelligence Platform
 * Configuration and Constants
 */

const CONFIG = {
  APP_NAME: "CrediPulse AI",
  APP_VERSION: "2.4.0",
  DEFAULT_CURRENCY: "₹", // Supports switching to $, €, etc.
  
  // Default loan interest rates (typical BFSI benchmarks)
  LOAN_TYPES: {
    home: {
      name: "Home Loan",
      defaultRate: 8.5,
      minRate: 7.5,
      maxRate: 12.0,
      maxTenureYears: 30,
      defaultTenureYears: 20,
      maxFoir: 0.65, // Max 65% of income can go to EMIs
      icon: "fa-solid fa-house"
    },
    personal: {
      name: "Personal Loan",
      defaultRate: 11.5,
      minRate: 10.25,
      maxRate: 18.0,
      maxTenureYears: 5,
      defaultTenureYears: 3,
      maxFoir: 0.50, // Max 50% of income
      icon: "fa-solid fa-user-shield"
    },
    car: {
      name: "Vehicle / Auto Loan",
      defaultRate: 9.0,
      minRate: 8.2,
      maxRate: 14.0,
      maxTenureYears: 7,
      defaultTenureYears: 5,
      maxFoir: 0.55,
      icon: "fa-solid fa-car"
    },
    education: {
      name: "Education Loan",
      defaultRate: 9.5,
      minRate: 8.5,
      maxRate: 13.5,
      maxTenureYears: 15,
      defaultTenureYears: 7,
      maxFoir: 0.60,
      icon: "fa-solid fa-graduation-cap"
    },
    business: {
      name: "Business / MSME Loan",
      defaultRate: 12.5,
      minRate: 11.0,
      maxRate: 20.0,
      maxTenureYears: 10,
      defaultTenureYears: 5,
      maxFoir: 0.55,
      icon: "fa-solid fa-briefcase"
    }
  },

  // Credit score rating tiers
  CREDIT_TIERS: {
    EXCELLENT: { min: 780, max: 900, label: "Excellent", badgeClass: "badge-success", color: "#10B981", risk: "Very Low Risk", interestDiscount: -0.75 },
    GOOD: { min: 720, max: 779, label: "Good", badgeClass: "badge-primary", color: "#06B6D4", risk: "Low Risk", interestDiscount: -0.25 },
    FAIR: { min: 650, max: 719, label: "Fair / Average", badgeClass: "badge-warning", color: "#F59E0B", risk: "Moderate Risk", interestDiscount: 0.50 },
    POOR: { min: 580, max: 649, label: "Poor", badgeClass: "badge-danger", color: "#F97316", risk: "High Risk", interestDiscount: 1.50 },
    CRITICAL: { min: 300, max: 579, label: "Critical", badgeClass: "badge-critical", color: "#EF4444", risk: "Very High Risk", interestDiscount: 3.00 }
  },

  // Local storage keys
  STORAGE_KEYS: {
    CLAUDE_API_KEY: "bfsi_claude_api_key",
    CLAUDE_MODEL: "bfsi_claude_model",
    SHEETS_WEBHOOK_URL: "bfsi_sheets_webhook_url",
    RECORDS_HISTORY: "bfsi_records_history",
    PREFERENCES: "bfsi_user_preferences"
  },

  // Default Claude Model
  DEFAULT_CLAUDE_MODEL: "claude-3-5-sonnet-20241022",
  
  AVAILABLE_MODELS: [
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (Recommended)" },
    { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku (Fastest)" },
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus (Most Powerful)" }
  ]
};

// Export to window
window.CONFIG = CONFIG;
