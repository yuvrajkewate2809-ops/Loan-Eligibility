/**
 * CrediPulse AI - Main Application Controller
 * Orchestrates UI tabs, calculations, AI integration, and Google Sheets sync.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize services
  const loanEngine = new window.LoanEligibilityEngine();
  const creditAnalyzer = new window.CreditScoreAnalyzer();
  const emiCalculator = new window.EmiCalculator();
  const claudeService = new window.ClaudeAIService();
  const sheetsService = new window.GoogleSheetsService();

  // State
  let currentEvaluation = null;
  let currentCreditAnalysis = null;
  let currentEmiAnalysis = null;

  // Cache DOM Elements
  const DOM = {
    // Tabs & Navigation
    navTabs: document.querySelectorAll(".nav-tab-btn"),
    tabViews: document.querySelectorAll(".tab-view"),
    brandHomeBtn: document.getElementById("brandHomeBtn"),
    
    // Header & Quick Action Buttons
    btnOpenSettings: document.getElementById("btnOpenSettings"),
    btnExportQuickReport: document.getElementById("btnExportQuickReport"),
    btnQuickEvaluate: document.getElementById("btnQuickEvaluate"),
    btnLoadDemoApplicant: document.getElementById("btnLoadDemoApplicant"),
    heroAiStatus: document.getElementById("heroAiStatus"),
    heroAiMode: document.getElementById("heroAiMode"),
    heroSheetStatus: document.getElementById("heroSheetStatus"),
    
    // Loan Eligibility Form & Inputs
    loanForm: document.getElementById("loanForm"),
    applicantName: document.getElementById("applicantName"),
    applicantAge: document.getElementById("applicantAge"),
    applicantAgeSlider: document.getElementById("applicantAgeSlider"),
    applicantAgeDisplay: document.getElementById("applicantAgeDisplay"),
    employmentType: document.getElementById("employmentType"),
    monthlyIncome: document.getElementById("monthlyIncome"),
    monthlyIncomeSlider: document.getElementById("monthlyIncomeSlider"),
    monthlyIncomeDisplay: document.getElementById("monthlyIncomeDisplay"),
    existingEmi: document.getElementById("existingEmi"),
    existingEmiSlider: document.getElementById("existingEmiSlider"),
    existingEmiDisplay: document.getElementById("existingEmiDisplay"),
    creditScoreInput: document.getElementById("creditScoreInput"),
    creditScoreSlider: document.getElementById("creditScoreSlider"),
    creditScoreDisplay: document.getElementById("creditScoreDisplay"),
    workExperience: document.getElementById("workExperience"),
    loanTypeSelect: document.getElementById("loanTypeSelect"),
    loanTenureYears: document.getElementById("loanTenureYears"),
    loanTenureSlider: document.getElementById("loanTenureSlider"),
    loanTenureDisplay: document.getElementById("loanTenureDisplay"),
    requestedLoanAmount: document.getElementById("requestedLoanAmount"),
    requestedAmountSlider: document.getElementById("requestedAmountSlider"),
    requestedAmountDisplay: document.getElementById("requestedAmountDisplay"),
    coApplicantCheck: document.getElementById("coApplicantCheck"),
    coApplicantFields: document.getElementById("coApplicantFields"),
    coApplicantIncome: document.getElementById("coApplicantIncome"),
    btnResetLoanForm: document.getElementById("btnResetLoanForm"),

    // Loan Results
    resultStatusBanner: document.getElementById("resultStatusBanner"),
    resultStatusHeading: document.getElementById("resultStatusHeading"),
    resultStatusSubtext: document.getElementById("resultStatusSubtext"),
    resultRiskLevel: document.getElementById("resultRiskLevel"),
    resultProbabilityBadge: document.getElementById("resultProbabilityBadge"),
    resultProbabilityVal: document.getElementById("resultProbabilityVal"),
    resMaxLoan: document.getElementById("resMaxLoan"),
    resMonthlyEmi: document.getElementById("resMonthlyEmi"),
    resEffectiveRate: document.getElementById("resEffectiveRate"),
    foirValueDisplay: document.getElementById("foirValueDisplay"),
    foirProgressBar: document.getElementById("foirProgressBar"),
    foirCeilingDisplay: document.getElementById("foirCeilingDisplay"),
    underwritingReasonsList: document.getElementById("underwritingReasonsList"),
    btnSyncCurrentToSheets: document.getElementById("btnSyncCurrentToSheets"),
    btnAskClaudeDeepDive: document.getElementById("btnAskClaudeDeepDive"),
    btnSendToEmiCalc: document.getElementById("btnSendToEmiCalc"),

    // Credit Analyzer Elements
    onTimePaymentSlider: document.getElementById("onTimePaymentSlider"),
    onTimePaymentVal: document.getElementById("onTimePaymentVal"),
    creditUtilSlider: document.getElementById("creditUtilSlider"),
    creditUtilVal: document.getElementById("creditUtilVal"),
    creditAgeSlider: document.getElementById("creditAgeSlider"),
    creditAgeVal: document.getElementById("creditAgeVal"),
    securedLoansCount: document.getElementById("securedLoansCount"),
    unsecuredLoansCount: document.getElementById("unsecuredLoansCount"),
    recentInquiriesSlider: document.getElementById("recentInquiriesSlider"),
    recentInquiriesVal: document.getElementById("recentInquiriesVal"),
    defaultsCheck: document.getElementById("defaultsCheck"),
    btnReanalyzeCredit: document.getElementById("btnReanalyzeCredit"),
    gaugeMeterArc: document.getElementById("gaugeMeterArc"),
    gaugeScoreNumber: document.getElementById("gaugeScoreNumber"),
    gaugeTierPillText: document.getElementById("gaugeTierPillText"),
    creditTierBadge: document.getElementById("creditTierBadge"),
    creditRateImpactNotice: document.getElementById("creditRateImpactNotice"),
    creditFactorsBreakdownList: document.getElementById("creditFactorsBreakdownList"),
    creditRoadmapContainer: document.getElementById("creditRoadmapContainer"),

    // EMI Calculator Elements
    emiLoanAmount: document.getElementById("emiLoanAmount"),
    emiLoanAmountSlider: document.getElementById("emiLoanAmountSlider"),
    emiLoanAmountDisplay: document.getElementById("emiLoanAmountDisplay"),
    emiInterestRate: document.getElementById("emiInterestRate"),
    emiInterestRateSlider: document.getElementById("emiInterestRateSlider"),
    emiInterestRateDisplay: document.getElementById("emiInterestRateDisplay"),
    emiTenureYears: document.getElementById("emiTenureYears"),
    emiTenureYearsSlider: document.getElementById("emiTenureYearsSlider"),
    emiTenureYearsDisplay: document.getElementById("emiTenureYearsDisplay"),
    emiExtraPayment: document.getElementById("emiExtraPayment"),
    emiExtraPaymentSlider: document.getElementById("emiExtraPaymentSlider"),
    emiExtraPaymentDisplay: document.getElementById("emiExtraPaymentDisplay"),
    prepaymentSavingsBadge: document.getElementById("prepaymentSavingsBadge"),
    emiMonthlyResult: document.getElementById("emiMonthlyResult"),
    emiTotalInterestResult: document.getElementById("emiTotalInterestResult"),
    emiTotalPayableResult: document.getElementById("emiTotalPayableResult"),
    emiInterestPercentResult: document.getElementById("emiInterestPercentResult"),
    prepaymentCallout: document.getElementById("prepaymentCallout"),
    prepaymentCalloutText: document.getElementById("prepaymentCalloutText"),
    amortizationTableBody: document.getElementById("amortizationTableBody"),
    btnExportAmortizationCsv: document.getElementById("btnExportAmortizationCsv"),
    presetButtons: document.querySelectorAll(".preset-btn"),

    // Claude AI Section
    aiAssessmentContainer: document.getElementById("aiAssessmentContainer"),
    aiAssessmentModelBadge: document.getElementById("aiAssessmentModelBadge"),
    btnRefreshAiAssessment: document.getElementById("btnRefreshAiAssessment"),
    btnCopyAiAssessment: document.getElementById("btnCopyAiAssessment"),
    chatMessagesStream: document.getElementById("chatMessagesStream"),
    chatInputForm: document.getElementById("chatInputForm"),
    chatInputField: document.getElementById("chatInputField"),
    promptChips: document.querySelectorAll(".prompt-chip"),

    // Records & Sheets Elements
    recordsTableBody: document.getElementById("recordsTableBody"),
    recordsCountDisplay: document.getElementById("recordsCountDisplay"),
    recordsSearchInput: document.getElementById("recordsSearchInput"),
    btnManualSyncSheets: document.getElementById("btnManualSyncSheets"),
    btnExportRecordsCsv: document.getElementById("btnExportRecordsCsv"),
    btnExportRecordsJson: document.getElementById("btnExportRecordsJson"),
    btnClearAllRecords: document.getElementById("btnClearAllRecords"),
    btnConfigureWebhookDirect: document.getElementById("btnConfigureWebhookDirect"),
    recordsSyncHeaderStatus: document.getElementById("recordsSyncHeaderStatus"),
    recordsSyncHeaderSubtext: document.getElementById("recordsSyncHeaderSubtext"),

    // Settings Modal Elements
    settingsModal: document.getElementById("settingsModal"),
    btnCloseSettingsModal: document.getElementById("btnCloseSettingsModal"),
    btnCancelSettings: document.getElementById("btnCancelSettings"),
    btnSaveSettings: document.getElementById("btnSaveSettings"),
    settingsClaudeKey: document.getElementById("settingsClaudeKey"),
    settingsClaudeModel: document.getElementById("settingsClaudeModel"),
    settingsSheetsUrl: document.getElementById("settingsSheetsUrl"),
    btnTestSheetsConnection: document.getElementById("btnTestSheetsConnection"),

    // Printable Report Modal Elements
    reportModal: document.getElementById("reportModal"),
    btnCloseReportModal: document.getElementById("btnCloseReportModal"),
    btnPrintReportDirect: document.getElementById("btnPrintReportDirect"),
    btnDownloadReportPdf: document.getElementById("btnDownloadReportPdf"),
    printableReportContent: document.getElementById("printableReportContent"),

    // Toast Container
    toastContainer: document.getElementById("toastContainer")
  };

  /* =========================================================================
     1. TAB SWITCHING LOGIC
     ========================================================================= */
  function switchTab(targetTabId) {
    DOM.navTabs.forEach(tab => {
      const isTarget = tab.getAttribute("data-tab") === targetTabId;
      tab.classList.toggle("active", isTarget);
      tab.setAttribute("aria-selected", isTarget);
    });

    DOM.tabViews.forEach(view => {
      view.classList.toggle("active", view.id === targetTabId);
    });

    // If switching to EMI tab, re-render chart to ensure dimensions
    if (targetTabId === "tab-emi-calculator") {
      updateEmiCalculations();
    }
  }

  DOM.navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");
      switchTab(target);
    });
  });

  DOM.brandHomeBtn.addEventListener("click", () => switchTab("tab-loan-checker"));

  /* =========================================================================
     2. DUAL-BINDING SLIDERS & INPUTS
     ========================================================================= */
  function bindSliderAndInput(input, slider, display, formatter) {
    if (!input || !slider) return;

    slider.addEventListener("input", () => {
      input.value = slider.value;
      if (display) display.textContent = formatter ? formatter(slider.value) : slider.value;
    });

    input.addEventListener("input", () => {
      slider.value = input.value;
      if (display) display.textContent = formatter ? formatter(input.value) : input.value;
    });
  }

  // Loan Form Bindings
  bindSliderAndInput(DOM.applicantAge, DOM.applicantAgeSlider, DOM.applicantAgeDisplay, v => `${v} yrs`);
  bindSliderAndInput(DOM.monthlyIncome, DOM.monthlyIncomeSlider, DOM.monthlyIncomeDisplay, v => `₹${Number(v).toLocaleString('en-IN')}`);
  bindSliderAndInput(DOM.existingEmi, DOM.existingEmiSlider, DOM.existingEmiDisplay, v => `₹${Number(v).toLocaleString('en-IN')}`);
  bindSliderAndInput(DOM.creditScoreInput, DOM.creditScoreSlider, DOM.creditScoreDisplay, v => `${v} (${v >= 750 ? 'Prime' : v >= 650 ? 'Fair' : 'Subprime'})`);
  bindSliderAndInput(DOM.loanTenureYears, DOM.loanTenureSlider, DOM.loanTenureDisplay, v => `${v} Years`);
  bindSliderAndInput(DOM.requestedLoanAmount, DOM.requestedAmountSlider, DOM.requestedAmountDisplay, v => `₹${Number(v).toLocaleString('en-IN')}`);

  // Credit Analyzer Bindings
  DOM.onTimePaymentSlider?.addEventListener("input", e => {
    DOM.onTimePaymentVal.textContent = `${e.target.value}% On-Time`;
    runCreditAnalysis();
  });
  DOM.creditUtilSlider?.addEventListener("input", e => {
    DOM.creditUtilVal.textContent = `${e.target.value}% (${e.target.value <= 30 ? 'Ideal <30%' : 'High'})`;
    runCreditAnalysis();
  });
  DOM.creditAgeSlider?.addEventListener("input", e => {
    DOM.creditAgeVal.textContent = `${e.target.value} Years`;
    runCreditAnalysis();
  });
  DOM.recentInquiriesSlider?.addEventListener("input", e => {
    DOM.recentInquiriesVal.textContent = `${e.target.value} ${e.target.value == 1 ? 'Inquiry' : 'Inquiries'}`;
    runCreditAnalysis();
  });
  DOM.securedLoansCount?.addEventListener("input", runCreditAnalysis);
  DOM.unsecuredLoansCount?.addEventListener("input", runCreditAnalysis);
  DOM.defaultsCheck?.addEventListener("change", runCreditAnalysis);

  // EMI Calculator Bindings
  bindSliderAndInput(DOM.emiLoanAmount, DOM.emiLoanAmountSlider, DOM.emiLoanAmountDisplay, v => `₹${Number(v).toLocaleString('en-IN')}`);
  bindSliderAndInput(DOM.emiInterestRate, DOM.emiInterestRateSlider, DOM.emiInterestRateDisplay, v => `${Number(v).toFixed(1)}% p.a.`);
  bindSliderAndInput(DOM.emiTenureYears, DOM.emiTenureYearsSlider, DOM.emiTenureYearsDisplay, v => `${v} Years (${v * 12} Mos)`);
  bindSliderAndInput(DOM.emiExtraPayment, DOM.emiExtraPaymentSlider, DOM.emiExtraPaymentDisplay, v => `₹${Number(v).toLocaleString('en-IN')}`);

  [DOM.emiLoanAmount, DOM.emiLoanAmountSlider, DOM.emiInterestRate, DOM.emiInterestRateSlider, DOM.emiTenureYears, DOM.emiTenureYearsSlider, DOM.emiExtraPayment, DOM.emiExtraPaymentSlider].forEach(el => {
    el?.addEventListener("input", updateEmiCalculations);
  });

  // Co-Applicant Toggle
  DOM.coApplicantCheck.addEventListener("change", (e) => {
    DOM.coApplicantFields.style.display = e.target.checked ? "block" : "none";
  });

  // Quick Preset Loan Types in EMI Tab
  DOM.presetButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type");
      const config = window.CONFIG.LOAN_TYPES[type];
      if (config) {
        DOM.emiInterestRate.value = config.defaultRate;
        DOM.emiInterestRateSlider.value = config.defaultRate;
        DOM.emiInterestRateDisplay.textContent = `${config.defaultRate}% p.a.`;
        DOM.emiTenureYears.value = config.defaultTenureYears;
        DOM.emiTenureYearsSlider.value = config.defaultTenureYears;
        DOM.emiTenureYearsDisplay.textContent = `${config.defaultTenureYears} Years (${config.defaultTenureYears * 12} Mos)`;
        updateEmiCalculations();
        showToast(`Loaded ${config.name} defaults (${config.defaultRate}% rate)`, "info");
      }
    });
  });

  /* =========================================================================
     3. LOAN ELIGIBILITY ENGINE EXECUTION
     ========================================================================= */
  function runLoanEvaluation() {
    // Validate required inputs
    const fullName = DOM.applicantName.value.trim() || "Applicant";
    const age = Number(DOM.applicantAge.value);
    const monthlyIncome = Number(DOM.monthlyIncome.value);
    const existingEmi = Number(DOM.existingEmi.value);
    const creditScore = Number(DOM.creditScoreInput.value);
    const employmentType = DOM.employmentType.value;
    const workExperienceYears = Number(DOM.workExperience.value);
    const requestedAmount = Number(DOM.requestedLoanAmount.value);
    const loanType = DOM.loanTypeSelect.value;
    const tenureYears = Number(DOM.loanTenureYears.value);
    const coApplicant = DOM.coApplicantCheck.checked;
    const coApplicantIncome = Number(DOM.coApplicantIncome.value || 0);

    if (monthlyIncome <= 0 || requestedAmount <= 0) {
      showToast("Please enter valid income and loan amount values.", "warning");
      return;
    }

    // Run Engine
    const result = loanEngine.evaluate({
      fullName,
      age,
      monthlyIncome,
      existingEmi,
      creditScore,
      employmentType,
      workExperienceYears,
      requestedAmount,
      loanType,
      tenureYears,
      coApplicant,
      coApplicantIncome
    });

    currentEvaluation = result;
    renderLoanResult(result);

    // Also update credit analyzer tab with this credit score
    syncCreditScoreToAnalyzer(creditScore);

    // Confetti if approved!
    if (result.status === "APPROVED" && typeof confetti === "function") {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00F2FE', '#4FACFE', '#10B981']
      });
    }

    showToast(`Eligibility Evaluated: ${result.status}`, result.status === "APPROVED" ? "success" : "info");
  }

  function renderLoanResult(r) {
    DOM.resultRiskLevel.textContent = `${r.riskLevel} PROFILE`;
    DOM.resultStatusHeading.textContent = r.status;
    DOM.resultProbabilityVal.textContent = `${r.approvalProbability}%`;

    // Status Banner class
    DOM.resultStatusBanner.className = "eligibility-status-banner";
    if (r.status === "APPROVED") {
      DOM.resultStatusBanner.classList.add("status-approved");
      DOM.resultProbabilityBadge.style.color = "#10B981";
      DOM.resultStatusSubtext.textContent = "Strong income buffer & prime credit record satisfy primary banking thresholds.";
    } else if (r.status.includes("CONDITIONALLY")) {
      DOM.resultStatusBanner.classList.add("status-conditional");
      DOM.resultProbabilityBadge.style.color = "#F59E0B";
      DOM.resultStatusSubtext.textContent = "Viable repayment capacity with slight FOIR or tenure sensitivity. Co-applicant recommended.";
    } else {
      DOM.resultStatusBanner.classList.add("status-declined");
      DOM.resultProbabilityBadge.style.color = "#EF4444";
      DOM.resultStatusSubtext.textContent = "Requested loan exceeds institutional FOIR threshold or minimum credit benchmark.";
    }

    DOM.resMaxLoan.textContent = `₹${r.maxEligibleAmount.toLocaleString('en-IN')}`;
    DOM.resMonthlyEmi.textContent = `₹${r.requestedMonthlyEmi.toLocaleString('en-IN')}`;
    DOM.resEffectiveRate.textContent = `at ${r.effectiveInterestRate}% p.a. effective`;

    // FOIR Progress
    const foir = r.projectedFoirPercent;
    DOM.foirValueDisplay.textContent = `${foir}% (${foir <= 50 ? 'Safe' : foir <= 65 ? 'Moderate' : 'Stretched'})`;
    DOM.foirProgressBar.style.width = `${Math.min(100, foir)}%`;
    DOM.foirCeilingDisplay.textContent = `${r.maxAllowedFoirPercent}%`;

    if (foir <= 50) {
      DOM.foirProgressBar.style.background = "linear-gradient(90deg, #10B981, #06B6D4)";
    } else if (foir <= 65) {
      DOM.foirProgressBar.style.background = "linear-gradient(90deg, #F59E0B, #F97316)";
    } else {
      DOM.foirProgressBar.style.background = "linear-gradient(90deg, #EF4444, #B91C1C)";
    }

    // Reasons List
    DOM.underwritingReasonsList.innerHTML = "";
    r.reasons.forEach(reason => {
      const li = document.createElement("li");
      li.textContent = reason;
      DOM.underwritingReasonsList.appendChild(li);
    });

    if (r.recommendations.length > 0) {
      r.recommendations.forEach(rec => {
        const li = document.createElement("li");
        li.innerHTML = `<strong style="color: var(--accent-cyan);">Advice:</strong> ${rec}`;
        DOM.underwritingReasonsList.appendChild(li);
      });
    }
  }

  // Form submit event
  DOM.loanForm.addEventListener("submit", (e) => {
    e.preventDefault();
    runLoanEvaluation();
  });

  DOM.btnQuickEvaluate.addEventListener("click", () => {
    switchTab("tab-loan-checker");
    runLoanEvaluation();
  });

  // Reset form
  DOM.btnResetLoanForm.addEventListener("click", () => {
    DOM.loanForm.reset();
    DOM.applicantAgeSlider.value = 29;
    DOM.monthlyIncomeSlider.value = 85000;
    DOM.existingEmiSlider.value = 12000;
    DOM.creditScoreSlider.value = 765;
    DOM.loanTenureSlider.value = 20;
    DOM.requestedAmountSlider.value = 3500000;
    DOM.applicantAgeDisplay.textContent = "29 yrs";
    DOM.monthlyIncomeDisplay.textContent = "₹85,000";
    DOM.existingEmiDisplay.textContent = "₹12,000";
    DOM.creditScoreDisplay.textContent = "765 (Good)";
    DOM.loanTenureDisplay.textContent = "20 Years";
    DOM.requestedAmountDisplay.textContent = "₹35,00,000";
    DOM.coApplicantFields.style.display = "none";
    runLoanEvaluation();
    showToast("Form reset to defaults.", "info");
  });

  // Demo Applicant Loader
  DOM.btnLoadDemoApplicant.addEventListener("click", () => {
    DOM.applicantName.value = "Ananya Roy";
    DOM.applicantAge.value = 32;
    DOM.applicantAgeSlider.value = 32;
    DOM.applicantAgeDisplay.textContent = "32 yrs";
    DOM.employmentType.value = "salaried";
    DOM.monthlyIncome.value = 120000;
    DOM.monthlyIncomeSlider.value = 120000;
    DOM.monthlyIncomeDisplay.textContent = "₹1,20,000";
    DOM.existingEmi.value = 15000;
    DOM.existingEmiSlider.value = 15000;
    DOM.existingEmiDisplay.textContent = "₹15,000";
    DOM.creditScoreInput.value = 810;
    DOM.creditScoreSlider.value = 810;
    DOM.creditScoreDisplay.textContent = "810 (Prime)";
    DOM.loanTypeSelect.value = "home";
    DOM.loanTenureYears.value = 20;
    DOM.loanTenureSlider.value = 20;
    DOM.loanTenureDisplay.textContent = "20 Years";
    DOM.requestedLoanAmount.value = 4500000;
    DOM.requestedAmountSlider.value = 4500000;
    DOM.requestedAmountDisplay.textContent = "₹45,00,000";
    DOM.coApplicantCheck.checked = true;
    DOM.coApplicantFields.style.display = "block";
    DOM.coApplicantIncome.value = 60000;

    switchTab("tab-loan-checker");
    runLoanEvaluation();
    showToast("Loaded Prime Sample Profile (Ananya Roy)", "success");
  });

  /* =========================================================================
     4. CREDIT SCORE ANALYZER EXECUTION
     ========================================================================= */
  function runCreditAnalysis() {
    const onTimePaymentPct = Number(DOM.onTimePaymentSlider.value);
    const creditUtilizationPct = Number(DOM.creditUtilSlider.value);
    const creditHistoryYears = Number(DOM.creditAgeSlider.value);
    const securedLoanCount = Number(DOM.securedLoansCount.value);
    const unsecuredLoanCount = Number(DOM.unsecuredLoansCount.value);
    const recentInquiries = Number(DOM.recentInquiriesSlider.value);
    const hasDefaultsOrSettlements = DOM.defaultsCheck.checked;

    const report = creditAnalyzer.analyze({
      onTimePaymentPct,
      creditUtilizationPct,
      creditHistoryYears,
      securedLoanCount,
      unsecuredLoanCount,
      recentInquiries,
      hasDefaultsOrSettlements
    });

    currentCreditAnalysis = report;
    renderCreditReport(report);
  }

  function renderCreditReport(r) {
    DOM.gaugeScoreNumber.textContent = r.estimatedScore;
    DOM.gaugeTierPillText.textContent = `${r.tier.label} / ${r.tier.risk}`;
    DOM.creditTierBadge.textContent = `${r.tier.label} Tier`;
    DOM.creditTierBadge.className = `badge ${r.tier.badgeClass}`;
    DOM.creditRateImpactNotice.textContent = r.interestDiscountNotice;

    // SVG Gauge Needle/Arc Animation
    // Total circumference arc length is approx 251.2
    // Fraction is (score - 300) / 600
    const fraction = (r.estimatedScore - 300) / 600;
    const strokeDash = 251.2;
    const offset = strokeDash - (fraction * strokeDash);
    DOM.gaugeMeterArc.style.strokeDashoffset = offset;

    // Factors list
    DOM.creditFactorsBreakdownList.innerHTML = "";
    r.breakdown.forEach(factor => {
      const item = document.createElement("div");
      item.className = "factor-item";
      item.innerHTML = `
        <div>
          <div class="factor-name">${factor.factor} <span style="font-size: 0.75rem; color: var(--text-muted);">(${factor.weight})</span></div>
          <div class="factor-detail">${factor.detail}</div>
        </div>
        <div style="text-align: right;">
          <span class="badge" style="background: rgba(255,255,255,0.06); color: ${factor.color}; border: 1px solid ${factor.color}40;">
            ${factor.status}
          </span>
        </div>
      `;
      DOM.creditFactorsBreakdownList.appendChild(item);
    });

    // Roadmap items
    DOM.creditRoadmapContainer.innerHTML = "";
    r.actionableRoadmap.forEach(item => {
      const card = document.createElement("div");
      card.style.cssText = "background: rgba(11, 18, 33, 0.6); border: 1px solid var(--border-glass); border-radius: 12px; padding: 0.85rem 1rem;";
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-main);">${item.action}</span>
          <span class="badge badge-success" style="font-size: 0.7rem;">${item.impact}</span>
        </div>
        <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0;">${item.tip}</p>
      `;
      DOM.creditRoadmapContainer.appendChild(card);
    });
  }

  function syncCreditScoreToAnalyzer(score) {
    if (score >= 780) {
      DOM.onTimePaymentSlider.value = 99;
      DOM.creditUtilSlider.value = 18;
      DOM.creditAgeSlider.value = 8;
      DOM.recentInquiriesSlider.value = 0;
      DOM.defaultsCheck.checked = false;
    } else if (score >= 700) {
      DOM.onTimePaymentSlider.value = 95;
      DOM.creditUtilSlider.value = 35;
      DOM.creditAgeSlider.value = 4;
      DOM.recentInquiriesSlider.value = 2;
      DOM.defaultsCheck.checked = false;
    } else {
      DOM.onTimePaymentSlider.value = 82;
      DOM.creditUtilSlider.value = 68;
      DOM.creditAgeSlider.value = 2;
      DOM.recentInquiriesSlider.value = 4;
    }

    DOM.onTimePaymentVal.textContent = `${DOM.onTimePaymentSlider.value}% On-Time`;
    DOM.creditUtilVal.textContent = `${DOM.creditUtilSlider.value}%`;
    DOM.creditAgeVal.textContent = `${DOM.creditAgeSlider.value} Years`;
    DOM.recentInquiriesVal.textContent = `${DOM.recentInquiriesSlider.value} Inquiries`;
    runCreditAnalysis();
  }

  DOM.btnReanalyzeCredit.addEventListener("click", runCreditAnalysis);

  /* =========================================================================
     5. EMI CALCULATOR EXECUTION & CHART
     ========================================================================= */
  function updateEmiCalculations() {
    const principal = Number(DOM.emiLoanAmount.value);
    const rate = Number(DOM.emiInterestRate.value);
    const tenureYears = Number(DOM.emiTenureYears.value);
    const extraPayment = Number(DOM.emiExtraPayment.value || 0);

    const result = emiCalculator.calculate(principal, rate, tenureYears, extraPayment);
    currentEmiAnalysis = result;

    DOM.emiMonthlyResult.textContent = `₹${result.monthlyEmi.toLocaleString('en-IN')}`;
    DOM.emiTotalInterestResult.textContent = `₹${result.totalInterest.toLocaleString('en-IN')}`;
    DOM.emiTotalPayableResult.textContent = `₹${result.totalPayment.toLocaleString('en-IN')}`;
    DOM.emiInterestPercentResult.textContent = `${result.interestRatioPct}% of total`;

    // Prepayment savings callout
    if (result.prepaymentSavings.hasPrepayment && result.prepaymentSavings.interestSaved > 0) {
      DOM.prepaymentCallout.style.display = "block";
      DOM.prepaymentSavingsBadge.textContent = `Saves ₹${result.prepaymentSavings.interestSaved.toLocaleString('en-IN')}`;
      DOM.prepaymentCalloutText.textContent = `By paying an extra ₹${extraPayment.toLocaleString('en-IN')}/mo, you save ₹${result.prepaymentSavings.interestSaved.toLocaleString('en-IN')} in interest and clear your debt ${result.prepaymentSavings.tenureReducedYears} years earlier!`;
    } else {
      DOM.prepaymentCallout.style.display = "none";
      DOM.prepaymentSavingsBadge.textContent = "Saves ₹0";
    }

    // Donut Chart
    emiCalculator.renderChart("emiDonutChart", result.principal, result.totalInterest);

    // Amortization Table
    renderAmortizationTable(result.schedule.yearly);
  }

  function renderAmortizationTable(yearlyData) {
    DOM.amortizationTableBody.innerHTML = "";
    yearlyData.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong style="color: var(--accent-cyan);">Year ${row.year}</strong></td>
        <td>₹${row.openingBalance.toLocaleString('en-IN')}</td>
        <td style="color: #38BDF8;">₹${row.principalPaid.toLocaleString('en-IN')}</td>
        <td style="color: #FB7185;">₹${row.interestPaid.toLocaleString('en-IN')}</td>
        <td>₹${row.totalPaid.toLocaleString('en-IN')}</td>
        <td>₹${row.closingBalance.toLocaleString('en-IN')}</td>
      `;
      DOM.amortizationTableBody.appendChild(tr);
    });
  }

  // Export Amortization Schedule to CSV
  DOM.btnExportAmortizationCsv.addEventListener("click", () => {
    if (!currentEmiAnalysis) return;
    const schedule = currentEmiAnalysis.schedule.yearly;
    const headers = ["Year", "Opening Balance", "Principal Paid", "Interest Paid", "Total Annual Paid", "Closing Balance"];
    const rows = schedule.map(r => [r.year, r.openingBalance, r.principalPaid, r.interestPaid, r.totalPaid, r.closingBalance]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Amortization_Schedule_${Date.now()}.csv`;
    link.click();
    showToast("Amortization Schedule CSV downloaded!", "success");
  });

  // Transfer Loan Evaluation values to EMI tab
  DOM.btnSendToEmiCalc.addEventListener("click", () => {
    if (!currentEvaluation) runLoanEvaluation();
    DOM.emiLoanAmount.value = currentEvaluation.requestedAmount;
    DOM.emiLoanAmountSlider.value = currentEvaluation.requestedAmount;
    DOM.emiLoanAmountDisplay.textContent = `₹${currentEvaluation.requestedAmount.toLocaleString('en-IN')}`;

    DOM.emiInterestRate.value = currentEvaluation.effectiveInterestRate;
    DOM.emiInterestRateSlider.value = currentEvaluation.effectiveInterestRate;
    DOM.emiInterestRateDisplay.textContent = `${currentEvaluation.effectiveInterestRate}% p.a.`;

    DOM.emiTenureYears.value = currentEvaluation.tenureYears;
    DOM.emiTenureYearsSlider.value = currentEvaluation.tenureYears;
    DOM.emiTenureYearsDisplay.textContent = `${currentEvaluation.tenureYears} Years (${currentEvaluation.tenureYears * 12} Mos)`;

    switchTab("tab-emi-calculator");
    updateEmiCalculations();
    showToast("Evaluation parameters synced to EMI Calculator.", "info");
  });

  /* =========================================================================
     6. CLAUDE AI UNDERWRITING & CHAT ADVISOR
     ========================================================================= */
  async function triggerClaudeAssessment() {
    if (!currentEvaluation) {
      runLoanEvaluation();
    }

    DOM.aiAssessmentContainer.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--accent-cyan); margin-bottom: 0.75rem;"></i>
        <p style="font-weight: 600;">Generating Underwriter Analysis via ${claudeService.hasApiKey() ? 'Claude 3.5 Sonnet' : 'CrediPulse BFSI Engine'}...</p>
        <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.35rem;">Analyzing Debt-to-Income, amortization sustainability, and multi-bureau risk...</p>
      </div>
    `;

    try {
      const response = await claudeService.generateAssessment(currentEvaluation);
      DOM.aiAssessmentModelBadge.textContent = response.model;
      DOM.aiAssessmentContainer.innerHTML = formatMarkdownToHtml(response.content);
      
      // Store in evaluation object
      currentEvaluation.aiInsights = response.content;

      if (response.notice) {
        const noticeDiv = document.createElement("div");
        noticeDiv.style.cssText = "margin-top: 1rem; padding: 0.6rem 0.85rem; border-radius: 8px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); font-size: 0.75rem; color: #38BDF8;";
        noticeDiv.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${response.notice}`;
        DOM.aiAssessmentContainer.appendChild(noticeDiv);
      }

      showToast("AI Assessment generated successfully!", "success");
    } catch (err) {
      DOM.aiAssessmentContainer.innerHTML = `<div style="color: #F87171;">Failed to generate assessment: ${err.message}</div>`;
      showToast("Error generating AI assessment.", "danger");
    }
  }

  DOM.btnAskClaudeDeepDive.addEventListener("click", () => {
    switchTab("tab-claude-advisor");
    triggerClaudeAssessment();
  });

  DOM.btnRefreshAiAssessment.addEventListener("click", triggerClaudeAssessment);

  DOM.btnCopyAiAssessment.addEventListener("click", () => {
    const text = DOM.aiAssessmentContainer.innerText;
    navigator.clipboard.writeText(text);
    showToast("AI insights copied to clipboard!", "success");
  });

  // Financial Chatbot
  async function handleChatSubmit(e) {
    if (e) e.preventDefault();
    const message = DOM.chatInputField.value.trim();
    if (!message) return;

    // Append User message
    appendChatBubble("user", message);
    DOM.chatInputField.value = "";

    // Append Thinking bubble
    const thinkingBubble = appendChatBubble("ai", '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing with BFSI reasoning engine...');

    try {
      const context = {
        evaluation: currentEvaluation,
        creditAnalysis: currentCreditAnalysis,
        emi: currentEmiAnalysis
      };
      const response = await claudeService.askFinancialAdvisor(message, context);
      thinkingBubble.innerHTML = `<strong>${response.source}:</strong><br>` + formatMarkdownToHtml(response.answer);
      DOM.chatMessagesStream.scrollTop = DOM.chatMessagesStream.scrollHeight;
    } catch (err) {
      thinkingBubble.innerHTML = `<span style="color: #F87171;">Error: ${err.message}</span>`;
    }
  }

  function appendChatBubble(role, html) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = html;
    DOM.chatMessagesStream.appendChild(bubble);
    DOM.chatMessagesStream.scrollTop = DOM.chatMessagesStream.scrollHeight;
    return bubble;
  }

  DOM.chatInputForm.addEventListener("submit", handleChatSubmit);

  DOM.promptChips.forEach(chip => {
    chip.addEventListener("click", () => {
      DOM.chatInputField.value = chip.getAttribute("data-prompt");
      handleChatSubmit();
    });
  });

  /* =========================================================================
     7. GOOGLE SHEETS & PERSISTENCE
     ========================================================================= */
  async function saveAndSyncRecord() {
    if (!currentEvaluation) {
      runLoanEvaluation();
    }

    showToast("Saving assessment record...", "info");

    const record = await sheetsService.saveRecord(currentEvaluation);
    renderRecordsTable();

    if (sheetsService.hasWebhook()) {
      showToast("Record successfully synchronized to Google Sheet!", "success");
    } else {
      showToast("Saved locally. Link Google Sheets in Settings for remote sync!", "info");
    }
  }

  DOM.btnSyncCurrentToSheets.addEventListener("click", saveAndSyncRecord);

  DOM.btnManualSyncSheets.addEventListener("click", async () => {
    if (!sheetsService.hasWebhook()) {
      showToast("Please configure your Google Sheets Webhook URL first.", "warning");
      openSettingsModal();
      return;
    }

    const records = sheetsService.getAllRecords();
    if (records.length === 0) {
      showToast("No records available to sync.", "info");
      return;
    }

    showToast(`Syncing ${records.length} records to Google Sheets...`, "info");
    let successCount = 0;
    for (const r of records) {
      try {
        await sheetsService.syncToGoogleSheets(r);
        r.syncStatus = "Synced to Google Sheets";
        successCount++;
      } catch (e) {
        console.error("Sync error:", e);
      }
    }
    sheetsService.saveAllRecords(records);
    renderRecordsTable();
    showToast(`Synchronized ${successCount} records to Google Sheet!`, "success");
  });

  DOM.btnExportRecordsCsv.addEventListener("click", () => {
    try {
      sheetsService.exportToCsv();
      showToast("Records CSV downloaded successfully!", "success");
    } catch (e) {
      showToast(e.message, "warning");
    }
  });

  DOM.btnExportRecordsJson.addEventListener("click", () => {
    try {
      sheetsService.exportToJson();
      showToast("Records JSON downloaded successfully!", "success");
    } catch (e) {
      showToast(e.message, "warning");
    }
  });

  DOM.btnClearAllRecords.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all local financial records?")) {
      sheetsService.clearAllRecords();
      renderRecordsTable();
      showToast("All historical records cleared.", "info");
    }
  });

  function renderRecordsTable() {
    const records = sheetsService.getAllRecords();
    const query = (DOM.recordsSearchInput.value || "").toLowerCase();
    const filtered = records.filter(r => {
      const matchName = (r.fullName || "").toLowerCase().includes(query);
      const matchType = (r.loanType || "").toLowerCase().includes(query);
      const matchStatus = (r.status || "").toLowerCase().includes(query);
      const matchId = (r.recordId || "").toLowerCase().includes(query);
      return matchName || matchType || matchStatus || matchId;
    });

    DOM.recordsCountDisplay.textContent = `Showing ${filtered.length} of ${records.length} records`;

    if (filtered.length === 0) {
      DOM.recordsTableBody.innerHTML = `
        <tr>
          <td colspan="12" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No records found. Click "Save to Google Sheets" on any loan evaluation to record it here!
          </td>
        </tr>
      `;
      return;
    }

    DOM.recordsTableBody.innerHTML = "";
    filtered.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><code style="color: var(--accent-cyan); font-size: 0.75rem;">${r.recordId}</code></td>
        <td style="font-size: 0.75rem;">${r.formattedDate || '-'}</td>
        <td><strong>${r.fullName || 'Applicant'}</strong></td>
        <td>₹${Number(r.monthlyIncome || 0).toLocaleString('en-IN')}</td>
        <td><span class="badge ${r.creditScore >= 750 ? 'badge-success' : 'badge-warning'}">${r.creditScore || '-'}</span></td>
        <td>₹${Number(r.requestedAmount || 0).toLocaleString('en-IN')}</td>
        <td>${r.loanType || 'Loan'}</td>
        <td><span class="badge ${r.status === 'APPROVED' ? 'badge-success' : r.status?.includes('CONDITION') ? 'badge-warning' : 'badge-danger'}">${r.status || 'Evaluated'}</span></td>
        <td style="color: #34D399;">₹${Number(r.maxEligibleAmount || 0).toLocaleString('en-IN')}</td>
        <td>${r.projectedFoirPercent || '-'}%</td>
        <td><span class="badge ${r.syncStatus?.includes('Synced') ? 'badge-success' : 'badge-primary'}">${r.syncStatus || 'Local'}</span></td>
        <td>
          <button class="btn btn-glass btn-sm btn-view-rec" data-id="${r.recordId}" style="padding: 0.2rem 0.5rem;" title="View Details">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="btn btn-glass btn-sm btn-del-rec" data-id="${r.recordId}" style="padding: 0.2rem 0.5rem; color: var(--accent-rose);" title="Delete Record">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      DOM.recordsTableBody.appendChild(tr);
    });

    // Attach row events
    document.querySelectorAll(".btn-view-rec").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const rec = records.find(x => x.recordId === id);
        if (rec) {
          currentEvaluation = rec;
          renderLoanResult(rec);
          switchTab("tab-loan-checker");
          showToast(`Viewing details for ${rec.fullName}`, "info");
        }
      });
    });

    document.querySelectorAll(".btn-del-rec").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        sheetsService.deleteRecord(id);
        renderRecordsTable();
        showToast("Record deleted.", "info");
      });
    });
  }

  DOM.recordsSearchInput.addEventListener("input", renderRecordsTable);

  /* =========================================================================
     8. SETTINGS MODAL & API CONFIG
     ========================================================================= */
  function openSettingsModal() {
    DOM.settingsClaudeKey.value = claudeService.apiKey;
    DOM.settingsClaudeModel.value = claudeService.model;
    DOM.settingsSheetsUrl.value = sheetsService.getWebhookUrl();
    DOM.settingsModal.classList.add("active");
  }

  function closeSettingsModal() {
    DOM.settingsModal.classList.remove("active");
  }

  DOM.btnOpenSettings.addEventListener("click", openSettingsModal);
  DOM.btnConfigureWebhookDirect.addEventListener("click", openSettingsModal);
  DOM.btnCloseSettingsModal.addEventListener("click", closeSettingsModal);
  DOM.btnCancelSettings.addEventListener("click", closeSettingsModal);

  DOM.btnSaveSettings.addEventListener("click", () => {
    claudeService.setApiKey(DOM.settingsClaudeKey.value);
    claudeService.setModel(DOM.settingsClaudeModel.value);
    sheetsService.setWebhookUrl(DOM.settingsSheetsUrl.value);

    updateIntegrationBadges();
    closeSettingsModal();
    showToast("Settings and credentials successfully saved!", "success");
  });

  DOM.btnTestSheetsConnection.addEventListener("click", async () => {
    const url = DOM.settingsSheetsUrl.value.trim();
    if (!url) {
      showToast("Please enter a Google Apps Script Web App URL first.", "warning");
      return;
    }

    showToast("Testing webhook communication...", "info");
    try {
      await sheetsService.syncToGoogleSheets({
        recordId: "TEST-" + Date.now().toString().slice(-4),
        fullName: "Test Ping",
        monthlyIncome: 100000,
        requestedAmount: 500000,
        status: "APPROVED",
        riskLevel: "Low Risk",
        aiInsights: "System health check test payload."
      });
      showToast("Google Sheets Webhook test payload sent successfully!", "success");
    } catch (e) {
      showToast("Could not send test record: " + e.message, "danger");
    }
  });

  function updateIntegrationBadges() {
    if (claudeService.hasApiKey()) {
      DOM.heroAiStatus.textContent = "Claude 3.5";
      DOM.heroAiMode.innerHTML = `<i class="fa-solid fa-cloud-bolt text-cyan"></i> Live API Active`;
      DOM.apiKeyStatusLabel.textContent = "Live Key Connected";
      DOM.apiKeyStatusLabel.style.color = "var(--accent-emerald)";
    } else {
      DOM.heroAiStatus.textContent = "BFSI Engine";
      DOM.heroAiMode.innerHTML = `<i class="fa-solid fa-microchip"></i> Zero-Latency Local`;
      DOM.apiKeyStatusLabel.textContent = "Built-in BFSI Engine";
      DOM.apiKeyStatusLabel.style.color = "var(--accent-cyan)";
    }

    if (sheetsService.hasWebhook()) {
      DOM.heroSheetStatus.textContent = "Connected";
      DOM.heroSheetBadge.innerHTML = `<i class="fa-solid fa-check-circle" style="color: #34D399;"></i> Sheets Synced`;
      DOM.recordsSyncHeaderStatus.textContent = "Google Sheets Webhook Connected";
      DOM.recordsSyncHeaderSubtext.textContent = "Every evaluation automatically triggers remote Google Sheets persistence.";
    } else {
      DOM.heroSheetStatus.textContent = "Local Mode";
      DOM.heroSheetBadge.innerHTML = `<i class="fa-solid fa-hard-drive"></i> Local Cache`;
      DOM.recordsSyncHeaderStatus.textContent = "Local Session Mode (No Webhook Set)";
      DOM.recordsSyncHeaderSubtext.textContent = "Data is saved locally in browser storage. Click 'Configure Sheet Webhook' to enable Google Sheets sync.";
    }
  }

  /* =========================================================================
     9. PRINTABLE PDF ASSESSMENT REPORT MODAL
     ========================================================================= */
  function openReportModal() {
    if (!currentEvaluation) {
      runLoanEvaluation();
    }

    const r = currentEvaluation;
    document.getElementById("reportDateVal").textContent = new Date().toLocaleDateString();
    document.getElementById("reportRefIdVal").textContent = r.recordId || "CP-BFSI-" + Date.now().toString().slice(-6);

    document.getElementById("repName").textContent = r.fullName;
    document.getElementById("repAge").textContent = `${DOM.applicantAge.value} Years`;
    document.getElementById("repEmployment").textContent = DOM.employmentType.options[DOM.employmentType.selectedIndex].text;
    document.getElementById("repIncome").textContent = `₹${Number(DOM.monthlyIncome.value).toLocaleString('en-IN')}`;
    document.getElementById("repExistingEmi").textContent = `₹${Number(DOM.existingEmi.value).toLocaleString('en-IN')}`;

    const repStatus = document.getElementById("repStatus");
    repStatus.textContent = r.status;
    repStatus.style.color = r.status === "APPROVED" ? "#16a34a" : r.status.includes("CONDITION") ? "#d97706" : "#dc2626";

    document.getElementById("repProbability").textContent = `${r.approvalProbability}%`;
    document.getElementById("repMaxLoan").textContent = `₹${r.maxEligibleAmount.toLocaleString('en-IN')}`;
    document.getElementById("repFoir").textContent = `${r.projectedFoirPercent}% (Ceiling ${r.maxAllowedFoirPercent}%)`;
    document.getElementById("repCreditTier").textContent = `${r.creditScore} (${r.creditTier.label})`;

    document.getElementById("repRequestedAmt").textContent = `₹${r.requestedAmount.toLocaleString('en-IN')}`;
    document.getElementById("repTenure").textContent = `${r.tenureYears} Years (${r.tenureYears * 12} Mos)`;
    document.getElementById("repInterestRate").textContent = `${r.effectiveInterestRate}% p.a.`;
    document.getElementById("repMonthlyEmi").textContent = `₹${r.requestedMonthlyEmi.toLocaleString('en-IN')}`;

    const aiInsightsElem = document.getElementById("repAiInsights");
    if (r.aiInsights) {
      aiInsightsElem.innerHTML = formatMarkdownToHtml(r.aiInsights);
    } else {
      aiInsightsElem.innerHTML = `<p>Applicant qualifies for institutional credit under Tier-1 lending framework. Primary FOIR commitment is sustainable across economic volatility stress tests.</p>`;
    }

    DOM.reportModal.classList.add("active");
  }

  DOM.btnExportQuickReport.addEventListener("click", openReportModal);
  DOM.btnCloseReportModal.addEventListener("click", () => DOM.reportModal.classList.remove("active"));

  DOM.btnPrintReportDirect.addEventListener("click", () => {
    window.print();
  });

  DOM.btnDownloadReportPdf.addEventListener("click", () => {
    if (typeof html2pdf === "undefined") {
      window.print();
      return;
    }
    const element = DOM.printableReportContent;
    const opt = {
      margin: 10,
      filename: `CrediPulse_Report_${currentEvaluation.fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    showToast("Generating high-resolution PDF download...", "info");
  });

  /* =========================================================================
     10. UTILITIES & HELPERS
     ========================================================================= */
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "fa-circle-info";
    if (type === "success") icon = "fa-circle-check";
    if (type === "warning") icon = "fa-triangle-exclamation";
    if (type === "danger") icon = "fa-circle-exclamation";

    toast.innerHTML = `
      <i class="fa-solid ${icon}" style="font-size: 1.1rem; color: ${type === 'success' ? '#34D399' : type === 'danger' ? '#F87171' : type === 'warning' ? '#FBBF24' : '#38BDF8'};"></i>
      <div style="flex: 1;">${message}</div>
    `;

    DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function formatMarkdownToHtml(md) {
    if (!md) return "";
    let html = md
      .replace(/^### (.*$)/gim, '<h4 style="color: var(--accent-cyan); margin: 0.75rem 0 0.25rem;">$1</h4>')
      .replace(/^#### (.*$)/gim, '<h5 style="color: var(--text-main); margin: 0.5rem 0 0.25rem;">$1</h5>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong style="color: var(--text-main);">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/---/gim, '<hr style="border: none; border-top: 1px solid var(--border-glass); margin: 0.75rem 0;">')
      .replace(/^\* (.*$)/gim, '<li style="margin-left: 1.25rem; margin-bottom: 0.25rem;">$1</li>')
      .replace(/^[0-9]\. (.*$)/gim, '<li style="margin-left: 1.25rem; margin-bottom: 0.25rem;">$1</li>')
      .replace(/\n\n/gim, '<br>');
    return html;
  }

  /* =========================================================================
     INITIAL RUNTIME INITIALIZATION
     ========================================================================= */
  updateIntegrationBadges();
  runLoanEvaluation();
  runCreditAnalysis();
  updateEmiCalculations();
  renderRecordsTable();

  // Populate initial quick AI assessment card
  triggerClaudeAssessment();
});
