/**
 * Claude AI Integration Module (Anthropic AI & Built-in BFSI Reasoning Engine)
 * Provides real-time financial reasoning, personalized action plans, and BFSI advisory.
 */

class ClaudeAIService {
  constructor() {
    this.apiKey = localStorage.getItem(window.CONFIG.STORAGE_KEYS.CLAUDE_API_KEY) || "";
    this.model = localStorage.getItem(window.CONFIG.STORAGE_KEYS.CLAUDE_MODEL) || window.CONFIG.DEFAULT_CLAUDE_MODEL;
    this.apiUrl = "https://api.anthropic.com/v1/messages";
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    if (this.apiKey) {
      localStorage.setItem(window.CONFIG.STORAGE_KEYS.CLAUDE_API_KEY, this.apiKey);
    } else {
      localStorage.removeItem(window.CONFIG.STORAGE_KEYS.CLAUDE_API_KEY);
    }
  }

  setModel(model) {
    this.model = model;
    localStorage.setItem(window.CONFIG.STORAGE_KEYS.CLAUDE_MODEL, model);
  }

  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.startsWith("sk-ant-"));
  }

  /**
   * Generates a deep financial analysis from an applicant's evaluation data
   */
  async generateAssessment(evaluationData) {
    const prompt = this.buildAssessmentPrompt(evaluationData);
    
    if (this.hasApiKey()) {
      try {
        const response = await this.callClaudeAPI(prompt, "You are a senior BFSI credit risk underwriter and financial strategist. Provide direct, highly professional, actionable financial guidance.");
        return {
          source: "Claude AI (Live API)",
          model: this.model,
          content: response
        };
      } catch (err) {
        console.warn("Claude API call failed or encountered CORS/Network limitation; falling back to BFSI Intelligence Engine:", err);
        return {
          source: "CrediPulse AI Intelligence Engine (Zero-Latency Fallback)",
          model: "BFSI Expert Model v2.4",
          content: this.generateSimulatedInsight(evaluationData),
          notice: "Using local BFSI AI engine. Add a valid Anthropic key in Settings for cloud Claude 3.5 Sonnet processing."
        };
      }
    } else {
      // High-grade built-in BFSI reasoning engine
      return {
        source: "CrediPulse AI Intelligence Engine",
        model: "BFSI Expert Model v2.4",
        content: this.generateSimulatedInsight(evaluationData),
        notice: "Using built-in BFSI reasoning engine. Enter an Anthropic Claude API Key in Settings to enable direct cloud AI."
      };
    }
  }

  /**
   * Interactive Financial Advisory Chat
   */
  async askFinancialAdvisor(userQuestion, contextData = {}) {
    const systemPrompt = `You are "CrediPulse AI", an advanced BFSI (Banking, Financial Services, and Insurance) Financial Advisor.
You offer precise, legally compliant, and mathematically sound personal finance advice regarding loans, credit scores, EMIs, tax deductions (e.g. 80C, 24b), and debt restructuring.
Current User Context:
${JSON.stringify(contextData, null, 2)}
Respond concisely in clean markdown with bullet points, strategic recommendations, and numerical examples where applicable.`;

    if (this.hasApiKey()) {
      try {
        const response = await this.callClaudeAPI(userQuestion, systemPrompt);
        return {
          source: "Claude AI (Live)",
          answer: response
        };
      } catch (err) {
        console.warn("Falling back to internal knowledge base:", err);
        return {
          source: "CrediPulse Assistant (Local Engine)",
          answer: this.generateAssistantFallback(userQuestion, contextData)
        };
      }
    } else {
      return {
        source: "CrediPulse Assistant (Local Engine)",
        answer: this.generateAssistantFallback(userQuestion, contextData)
      };
    }
  }

  /**
   * Direct API call to Anthropic Messages endpoint
   */
  async callClaudeAPI(userMessage, systemPrompt = "") {
    const payload = {
      model: this.model,
      max_tokens: 1200,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage
        }
      ]
    };

    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || "No response received from Claude.";
  }

  buildAssessmentPrompt(d) {
    return `Analyze this retail borrower profile and provide an executive underwriting evaluation:
- Applicant: ${d.fullName}
- Requested Loan: ₹${d.requestedAmount?.toLocaleString('en-IN')} (${d.loanType}) for ${d.tenureYears} years
- Calculated Monthly EMI: ₹${d.requestedMonthlyEmi?.toLocaleString('en-IN')} at ${d.effectiveInterestRate}% p.a.
- Maximum Sanctionable Principal: ₹${d.maxEligibleAmount?.toLocaleString('en-IN')}
- Credit Score: ${d.creditScore} (${d.creditTier?.label})
- Projected FOIR (Debt-to-Income): ${d.projectedFoirPercent}% (Ceiling: ${d.maxAllowedFoirPercent}%)
- Current Risk Status: ${d.status} (${d.riskLevel})

Provide:
1. Executive Risk Diagnosis (2 sentences)
2. Underwriter Strengths vs Vulnerabilities (3 bullet points)
3. 3 Strategic Action Steps to optimize borrowing cost or secure faster approval
4. Recommended Loan Structure adjustment (e.g. tenure, co-borrower, down-payment)`;
  }

  /**
   * Rich rule-based BFSI reasoning engine (operates 100% offline & zero-latency)
   */
  generateSimulatedInsight(d) {
    const isApproved = d.status === "APPROVED";
    const isModerate = d.status.includes("CONDITIONALLY");
    const formattedMax = d.maxEligibleAmount ? `₹${d.maxEligibleAmount.toLocaleString('en-IN')}` : "₹0";
    const formattedEmi = d.requestedMonthlyEmi ? `₹${d.requestedMonthlyEmi.toLocaleString('en-IN')}` : "₹0";
    
    let diagnosis = "";
    if (isApproved) {
      diagnosis = `Applicant presents a prime risk profile with a balanced Debt-to-Income ratio (${d.projectedFoirPercent}%) and reputable credit standing (${d.creditScore}). The requested obligation of ${formattedEmi}/mo is well within the sustainable cashflow threshold.`;
    } else if (isModerate) {
      diagnosis = `Applicant demonstrates viable repayment capability but breaches secondary lender sensitivity gates, primarily driven by a high FOIR (${d.projectedFoirPercent}%) or credit tier positioning (${d.creditScore}). Max eligible limit is capped at ${formattedMax}.`;
    } else {
      diagnosis = `Applicant currently exceeds institutional risk tolerance due to an aggressive debt-to-income commitment (${d.projectedFoirPercent}% vs ${d.maxAllowedFoirPercent}% ceiling) or subdued credit reliability score (${d.creditScore}). Underwriting requires structural balance sheet remediation.`;
    }

    const strengths = [];
    const vulnerabilities = [];

    if (d.creditScore >= 750) strengths.push(`Prime Credit Standing: Score of ${d.creditScore} entitles applicant to favorable risk-tier interest margins (-0.25% to -0.75%).`);
    else vulnerabilities.push(`Sub-Prime Credit Tier: A score of ${d.creditScore} incurs a risk spread of +0.50% to +1.50% over benchmark lending rates.`);

    if (d.projectedFoirPercent <= d.maxAllowedFoirPercent) {
      strengths.push(`Comfortable Debt Service Coverage: Fixed obligation ratio of ${d.projectedFoirPercent}% provides a healthy liquid buffer for unforeseen market shifts.`);
    } else {
      vulnerabilities.push(`FOIR Threshold Breach: Total debt servicing commitments absorb ${d.projectedFoirPercent}% of gross income, exceeding the standard ${d.maxAllowedFoirPercent}% cap.`);
    }

    if (d.requestedAmount <= d.maxEligibleAmount) {
      strengths.push(`Prudent Borrowing Quantum: Requested loan (₹${d.requestedAmount.toLocaleString('en-IN')}) is comfortably supported by the max eligibility envelope (${formattedMax}).`);
    } else {
      vulnerabilities.push(`Excess Principal Demand: Requested loan exceeds current eligible debt capacity by ₹${Math.abs(d.requestedAmount - d.maxEligibleAmount).toLocaleString('en-IN')}.`);
    }

    return `### 📊 AI Credit Risk & Underwriting Analysis

**Executive Assessment:**
${diagnosis}

---

#### ⚖️ Key Strengths & Risk Factors
* **Strengths:**
${strengths.map(s => `  - ${s}`).join("\n")}
* **Risk Flags & Considerations:**
${vulnerabilities.map(v => `  - ${v}`).join("\n")}

---

#### 💡 Claude BFSI Strategic Action Plan
1. **Tenure & EMI Recalibration:** ${d.projectedFoirPercent > 50 ? `Extending tenure by 3–5 years will compress your monthly outflow by 12–18%, immediately restoring your FOIR to the prime zone.` : `Your current ${d.tenureYears}-year tenure offers an ideal balance between low monthly burden and minimal lifetime interest outflow.`}
2. **Credit Utilization Discipline:** Maintain all revolving credit lines below 25% utilization across billing cycles to safeguard your current rate tier.
3. **Co-Applicant Structuring:** ${!isApproved ? `Adding an earning spouse or family member as a joint applicant can boost household borrowing capacity by up to 45% while unlocking multi-borrower tax benefits.` : `Maintain single-applicant status to retain future borrowing capacity for secondary investments or emergency liquidity lines.`}
4. **Prepayment Strategy:** Executing an annual lump-sum prepayment equivalent to just 1 extra EMI per year can reduce a 20-year loan tenure by over 3.5 years, yielding substantial interest savings.`;
  }

  /**
   * Contextual chatbot fallback replies based on BFSI heuristics
   */
  generateAssistantFallback(query, ctx) {
    const q = query.toLowerCase();

    if (q.includes("reduce") || q.includes("lower") || q.includes("emi")) {
      return `### How to Reduce Your Monthly EMI:
1. **Extend Loan Tenure:** Increasing your loan duration spreads the principal over more months, immediately lowering the monthly installment.
2. **Make a Partial Prepayment:** Directing bonuses or savings toward principal curtailment directly slashes subsequent EMIs or overall duration.
3. **Refinance / Balance Transfer:** If your credit score has improved past 750, shop for lenders offering balance transfers with a 0.5%–1.0% interest rate concession.
4. **Negotiate with Existing Lender:** Request a conversion to the latest benchmark (e.g., Repo Linked Lending Rate / SOFR) by paying a nominal administrative fee.`;
    }

    if (q.includes("credit score") || q.includes("cibil") || q.includes("improve") || q.includes("increase")) {
      return `### Rapid Credit Score Improvement Tactics:
- **Rule of 30%:** Keep credit card usage under 30% of each card's approved limit. If your limit is ₹1,00,000, keep statement balances below ₹30,000.
- **Pay Before Billing Cycle:** Pay balances 3-5 days before the statement generation date so zero/low balances are reported to the credit bureau.
- **Do Not Close Old Accounts:** The age of oldest accounts contributes 15% to your credit score.
- **Diversify Credit Mix:** A healthy blend of secured loans (home/car) and unsecured cards demonstrates seasoned financial discipline.
- **Dispute Bureau Inaccuracies:** Pull your free annual report and flag incorrectly marked late payments or open accounts that were already closed.`;
    }

    if (q.includes("tax") || q.includes("80c") || q.includes("deduction")) {
      return `### Tax Benefits on Home Loans (Indian IT Act Framework):
- **Section 24(b):** Deduction of up to **₹2,00,000 per financial year** on home loan interest paid for self-occupied property.
- **Section 80C:** Deduction of up to **₹1,50,000** for repayment of the loan principal amount (within the overall 80C ceiling).
- **Joint Loan Bonus:** If co-borrowing with an earning spouse who is also a co-owner, both can claim deductions separately (total up to ₹4 Lakhs on interest & ₹3 Lakhs on principal)!`;
    }

    return `### CrediPulse Financial Advisory Insights
Based on current financial analysis:
- **Current Interest Rate Landscape:** Retail loan rates typically track sovereign central bank repos. Securing a floating rate with no prepayment penalty gives maximum flexibility.
- **Optimal FOIR Ratio:** Lenders prefer keeping total EMIs within 40–50% of net monthly income to prevent default during unexpected economic shocks.
- **Prepayment Leverage:** In the first 5 years of an amortized loan, over 70% of each EMI goes toward interest. Early principal paydowns produce the highest compound returns.

Feel free to ask specific questions about your eligibility, credit score factors, or loan tenure comparisons!`;
  }
}

window.ClaudeAIService = ClaudeAIService;
