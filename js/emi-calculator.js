/**
 * EMI Calculator Module
 * Real-time calculation, interactive breakdown, amortization schedule, and prepayment savings.
 */

class EmiCalculator {
  constructor() {
    this.chartInstance = null;
  }

  /**
   * Calculate EMI & Loan Breakdown
   * @param {number} principal 
   * @param {number} annualRate 
   * @param {number} tenureYears 
   * @param {number} prepaymentAmount (optional extra prepayment)
   */
  calculate(principal, annualRate, tenureYears, extraMonthlyPayment = 0) {
    const P = Math.max(1000, Number(principal));
    const r = (Number(annualRate) / 100) / 12;
    const n = Math.max(1, Math.round(Number(tenureYears) * 12));
    const extra = Math.max(0, Number(extraMonthlyPayment));

    let emi = 0;
    if (r === 0) {
      emi = P / n;
    } else {
      const factor = Math.pow(1 + r, n);
      emi = (P * r * factor) / (factor - 1);
    }

    const totalPayment = emi * n;
    const totalInterest = Math.max(0, totalPayment - P);
    const interestRatioPct = totalPayment > 0 ? Math.round((totalInterest / totalPayment) * 100) : 0;
    const principalRatioPct = 100 - interestRatioPct;

    // Build Amortization Schedule (Yearly summary & Monthly records)
    const schedule = this.generateAmortizationSchedule(P, r, n, emi, extra);

    return {
      principal: P,
      annualRate,
      tenureYears,
      totalMonths: n,
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      interestRatioPct,
      principalRatioPct,
      schedule,
      prepaymentSavings: schedule.prepaymentSavings
    };
  }

  /**
   * Generates month-by-month and year-by-year amortization breakdown
   */
  generateAmortizationSchedule(P, monthlyRate, totalMonths, standardEmi, extraPayment = 0) {
    let balance = P;
    const monthlyData = [];
    const yearlyData = [];

    let currentYear = 1;
    let yearPrincipal = 0;
    let yearInterest = 0;
    let yearOpening = balance;

    let totalPaidWithExtra = 0;
    let totalInterestWithExtra = 0;
    let actualMonthsTaken = 0;

    for (let month = 1; month <= totalMonths; month++) {
      if (balance <= 0) break;

      actualMonthsTaken++;
      const interestComponent = balance * monthlyRate;
      let effectiveEmi = standardEmi + extraPayment;
      
      if (balance + interestComponent < effectiveEmi) {
        effectiveEmi = balance + interestComponent;
      }

      const principalComponent = effectiveEmi - interestComponent;
      const closingBalance = Math.max(0, balance - principalComponent);

      monthlyData.push({
        month,
        openingBalance: Math.round(balance),
        emi: Math.round(effectiveEmi),
        principalPaid: Math.round(principalComponent),
        interestPaid: Math.round(interestComponent),
        closingBalance: Math.round(closingBalance)
      });

      yearPrincipal += principalComponent;
      yearInterest += interestComponent;
      totalPaidWithExtra += effectiveEmi;
      totalInterestWithExtra += interestComponent;

      balance = closingBalance;

      // Group into years
      if (month % 12 === 0 || balance <= 0 || month === totalMonths) {
        yearlyData.push({
          year: currentYear,
          openingBalance: Math.round(yearOpening),
          principalPaid: Math.round(yearPrincipal),
          interestPaid: Math.round(yearInterest),
          totalPaid: Math.round(yearPrincipal + yearInterest),
          closingBalance: Math.round(balance)
        });

        currentYear++;
        yearOpening = balance;
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }

    // Prepayment savings calculation if extra was applied
    const normalTotalInterest = (standardEmi * totalMonths) - P;
    const interestSaved = Math.max(0, normalTotalInterest - totalInterestWithExtra);
    const monthsSaved = Math.max(0, totalMonths - actualMonthsTaken);

    return {
      monthly: monthlyData,
      yearly: yearlyData,
      actualMonthsTaken,
      prepaymentSavings: {
        hasPrepayment: extraPayment > 0,
        monthsSaved,
        interestSaved: Math.round(interestSaved),
        tenureReducedYears: (monthsSaved / 12).toFixed(1)
      }
    };
  }

  /**
   * Render or update dark glassmorphism Chart.js Donut chart
   */
  renderChart(canvasId, principal, totalInterest) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Principal Amount", "Total Interest"],
        datasets: [{
          data: [principal, totalInterest],
          backgroundColor: [
            "rgba(14, 165, 233, 0.85)", // Cyan/Electric Blue
            "rgba(244, 63, 94, 0.85)"   // Rose/Pink Accent
          ],
          borderColor: [
            "rgba(56, 189, 248, 1)",
            "rgba(251, 113, 133, 1)"
          ],
          borderWidth: 2,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#94A3B8",
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 12
              },
              padding: 16,
              usePointStyle: true,
              pointStyle: "circle"
            }
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            borderColor: "rgba(56, 189, 248, 0.3)",
            borderWidth: 1,
            titleColor: "#F8FAFC",
            bodyColor: "#CBD5E1",
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return ` ${context.label}: ₹${value.toLocaleString('en-IN')} (${pct}%)`;
              }
            }
          }
        },
        cutout: "70%",
        animation: {
          animateRotate: true,
          duration: 900
        }
      }
    });
  }
}

window.EmiCalculator = EmiCalculator;
