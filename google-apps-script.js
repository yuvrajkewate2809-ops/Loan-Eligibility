// Google Apps Script code for Google Sheets integration
// Follow these instructions to link your Google Sheet:
// 1. Open Google Sheets (https://sheets.new) and create a new sheet named "BFSI_Loan_Records"
// 2. Set the first row headers:
//    Timestamp | Record ID | Full Name | Age | Employment | Monthly Income | Existing EMIs | Credit Score | Loan Requested | Loan Type | Eligibility Status | Max Eligible Amount | Suggested EMI | Risk Level | AI Insights
// 3. Go to Extensions > Apps Script
// 4. Paste this entire code into the script editor
// 5. Click "Deploy" > "New deployment"
// 6. Select type: "Web app"
// 7. Execute as: "Me"
// 8. Who has access: "Anyone" (allows the frontend to submit data securely)
// 9. Click "Deploy", authorize permissions, and copy the Web App URL!
// 10. Paste the Web App URL into the Settings modal in the AI Loan Eligibility Checker platform.

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check if headers exist, if not create them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Record ID",
        "Full Name",
        "Age",
        "Employment Type",
        "Monthly Income (₹/$)",
        "Existing Monthly EMIs",
        "Credit Score",
        "Requested Loan Amount",
        "Loan Type",
        "Tenure (Years)",
        "Eligibility Status",
        "Max Eligible Amount",
        "Estimated Monthly EMI",
        "FOIR / DTI Ratio (%)",
        "Risk Level",
        "AI Assessment Summary"
      ]);
      // Format header row
      var headerRange = sheet.getRange(1, 1, 1, 17);
      headerRange.setBackground("#0F172A");
      headerRange.setFontColor("#38BDF8");
      headerRange.setFontWeight("bold");
    }
    
    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    var newRow = [
      new Date().toLocaleString(),
      data.recordId || "REC-" + Date.now().toString().slice(-6),
      data.fullName || "Anonymous",
      data.age || "-",
      data.employmentType || "-",
      data.monthlyIncome || 0,
      data.existingEmi || 0,
      data.creditScore || "-",
      data.loanAmount || 0,
      data.loanType || "Personal Loan",
      data.tenureYears || "-",
      data.eligibilityStatus || "Evaluated",
      data.maxEligibleAmount || 0,
      data.monthlyEmi || 0,
      data.foirRatio || "-",
      data.riskLevel || "Low",
      data.aiInsights || "-"
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        "status": "success", 
        "message": "Record successfully added to Google Sheets",
        "row": sheet.getLastRow()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        "status": "error", 
        "message": error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ "status": "success", "records": [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data[0];
    var records = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var record = {};
      for (var j = 0; j < headers.length; j++) {
        record[headers[j]] = row[j];
      }
      records.push(record);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ "status": "success", "records": records }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
