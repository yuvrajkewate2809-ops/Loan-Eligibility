/**
 * Credit Score Analyzer Module
 * Multi-factor credit assessment and dynamic gauge visualization (300 - 900 range)
 */

class CreditScoreAnalyzer {
  constructor() {
    this.config = window.CONFIG;
  }

  /**
   * Analyze Credit Profile
   * @param {Object} factors 
   * @returns {Object} detailed report
   */
  analyze(factors) {
    const {
      onTimePaymentPct = 98,        // 35% weight: 0 - 100%
      creditUtilizationPct = 28,     // 30% weight: 0 - 100% (lower is better, ideal <=30%)
      creditHistoryYears = 6,        // 15% weight: 0 - 20+ years
      securedLoanCount = 1,          // 10% weight: home / auto
      unsecuredLoanCount = 2,        // 10% weight: credit cards / personal loans
      recentInquiries = 1,           // 10% weight: hard inquiries in past 12m
      hasDefaultsOrSettlements = false // severe penalty
    } = factors;

    // Base score range 300 to 900 (span = 600 points)
    // We compute a weighted index (0.0 to 1.0)
    
    // 1. Payment History (35%)
    let paymentScore = Math.max(0, Math.min(100, onTimePaymentPct)) / 100;
    if (onTimePaymentPct < 85) paymentScore *= 0.7; // sharp drop for defaults

    // 2. Credit Utilization (30%)
    let utilScore = 1.0;
    if (creditUtilizationPct <= 10) utilScore = 0.98; // active but minimal
    else if (creditUtilizationPct <= 30) utilScore = 1.0; // optimal sweet spot
    else if (creditUtilizationPct <= 50) utilScore = 0.75;
    else if (creditUtilizationPct <= 75) utilScore = 0.50;
    else utilScore = 0.25;

    // 3. Credit Age (15%)
    let ageScore = Math.min(1.0, creditHistoryYears / 10); // 10+ years gets full 1.0
    if (creditHistoryYears < 1) ageScore = 0.2;

    // 4. Credit Mix (10%)
    let mixScore = 0.5;
    if (securedLoanCount > 0 && unsecuredLoanCount > 0) mixScore = 1.0; // healthy diversified mix
    else if (unsecuredLoanCount > 4) mixScore = 0.6; // too credit card heavy
    else if (securedLoanCount > 0) mixScore = 0.85;

    // 5. Hard Inquiries (10%)
    let inquiryScore = 1.0;
    if (recentInquiries <= 1) inquiryScore = 1.0;
    else if (recentInquiries <= 3) inquiryScore = 0.8;
    else if (recentInquiries <= 6) inquiryScore = 0.5;
    else inquiryScore = 0.2; // credit hungry behavior

    // Composite Index (0 to 1.0)
    let composite = (
      (paymentScore * 0.35) +
      (utilScore * 0.30) +
      (ageScore * 0.15) +
      (mixScore * 0.10) +
      (inquiryScore * 0.10)
    );

    if (hasDefaultsOrSettlements) {
      composite *= 0.65; // Major 35% overall reduction for bankruptcy/settlement
    }

    // Convert to 300 - 900 scale
    let estimatedScore = Math.round(300 + (composite * 600));
    estimatedScore = Math.max(300, Math.min(900, estimatedScore));

    const tier = this.getCreditTier(estimatedScore);

    // Detail breakdown
    const breakdown = [
      {
        factor: "Payment Track Record",
        weight: "35%",
        status: onTimePaymentPct >= 95 ? "Excellent" : onTimePaymentPct >= 88 ? "Fair" : "Needs Attention",
        score: Math.round(paymentScore * 100),
        detail: `${onTimePaymentPct}% on-time payments recorded`,
        positive: onTimePaymentPct >= 95,
        color: onTimePaymentPct >= 95 ? "#10B981" : "#F59E0B"
      },
      {
        factor: "Credit Utilization Ratio",
        weight: "30%",
        status: creditUtilizationPct <= 30 ? "Optimal (<30%)" : creditUtilizationPct <= 50 ? "Moderate" : "High Risk",
        score: Math.round(utilScore * 100),
        detail: `${creditUtilizationPct}% of credit limits currently in use`,
        positive: creditUtilizationPct <= 30,
        color: creditUtilizationPct <= 30 ? "#10B981" : creditUtilizationPct <= 50 ? "#F59E0B" : "#EF4444"
      },
      {
        factor: "Credit History Vintage",
        weight: "15%",
        status: creditHistoryYears >= 5 ? "Seasoned" : creditHistoryYears >= 2 ? "Moderate" : "Nascent",
        score: Math.round(ageScore * 100),
        detail: `${creditHistoryYears} years oldest account history`,
        positive: creditHistoryYears >= 4,
        color: creditHistoryYears >= 4 ? "#10B981" : "#06B6D4"
      },
      {
        factor: "Credit Diversity Mix",
        weight: "10%",
        status: (securedLoanCount > 0 && unsecuredLoanCount > 0) ? "Balanced" : "Single Asset Class",
        score: Math.round(mixScore * 100),
        detail: `${securedLoanCount} Secured, ${unsecuredLoanCount} Unsecured accounts`,
        positive: securedLoanCount > 0 && unsecuredLoanCount > 0,
        color: "#8B5CF6"
      },
      {
        factor: "Recent Hard Inquiries",
        weight: "10%",
        status: recentInquiries <= 2 ? "Safe" : "Frequent Inquiries",
        score: Math.round(inquiryScore * 100),
        detail: `${recentInquiries} lender inquiries in 12 months`,
        positive: recentInquiries <= 2,
        color: recentInquiries <= 2 ? "#10B981" : "#EF4444"
      }
    ];

    // Actionable improvement roadmap
    const actionableRoadmap = [];
    if (creditUtilizationPct > 30) {
      const targetUtil = 25;
      actionableRoadmap.push({
        action: "Reduce Credit Card Outstanding",
        impact: "+25 to +40 Points",
        tip: `Pay down balances until utilization drops from ${creditUtilizationPct}% to under 30%. Never max out cards near cycle closing dates.`
      });
    }
    if (recentInquiries > 2) {
      actionableRoadmap.push({
        action: "Pause Multiple Loan Applications",
        impact: "+10 to +18 Points",
        tip: "Avoid submitting simultaneous loan applications within 90 days. Rate-shop within a narrow 14-day window instead."
      });
    }
    if (creditHistoryYears < 3) {
      actionableRoadmap.push({
        action: "Nurture Account Longevity",
        impact: "+15 to +30 Points Over Time",
        tip: "Keep your earliest credit card active with nominal monthly recurring subscriptions and automatic bill pay."
      });
    }
    if (onTimePaymentPct < 98) {
      actionableRoadmap.push({
        action: "Set Auto-Debit for Minimum Due",
        impact: "+35 to +60 Points",
        tip: "Even a single 30-day late payment stays on reports for up to 36 months. Configure automated bank mandates."
      });
    }
    if (actionableRoadmap.length === 0) {
      actionableRoadmap.push({
        action: "Maintain Prime Profile",
        impact: "Sustain 800+ Tier",
        tip: "Your credit health is in top 10% percentile. Regularly review credit bureau reports annually to catch identity fraud early."
      });
    }

    return {
      estimatedScore,
      tier,
      breakdown,
      actionableRoadmap,
      riskAssessment: tier.risk,
      interestDiscountNotice: tier.interestDiscount <= 0 ? 
        `Eligible for preferential discount: ${Math.abs(tier.interestDiscount)}% off standard base lending rate.` :
        `Higher credit risk premium: +${tier.interestDiscount}% added to base rate.`
    };
  }

  getCreditTier(score) {
    const s = Number(score);
    const tiers = this.config.CREDIT_TIERS;
    if (s >= 780) return tiers.EXCELLENT;
    if (s >= 720) return tiers.GOOD;
    if (s >= 650) return tiers.FAIR;
    if (s >= 580) return tiers.POOR;
    return tiers.CRITICAL;
  }
}

window.CreditScoreAnalyzer = CreditScoreAnalyzer;
