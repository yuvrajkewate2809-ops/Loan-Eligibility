/**
 * AI Loan Eligibility Checker Module
 * BFSI Risk Evaluation Engine based on Income, FOIR, Age, Credit Score, and Employment.
 */

class LoanEligibilityEngine {
  constructor() {
    this.config = window.CONFIG;
  }

  /**
   * Evaluate Loan Eligibility
   * @param {Object} data 
   * @returns {Object} assessment
   */
  evaluate(data) {
    const {
      fullName = "Valued Applicant",
      age = 30,
      monthlyIncome = 50000,
      existingEmi = 5000,
      creditScore = 750,
      employmentType = "salaried", // salaried, self_employed, business, freelance
      workExperienceYears = 3,
      requestedAmount = 1500000,
      loanType = "home",
      tenureYears = 20,
      coApplicant = false,
      coApplicantIncome = 0
    } = data;

    const loanConfig = this.config.LOAN_TYPES[loanType] || this.config.LOAN_TYPES.personal;
    
    // Total Household Disposable Income
    const totalHouseholdIncome = Number(monthlyIncome) + (coApplicant ? Number(coApplicantIncome) : 0);
    const existingMonthlyObligations = Number(existingEmi);
    
    // 1. Credit Tier & Interest Rate Adjustment
    const creditTier = this.getCreditTier(creditScore);
    const effectiveInterestRate = Math.max(5.0, loanConfig.defaultRate + creditTier.interestDiscount);
    
    // 2. FOIR (Fixed Obligation to Income Ratio) Benchmark
    // Higher earners get higher max FOIR; lower earners get conservative FOIR
    let maxAllowedFoir = loanConfig.maxFoir;
    if (totalHouseholdIncome < 30000) maxAllowedFoir = Math.max(0.40, maxAllowedFoir - 0.10);
    else if (totalHouseholdIncome > 150000) maxAllowedFoir = Math.min(0.70, maxAllowedFoir + 0.05);

    // Employment factor weighting
    let employmentMultiplier = 1.0;
    if (employmentType === "salaried") {
      employmentMultiplier = workExperienceYears >= 2 ? 1.0 : 0.90;
    } else if (employmentType === "self_employed") {
      employmentMultiplier = workExperienceYears >= 3 ? 0.95 : 0.85;
    } else if (employmentType === "business") {
      employmentMultiplier = workExperienceYears >= 3 ? 0.90 : 0.80;
    } else if (employmentType === "freelance") {
      employmentMultiplier = workExperienceYears >= 3 ? 0.80 : 0.70;
    }

    // Age eligibility: Age + Tenure must be <= 65 years
    const ageAtMaturity = Number(age) + Number(tenureYears);
    const isAgeCompliant = age >= 21 && ageAtMaturity <= 65;

    // 3. Maximum Disposable EMI for new loan
    const maxTotalEmiCapacity = totalHouseholdIncome * maxAllowedFoir * employmentMultiplier;
    const maxNewEmiCapacity = Math.max(0, maxTotalEmiCapacity - existingMonthlyObligations);

    // 4. Calculate Requested Loan's Monthly EMI
    const requestedMonthlyEmi = this.calculateEmi(Number(requestedAmount), effectiveInterestRate, Number(tenureYears));
    
    // Current projected FOIR if requested loan is approved
    const totalProjectedEmi = existingMonthlyObligations + requestedMonthlyEmi;
    const projectedFoirPercent = Math.round((totalProjectedEmi / totalHouseholdIncome) * 100);
    const currentFoirPercent = Math.round((existingMonthlyObligations / totalHouseholdIncome) * 100);

    // 5. Calculate Max Sanctionable Loan Amount from maxNewEmiCapacity
    const maxEligibleAmount = this.calculateMaxPrincipal(maxNewEmiCapacity, effectiveInterestRate, Number(tenureYears));

    // 6. Approval Probability & Risk Scoring (0 to 100)
    let scorePoints = 0;
    const reasons = [];
    const recommendations = [];

    // Credit score weighting (35 pts)
    if (creditScore >= 780) { scorePoints += 35; reasons.push("Exceptional credit score demonstrating prime repayment reliability."); }
    else if (creditScore >= 720) { scorePoints += 30; reasons.push("Solid credit score with strong credit track record."); }
    else if (creditScore >= 650) { scorePoints += 20; reasons.push("Moderate credit score; slightly higher rate applied."); recommendations.push("Keep credit card utilization under 30% to bump score above 720."); }
    else { scorePoints += 5; reasons.push("Low credit score presents higher underwriting caution."); recommendations.push("Resolve pending dues or settled accounts before reapplying."); }

    // FOIR Capacity (35 pts)
    if (requestedMonthlyEmi <= maxNewEmiCapacity) {
      scorePoints += 35;
      reasons.push(`Healthy Debt-to-Income / FOIR ratio (${projectedFoirPercent}% is well within the ${Math.round(maxAllowedFoir * 100)}% ceiling).`);
    } else if (requestedMonthlyEmi <= maxNewEmiCapacity * 1.25) {
      scorePoints += 20;
      reasons.push(`Requested EMI slightly strains income FOIR (${projectedFoirPercent}%).`);
      recommendations.push("Extend loan tenure or pay down existing debts to reduce monthly commitment.");
    } else {
      scorePoints += 5;
      reasons.push(`Total obligations (${projectedFoirPercent}%) exceed safe banking thresholds.`);
      recommendations.push(`Consider capping loan request to ₹${Math.round(maxEligibleAmount).toLocaleString('en-IN')}.`);
    }

    // Employment & Income stability (15 pts)
    if (employmentType === "salaried" && workExperienceYears >= 2) { scorePoints += 15; reasons.push("Stable salaried employment background with consistent tenure."); }
    else if (workExperienceYears >= 3) { scorePoints += 12; reasons.push("Proven business/self-employed vintage."); }
    else { scorePoints += 7; recommendations.push("Maintaining 2+ continuous years at current employer boosts lender confidence."); }

    // Age & Maturity buffer (15 pts)
    if (age >= 23 && ageAtMaturity <= 60) { scorePoints += 15; reasons.push("Optimal age bracket with sufficient productive working years."); }
    else if (isAgeCompliant) { scorePoints += 10; reasons.push("Acceptable age horizon within retirement limits."); }
    else {
      scorePoints += 0;
      reasons.push(`Age at maturity (${ageAtMaturity} yrs) exceeds standard 65-year limit.`);
      recommendations.push("Reduce loan tenure or add a younger earning co-applicant.");
    }

    // Decision Logic
    let status = "APPROVED";
    let statusBadge = "badge-success";
    let statusColor = "#10B981";
    let riskLevel = "LOW RISK";

    if (scorePoints >= 75 && isAgeCompliant && requestedMonthlyEmi <= maxNewEmiCapacity) {
      status = "APPROVED";
      statusBadge = "badge-success";
      statusColor = "#10B981";
      riskLevel = "LOW RISK";
    } else if (scorePoints >= 55 && isAgeCompliant) {
      status = "CONDITIONALLY APPROVED";
      statusBadge = "badge-warning";
      statusColor = "#F59E0B";
      riskLevel = "MODERATE RISK";
      recommendations.push("Add a co-applicant or offer collateral to fast-track underwriting.");
    } else {
      status = "HIGH RISK / REVIEW NEEDED";
      statusBadge = "badge-danger";
      statusColor = "#EF4444";
      riskLevel = "HIGH RISK";
    }

    return {
      fullName,
      status,
      statusBadge,
      statusColor,
      riskLevel,
      approvalProbability: Math.min(99, Math.max(12, scorePoints)),
      requestedAmount: Number(requestedAmount),
      maxEligibleAmount: Math.round(maxEligibleAmount),
      requestedMonthlyEmi: Math.round(requestedMonthlyEmi),
      effectiveInterestRate: Number(effectiveInterestRate.toFixed(2)),
      totalProjectedEmi: Math.round(totalProjectedEmi),
      currentFoirPercent,
      projectedFoirPercent,
      maxAllowedFoirPercent: Math.round(maxAllowedFoir * 100),
      creditScore,
      creditTier,
      tenureYears: Number(tenureYears),
      loanType: loanConfig.name,
      reasons,
      recommendations
    };
  }

  /**
   * Standard EMI Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
   */
  calculateEmi(principal, annualRate, tenureYears) {
    if (principal <= 0 || tenureYears <= 0) return 0;
    const monthlyRate = (annualRate / 100) / 12;
    const totalMonths = tenureYears * 12;
    if (monthlyRate === 0) return principal / totalMonths;
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    return (principal * monthlyRate * factor) / (factor - 1);
  }

  /**
   * Reverse EMI to Principal Present Value: P = EMI * ((1 + r)^n - 1) / (r * (1 + r)^n)
   */
  calculateMaxPrincipal(emi, annualRate, tenureYears) {
    if (emi <= 0 || tenureYears <= 0) return 0;
    const monthlyRate = (annualRate / 100) / 12;
    const totalMonths = tenureYears * 12;
    if (monthlyRate === 0) return emi * totalMonths;
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    return (emi * (factor - 1)) / (monthlyRate * factor);
  }

  /**
   * Categorize Credit Score
   */
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

window.LoanEligibilityEngine = LoanEligibilityEngine;
