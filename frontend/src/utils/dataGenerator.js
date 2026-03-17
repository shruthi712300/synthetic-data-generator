// Utility functions for generating sample insurance data with PII masking and errors

const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jennifer', 'Robert', 'Lisa', 'James', 'Mary', 
  'William', 'Patricia', 'Richard', 'Linda', 'Thomas', 'Barbara', 'Charles', 'Elizabeth', 'Daniel', 'Susan'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 
  'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const companies = ['Acme Corp', 'TechVentures Inc', 'Global Industries', 'Innovative Solutions LLC', 
  'Premier Manufacturing', 'Advanced Systems Corp', 'Strategic Partners Group', 'Horizon Enterprises',
  'Apex Corporation', 'Summit Holdings', 'Visionary Tech', 'Elite Services Inc', 'Dynamic Solutions',
  'NextGen Industries', 'Pioneer Group', 'Quantum Dynamics', 'Stellar Corporation', 'Velocity Inc',
  'Zenith Enterprises', 'Omega Industries'];

const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco',
  'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Boston'];

const states = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA',
  'TN', 'IN', 'MD', 'WI', 'CO'];

const policyTypes = ['Property', 'Liability', 'D&O', 'Cyber', 'Workers Comp', 'Commercial Auto', 
  'Professional Liability', 'General Liability'];

const statuses = ['Active', 'Pending', 'Expired', 'Cancelled', 'Suspended'];
const claimStatuses = ['Reported', 'Under Review', 'Approved', 'Denied', 'Settled', 'Closed'];
const paymentMethods = ['ACH', 'Wire Transfer', 'Check', 'Credit Card'];

// ---------- PII Masking functions (masked values are clearly distinguishable) ----------
export const maskSSN = (index) => {
  const last4 = String(1000 + (index % 9000)).slice(-4);
  return `XXX-XX-${last4}`;
};

export const maskEmail = (firstName, lastName, index) => {
  const domain = ['synthmail.com', 'testdata.org', 'example-corp.com'][index % 3];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${domain}`;
};

export const maskPhone = (index) => {
  const area = 555;
  const exchange = 100 + (index % 900);
  const number = 1000 + (index % 9000);
  return `(${area}) ${exchange}-${number}`;
};

export const maskDOB = (index) => {
  return '1900-01-01'; // Clearly masked
};

export const maskTaxID = (index) => {
  const first = String(10 + (index % 90));
  const last = String(1000000 + (index % 9000000));
  return `${first}-${last}`;
};

export const maskBankAccount = (index) => {
  return String(1000 + (index % 9000)).slice(-4);
};

// ---------- GENERIC MASK for any column manually overridden ----------
const GENERIC_MASK = '***MASKED***';

// ---------- Mask dispatcher with fallback ----------
const maskByColumnName = (columnName, index, firstName = 'user', lastName = 'name') => {
  if (columnName.includes('ssn') || columnName.includes('tax_id')) {
    return maskSSN(index);
  }
  if (columnName.includes('email')) {
    return maskEmail(firstName, lastName, index);
  }
  if (columnName.includes('phone')) {
    return maskPhone(index);
  }
  if (columnName.includes('dob') || columnName.includes('birth')) {
    return maskDOB(index);
  }
  if (columnName.includes('bank_account_last4')) {
    return maskBankAccount(index);
  }
  // ----- FALLBACK for any other column -----
  return GENERIC_MASK;
};

// ---------- Date and currency helpers ----------
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const formatCurrency = (amount) => {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ---------- Deterministic error injection ----------
const shouldApplyError = (recordIndex, totalRecords, errorPercentage, errorType) => {
  if (errorPercentage === 0) return false;
  const errorCount = Math.round((totalRecords * errorPercentage) / 100);
  if (errorCount === 0) return false;
  const hash = errorType.split('').reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);
  const offset = hash % totalRecords;
  const interval = Math.floor(totalRecords / errorCount);
  for (let i = 0; i < errorCount; i++) {
    const targetIndex = (offset + i * interval) % totalRecords;
    if (recordIndex === targetIndex) return true;
  }
  return false;
};

// ---------- Built‑in error injection (unchanged) ----------
const introduceErrors = (record, tableName, errorConfig, recordIndex, totalRecords) => {
  const errors = [];  

  // Data Completeness Errors
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.missingPolicyDates, 'missingPolicyDates') && tableName === 'policies') {
    record.effective_date = null;
    errors.push('effective_date');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.incompleteBeneficiary, 'incompleteBeneficiary') && tableName === 'beneficiaries') {
    record.email = null;
    record.phone = null;
    errors.push('email', 'phone');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.missingClaimAdjuster, 'missingClaimAdjuster') && tableName === 'claims') {
    record.adjuster_id = null;
    errors.push('adjuster_id');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.missingClientId, 'missingClientId') && tableName === 'policies') {
    record.policyholder_id = null;
    errors.push('policyholder_id');
  }
  
  // Data Consistency Errors
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.endBeforeStart, 'endBeforeStart') && tableName === 'policies') {
    const temp = record.effective_date;
    record.effective_date = record.expiry_date;
    record.expiry_date = temp;
    errors.push('effective_date', 'expiry_date');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.claimExceedsCoverage, 'claimExceedsCoverage') && tableName === 'claims') {
    const currentAmount = parseFloat(record.claim_amount.replace(/[$,]/g, ''));
    record.claim_amount = formatCurrency(currentAmount * 2);
    errors.push('claim_amount');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.paymentBeforeClaim, 'paymentBeforeClaim') && tableName === 'payments' && record.payment_date) {
    const paymentDate = new Date(record.payment_date);
    paymentDate.setDate(paymentDate.getDate() - 60);
    record.payment_date = formatDate(paymentDate);
    errors.push('payment_date');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.invalidStatusTransitions, 'invalidStatusTransitions') && (tableName === 'policies' || tableName === 'claims') && record.status) {
    record.status = 'INVALID_STATUS';
    errors.push('status');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.duplicatePolicyNumbers, 'duplicatePolicyNumbers') && tableName === 'policies') {
    record.policy_number = 'POL-2024-000001';
    errors.push('policy_number');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.incorrectJurisdiction, 'incorrectJurisdiction') && tableName === 'policies') {
    record.region = 'XX-INVALID';
    errors.push('region');
  }
  
  // Inconsistent Date Formats
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.inconsistentDateFormats, 'inconsistentDateFormats') && tableName === 'policies' && record.effective_date && !errors.includes('effective_date')) {
    const parts = record.effective_date.split('-');
    record.effective_date = `${parts[1]}/${parts[2]}/${parts[0]}`;
    errors.push('effective_date');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.inconsistentDateFormats, 'inconsistentDateFormatsClai') && tableName === 'claims' && record.claim_date && !errors.includes('claim_date')) {
    const parts = record.claim_date.split('-');
    record.claim_date = `${parts[1]}/${parts[2]}/${parts[0]}`;
    errors.push('claim_date');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.inconsistentDateFormats, 'inconsistentDateFormatsPaym') && tableName === 'payments' && record.payment_date && !errors.includes('payment_date')) {
    const parts = record.payment_date.split('-');
    record.payment_date = `${parts[1]}/${parts[2]}/${parts[0]}`;
    errors.push('payment_date');
  }
  
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.invalidEmailFormats, 'invalidEmailFormats') && record.email) {
    record.email = record.email.replace('@', '[at]');
    errors.push('email');
  }
  
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.malformedPhoneNumbers, 'malformedPhoneNumbers') && (tableName === 'policyholders' || tableName === 'beneficiaries' || tableName === 'agent_employee_brokers') && record.phone) {
    record.phone = record.phone.replace(/[()-\s]/g, '');
    errors.push('phone');
  }

  // Business logic & Statistical Errors
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.overlappingPolicyPeriods, 'overlappingPolicyPeriods') && tableName === 'policies') {
    const expiry = new Date(record.expiry_date);
    expiry.setDate(expiry.getDate() - 200);
    record.expiry_date = formatDate(expiry);
    errors.push('expiry_date');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.claimBeforePolicyStart, 'claimBeforePolicyStart') && tableName === 'claims' && !errors.includes('claim_date')) {
    const claimDate = new Date(record.claim_date);
    claimDate.setFullYear(claimDate.getFullYear() - 2);
    record.claim_date = formatDate(claimDate);
    errors.push('claim_date');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.paymentExceedsClaim, 'paymentExceedsClaim') && tableName === 'payments') {
    const amount = parseFloat(record.amount.replace(/[$,]/g, ''));
    record.amount = formatCurrency(amount * 3);
    errors.push('amount');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.zeroPremiumPolicies, 'zeroPremiumPolicies') && tableName === 'policies') {
    record.premium_amount = '$0.00';
    errors.push('premium_amount');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.ageUnder18, 'ageUnder18') && tableName === 'beneficiaries') {
    record.date_of_birth = '2010-01-01';
    errors.push('date_of_birth');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.claimExceedsPremiumPaid, 'claimExceedsPremiumPaid') && tableName === 'claims' && !errors.includes('claim_amount')) {
    const claimAmount = parseFloat(record.claim_amount.replace(/[$,]/g, ''));
    record.claim_amount = formatCurrency(claimAmount * 10);
    errors.push('claim_amount');
  }

  // Referential Integrity Errors
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.orphanedClaims, 'orphanedClaims') && tableName === 'claims') {
    record.policy_id = 'POL-9999-XXXX';
    errors.push('policy_id');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.paymentsWithoutClaims, 'paymentsWithoutClaims') && tableName === 'payments') {
    record.claim_id = null;
    errors.push('claim_id');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.policyWithoutClient, 'policyWithoutClient') && tableName === 'policies' && record.policyholder_id) {
    record.policyholder_id = 'PH-9999-XXXX';
    errors.push('policyholder_id');
  }
  if (shouldApplyError(recordIndex, totalRecords, errorConfig.policyWithoutAgent, 'policyWithoutAgent') && tableName === 'policies') {
    record.agent_id = 'AG-9999-XXXX';
    errors.push('agent_id');
  }

  if (errors.length > 0) {
    record._errors = errors;
    record._hasError = true;
  }
  return record;
};

// ---------- Business Rule Evaluation Helper ----------
const evaluateCondition = (value, operator, target) => {
  if (value === null || value === undefined) return false;
  
  const numValue = parseFloat(value);
  const numTarget = parseFloat(target);
  if (!isNaN(numValue) && !isNaN(numTarget)) {
    switch (operator) {
      case '==': return numValue === numTarget;
      case '!=': return numValue !== numTarget;
      case '>': return numValue > numTarget;
      case '<': return numValue < numTarget;
      case '>=': return numValue >= numTarget;
      case '<=': return numValue <= numTarget;
    }
  }
  
  const strValue = String(value);
  const strTarget = String(target);
  switch (operator) {
    case '==': return strValue === strTarget;
    case '!=': return strValue !== strTarget;
    case '>': return strValue > strTarget;
    case '<': return strValue < strTarget;
    case '>=': return strValue >= strTarget;
    case '<=': return strValue <= strTarget;
  }
  return false;
};

// ---------- SQL WHERE clause evaluator (simple, safe) ----------
const evaluateSqlWhere = (whereClause, row) => {
  if (!whereClause || whereClause.trim() === '') return true;
  
  try {
    const cleanWhere = whereClause.trim();
    const columns = Object.keys(row);
    let jsExpr = cleanWhere.replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, (match) => {
      if (columns.includes(match)) {
        return `row.${match}`;
      }
      return match;
    });
    jsExpr = jsExpr.replace(/===?/g, '===');
    jsExpr = jsExpr.replace(/([^<>!])=([^=])/g, '$1===$2');
    
    const fn = new Function('row', `return ${jsExpr};`);
    return fn(row);
  } catch (e) {
    console.warn('SQL evaluation error:', e);
    return false;
  }
};

// ---------- Parse SQL statement (format: target = constant WHERE condition PERCENT percentage) ----------
const parseSqlStatement = (statement) => {
  // Trim and remove trailing semicolon
  const cleaned = statement.replace(/;\s*$/, '').trim();
  const regex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*('[^']*'|\d+)\s+WHERE\s+(.+?)\s+PERCENT\s+(\d+)\s*$/i;
  const match = cleaned.match(regex);
  if (!match) {
    throw new Error('Invalid SQL statement format. Expected: target = constant WHERE condition PERCENT percentage');
  }
  const targetColumn = match[1];
  const constantValue = match[2].startsWith("'") ? match[2].slice(1, -1) : match[2];
  const condition = match[3].trim();
  const percentage = parseInt(match[4], 10);
  return { targetColumn, constantValue, condition, percentage };
};

// ---------- Helper to count matching rows for a SQL error ----------
const countMatchingRows = (tableName, condition, count) => {
  let matchCount = 0;
  for (let i = 0; i < count; i++) {
    let record;
    switch (tableName) {
      case 'policies':
        record = generateRawPoliciesRecord(i);
        break;
      case 'claims':
        record = generateRawClaimsRecord(i);
        break;
      case 'policyholders':
        record = generateRawPolicyholdersRecord(i);
        break;
      case 'beneficiaries':
        record = generateRawBeneficiariesRecord(i);
        break;
      case 'payments':
        record = generateRawPaymentsRecord(i);
        break;
      case 'training_certification':
        record = generateRawTrainingCertificationRecord(i);
        break;
      case 'region_regulatory_rules':
        record = generateRawRegionRegulatoryRulesRecord(i);
        break;
      case 'agent_employee_brokers':
        record = generateRawAgentEmployeeBrokersRecord(i);
        break;
      default:
        record = {};
    }
    if (evaluateSqlWhere(condition, record)) {
      matchCount++;
    }
  }
  return matchCount;
};

// ---------- Custom Error Injection (with parsed SQL) ----------
const applyCustomErrors = (record, tableName, customErrors, recordIndex, totalRecords) => {
  if (!customErrors || customErrors.length === 0) return record;

  const errors = record._errors || [];
  const customErrorApplied = [];

  customErrors.forEach(customError => {
    if (customError.tableName !== tableName || !customError.enabled) return;

    let shouldApply = false;
    let column = null;
    let valueToSet = null;
    let effectiveTotal = totalRecords;

    // For SQL query, parse the statement and use pre‑computed matching count
    if (customError.queryType === 'sql') {
      try {
        const parsed = parseSqlStatement(customError.sqlQuery);
        // Check condition for this row
        const matchesCondition = evaluateSqlWhere(parsed.condition, record);
        if (!matchesCondition) return;

        column = parsed.targetColumn;
        valueToSet = parsed.constantValue;
        effectiveTotal = customError._matchingCount || totalRecords;
        const percentage = parsed.percentage;
        shouldApply = shouldApplyError(recordIndex, effectiveTotal, percentage, `custom_${customError.id}`);
      } catch (e) {
        console.warn('Error parsing SQL statement:', e);
        return;
      }
    } else {
      // Simple query: use stored fields
      column = customError.column;
      valueToSet = customError.constantValue;
      const percentage = customError.percentage || 0;
      shouldApply = shouldApplyError(recordIndex, totalRecords, percentage, `custom_${customError.id}`);
    }

    if (!shouldApply) return;

    if (record.hasOwnProperty(column)) {
      switch (customError.action) {
        case 'set_null':
          record[column] = null;
          break;
        case 'set_invalid':
          record[column] = customError.invalidValue || 'INVALID';
          break;
        case 'set_constant':
          record[column] = valueToSet;
          break;
        default:
          break;
      }
      customErrorApplied.push(column);
    }
  });

  if (customErrorApplied.length > 0) {
    record._customErrors = customErrorApplied;
    record._hasCustomError = true;
    record._hasError = true;
    record._errors = [...errors, ...customErrorApplied];
  }

  return record;
};

// ---------- MAIN GENERATOR with PII overrides, per-table errors, business rules, and custom errors ----------
export const generateSampleData = (tableName, count = 50, errorConfig = {}, piiFields = null, businessRules = [], customErrors = []) => {
  const data = [];
  
  const useRawGeneration = piiFields !== null;
  const activeRules = businessRules.filter(r => r.tableName === tableName && r.enabled);
  const activeCustomErrors = customErrors.filter(c => c.tableName === tableName && c.enabled);

  // Pre‑count matching rows for SQL custom errors
  const sqlErrorsWithCount = activeCustomErrors
    .filter(err => err.queryType === 'sql' && err.sqlQuery)
    .map(err => {
      try {
        const parsed = parseSqlStatement(err.sqlQuery);
        const matchCount = countMatchingRows(tableName, parsed.condition, count);
        return { ...err, _matchingCount: matchCount };
      } catch (e) {
        console.warn('Error counting matches for SQL error:', e);
        return err;
      }
    });

  // Merge counts back into custom errors
  const enhancedCustomErrors = activeCustomErrors.map(err => {
    if (err.queryType === 'sql') {
      const found = sqlErrorsWithCount.find(e => e.id === err.id);
      return found || err;
    }
    return err;
  });

  const MAX_AUTO_FIX_ATTEMPTS = 10;

  switch (tableName) {
    // ---------- POLICIES ----------
    case 'policies':
      for (let i = 0; i < count; i++) {
        let record = generateRawPoliciesRecord(i);
        if (useRawGeneration && piiFields && piiFields.length > 0) {
          piiFields.forEach(field => {
            const masked = maskByColumnName(field, i, 'policy', 'owner');
            if (record[field] !== undefined) record[field] = masked;
          });
        }

        // ----- Apply Business Rules (with auto-fix) -----
        let attempts = 0;
        let ruleViolations = [];
        let isValid = false;
        while (!isValid && attempts < MAX_AUTO_FIX_ATTEMPTS) {
          if (attempts > 0) {
            record = generateRawPoliciesRecord(i + attempts * 1000);
            if (useRawGeneration && piiFields && piiFields.length > 0) {
              piiFields.forEach(field => {
                const masked = maskByColumnName(field, i + attempts * 1000, 'policy', 'owner');
                if (record[field] !== undefined) record[field] = masked;
              });
            }
          }
          
          ruleViolations = [];
          isValid = true;
          for (const rule of activeRules) {
            const value = record[rule.column];
            const passes = evaluateCondition(value, rule.operator, rule.value);
            if (!passes) {
              ruleViolations.push(rule.id);
              isValid = false;
              if (!rule.autoFix) break;
            }
          }
          attempts++;
        }
        
        if (ruleViolations.length > 0) {
          record._ruleViolations = ruleViolations;
          record._hasRuleViolation = true;
        }
        // ------------------------------------------------

        // ----- Apply built‑in errors -----
        record = introduceErrors(record, tableName, errorConfig, i, count);

        // ----- Apply custom errors (using enhanced list) -----
        record = applyCustomErrors(record, tableName, enhancedCustomErrors, i, count);

        data.push(record);
      }
      break;

    // ---------- CLAIMS ----------
    case 'claims':
      for (let i = 0; i < count; i++) {
        let record = generateRawClaimsRecord(i);
        if (useRawGeneration && piiFields && piiFields.length > 0) {
          piiFields.forEach(field => {
            const masked = maskByColumnName(field, i, 'claim', 'adjuster');
            if (record[field] !== undefined) record[field] = masked;
          });
        }

        // ----- Apply Business Rules (with auto-fix) -----
        let attempts = 0;
        let ruleViolations = [];
        let isValid = false;
        while (!isValid && attempts < MAX_AUTO_FIX_ATTEMPTS) {
          if (attempts > 0) {
            record = generateRawClaimsRecord(i + attempts * 1000);
            if (useRawGeneration && piiFields && piiFields.length > 0) {
              piiFields.forEach(field => {
                const masked = maskByColumnName(field, i + attempts * 1000, 'claim', 'adjuster');
                if (record[field] !== undefined) record[field] = masked;
              });
            }
          }
          ruleViolations = [];
          isValid = true;
          for (const rule of activeRules) {
            const value = record[rule.column];
            const passes = evaluateCondition(value, rule.operator, rule.value);
            if (!passes) {
              ruleViolations.push(rule.id);
              isValid = false;
              if (!rule.autoFix) break;
            }
          }
          attempts++;
        }
        if (ruleViolations.length > 0) {
          record._ruleViolations = ruleViolations;
          record._hasRuleViolation = true;
        }

        record = introduceErrors(record, tableName, errorConfig, i, count);
        record = applyCustomErrors(record, tableName, enhancedCustomErrors, i, count);
        data.push(record);
      }
      break;

    // ---------- POLICYHOLDERS ----------
    case 'policyholders':
      for (let i = 0; i < count; i++) {
        let record = generateRawPolicyholdersRecord(i);
        if (useRawGeneration && piiFields && piiFields.length > 0) {
          piiFields.forEach(field => {
            const company = companies[i % companies.length];
            const firstName = company.split(' ')[0];
            const masked = maskByColumnName(field, i, firstName, 'corp');
            if (record[field] !== undefined) record[field] = masked;
          });
        }

        // ----- Apply Business Rules (with auto-fix) -----
        let attempts = 0;
        let ruleViolations = [];
        let isValid = false;
        while (!isValid && attempts < MAX_AUTO_FIX_ATTEMPTS) {
          if (attempts > 0) {
            record = generateRawPolicyholdersRecord(i + attempts * 1000);
            if (useRawGeneration && piiFields && piiFields.length > 0) {
              piiFields.forEach(field => {
                const company = companies[(i + attempts * 1000) % companies.length];
                const firstName = company.split(' ')[0];
                const masked = maskByColumnName(field, i + attempts * 1000, firstName, 'corp');
                if (record[field] !== undefined) record[field] = masked;
              });
            }
          }
          ruleViolations = [];
          isValid = true;
          for (const rule of activeRules) {
            const value = record[rule.column];
            const passes = evaluateCondition(value, rule.operator, rule.value);
            if (!passes) {
              ruleViolations.push(rule.id);
              isValid = false;
              if (!rule.autoFix) break;
            }
          }
          attempts++;
        }
        if (ruleViolations.length > 0) {
          record._ruleViolations = ruleViolations;
          record._hasRuleViolation = true;
        }

        record = introduceErrors(record, tableName, errorConfig, i, count);
        record = applyCustomErrors(record, tableName, enhancedCustomErrors, i, count);
        data.push(record);
      }
      break;

    // ---------- BENEFICIARIES ----------
    case 'beneficiaries':
      for (let i = 0; i < count; i++) {
        let record = generateRawBeneficiariesRecord(i);
        if (useRawGeneration && piiFields && piiFields.length > 0) {
          piiFields.forEach(field => {
            const firstName = firstNames[i % firstNames.length];
            const lastName = lastNames[i % lastNames.length];
            const masked = maskByColumnName(field, i, firstName, lastName);
            if (record[field] !== undefined) record[field] = masked;
          });
        }

        // ----- Apply Business Rules (with auto-fix) -----
        let attempts = 0;
        let ruleViolations = [];
        let isValid = false;
        while (!isValid && attempts < MAX_AUTO_FIX_ATTEMPTS) {
          if (attempts > 0) {
            record = generateRawBeneficiariesRecord(i + attempts * 1000);
            if (useRawGeneration && piiFields && piiFields.length > 0) {
              piiFields.forEach(field => {
                const firstName = firstNames[(i + attempts * 1000) % firstNames.length];
                const lastName = lastNames[(i + attempts * 1000) % lastNames.length];
                const masked = maskByColumnName(field, i + attempts * 1000, firstName, lastName);
                if (record[field] !== undefined) record[field] = masked;
              });
            }
          }
          ruleViolations = [];
          isValid = true;
          for (const rule of activeRules) {
            const value = record[rule.column];
            const passes = evaluateCondition(value, rule.operator, rule.value);
            if (!passes) {
              ruleViolations.push(rule.id);
              isValid = false;
              if (!rule.autoFix) break;
            }
          }
          attempts++;
        }
        if (ruleViolations.length > 0) {
          record._ruleViolations = ruleViolations;
          record._hasRuleViolation = true;
        }

        record = introduceErrors(record, tableName, errorConfig, i, count);
        record = applyCustomErrors(record, tableName, enhancedCustomErrors, i, count);
        data.push(record);
      }
      break;

    // ---------- PAYMENTS ----------
    case 'payments':
      for (let i = 0; i < count; i++) {
        let record = generateRawPaymentsRecord(i);
        if (useRawGeneration && piiFields && piiFields.length > 0) {
          piiFields.forEach(field => {
            const masked = maskByColumnName(field, i);
            if (record[field] !== undefined) record[field] = masked;
          });
        }

        // ----- Apply Business Rules (with auto-fix) -----
        let attempts = 0;
        let ruleViolations = [];
        let isValid = false;
        while (!isValid && attempts < MAX_AUTO_FIX_ATTEMPTS) {
          if (attempts > 0) {
            record = generateRawPaymentsRecord(i + attempts * 1000);
            if (useRawGeneration && piiFields && piiFields.length > 0) {
              piiFields.forEach(field => {
                const masked = maskByColumnName(field, i + attempts * 1000);
                if (record[field] !== undefined) record[field] = masked;
              });
            }
          }
          ruleViolations = [];
          isValid = true;
          for (const rule of activeRules) {
            const value = record[rule.column];
            const passes = evaluateCondition(value, rule.operator, rule.value);
            if (!passes) {
              ruleViolations.push(rule.id);
              isValid = false;
              if (!rule.autoFix) break;
            }
          }
          attempts++;
        }
        if (ruleViolations.length > 0) {
          record._ruleViolations = ruleViolations;
          record._hasRuleViolation = true;
        }

        record = introduceErrors(record, tableName, errorConfig, i, count);
        record = applyCustomErrors(record, tableName, enhancedCustomErrors, i, count);
        data.push(record);
      }
      break;

    // ---------- TRAINING CERTIFICATION ----------
    case 'training_certification':
      for (let i = 0; i < count; i++) {
        let record = generateRawTrainingCertificationRecord(i);
        if (useRawGeneration && piiFields && piiFields.length > 0) {
          piiFields.forEach(field => {
            const masked = maskByColumnName(field, i);
            if (record[field] !== undefined) record[field] = masked;
          });
        }

        // ----- Apply Business Rules (with auto-fix) -----
        let attempts = 0;
        let ruleViolations = [];
        let isValid = false;
        while (!isValid && attempts < MAX_AUTO_FIX_ATTEMPTS) {
          if (attempts > 0) {
            record = generateRawTrainingCertificationRecord(i + attempts * 1000);
            if (useRawGeneration && piiFields && piiFields.length > 0) {
              piiFields.forEach(field => {
                const masked = maskByColumnName(field, i + attempts * 1000);
                if (record[field] !== undefined) record[field] = masked;
              });
            }
          }
          ruleViolations = [];
          isValid = true;
          for (const rule of activeRules) {
            const value = record[rule.column];
            const passes = evaluateCondition(value, rule.operator, rule.value);
            if (!passes) {
              ruleViolations.push(rule.id);
              isValid = false;
              if (!rule.autoFix) break;
            }
          }
          attempts++;
        }
        if (ruleViolations.length > 0) {
          record._ruleViolations = ruleViolations;
          record._hasRuleViolation = true;
        }

        record = introduceErrors(record, tableName, errorConfig, i, count);
        record = applyCustomErrors(record, tableName, enhancedCustomErrors, i, count);
        data.push(record);
      }
      break;

    // ---------- REGION REGULATORY RULES ----------
    case 'region_regulatory_rules':
      for (let i = 0; i < count; i++) {
        let record = generateRawRegionRegulatoryRulesRecord(i);
        if (useRawGeneration && piiFields && piiFields.length > 0) {
          piiFields.forEach(field => {
            const masked = maskByColumnName(field, i);
            if (record[field] !== undefined) record[field] = masked;
          });
        }

        // ----- Apply Business Rules (with auto-fix) -----
        let attempts = 0;
        let ruleViolations = [];
        let isValid = false;
        while (!isValid && attempts < MAX_AUTO_FIX_ATTEMPTS) {
          if (attempts > 0) {
            record = generateRawRegionRegulatoryRulesRecord(i + attempts * 1000);
            if (useRawGeneration && piiFields && piiFields.length > 0) {
              piiFields.forEach(field => {
                const masked = maskByColumnName(field, i + attempts * 1000);
                if (record[field] !== undefined) record[field] = masked;
              });
            }
          }
          ruleViolations = [];
          isValid = true;
          for (const rule of activeRules) {
            const value = record[rule.column];
            const passes = evaluateCondition(value, rule.operator, rule.value);
            if (!passes) {
              ruleViolations.push(rule.id);
              isValid = false;
              if (!rule.autoFix) break;
            }
          }
          attempts++;
        }
        if (ruleViolations.length > 0) {
          record._ruleViolations = ruleViolations;
          record._hasRuleViolation = true;
        }

        record = introduceErrors(record, tableName, errorConfig, i, count);
        record = applyCustomErrors(record, tableName, enhancedCustomErrors, i, count);
        data.push(record);
      }
      break;

    // ---------- AGENT EMPLOYEE BROKERS ----------
    case 'agent_employee_brokers':
      for (let i = 0; i < count; i++) {
        let record = generateRawAgentEmployeeBrokersRecord(i);
        if (useRawGeneration && piiFields && piiFields.length > 0) {
          piiFields.forEach(field => {
            const firstName = firstNames[i % firstNames.length];
            const lastName = lastNames[i % lastNames.length];
            const masked = maskByColumnName(field, i, firstName, lastName);
            if (record[field] !== undefined) record[field] = masked;
          });
        }

        // ----- Apply Business Rules (with auto-fix) -----
        let attempts = 0;
        let ruleViolations = [];
        let isValid = false;
        while (!isValid && attempts < MAX_AUTO_FIX_ATTEMPTS) {
          if (attempts > 0) {
            record = generateRawAgentEmployeeBrokersRecord(i + attempts * 1000);
            if (useRawGeneration && piiFields && piiFields.length > 0) {
              piiFields.forEach(field => {
                const firstName = firstNames[(i + attempts * 1000) % firstNames.length];
                const lastName = lastNames[(i + attempts * 1000) % lastNames.length];
                const masked = maskByColumnName(field, i + attempts * 1000, firstName, lastName);
                if (record[field] !== undefined) record[field] = masked;
              });
            }
          }
          ruleViolations = [];
          isValid = true;
          for (const rule of activeRules) {
            const value = record[rule.column];
            const passes = evaluateCondition(value, rule.operator, rule.value);
            if (!passes) {
              ruleViolations.push(rule.id);
              isValid = false;
              if (!rule.autoFix) break;
            }
          }
          attempts++;
        }
        if (ruleViolations.length > 0) {
          record._ruleViolations = ruleViolations;
          record._hasRuleViolation = true;
        }

        record = introduceErrors(record, tableName, errorConfig, i, count);
        record = applyCustomErrors(record, tableName, enhancedCustomErrors, i, count);
        data.push(record);
      }
      break;
      
    default:
      break;
  }
  
  return data;
};

// ---------- Raw Record Generators (extracted for reuse) ----------
function generateRawPoliciesRecord(i) {
  const effectiveDate = randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
  const expiryDate = new Date(effectiveDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const coverageAmount = 500000 + Math.random() * 9500000;
  const premiumAmount = coverageAmount * (0.005 + Math.random() * 0.045);
  return {
    policy_id: `POL-${String(1000 + i).padStart(4, '0')}`,
    policy_number: `POL-2024-${String(100000 + i).padStart(6, '0')}`,
    policyholder_id: `PH-${String(1000 + (i % 20)).padStart(4, '0')}`,
    agent_id: `AG-${String(1000 + (i % 20)).padStart(4, '0')}`,
    policy_type: policyTypes[i % policyTypes.length],
    effective_date: formatDate(effectiveDate),
    expiry_date: formatDate(expiryDate),
    premium_amount: formatCurrency(premiumAmount),
    coverage_amount: formatCurrency(coverageAmount),
    status: statuses[i % 3],
    region: `${states[i % states.length]}`,
    created_date: formatDate(effectiveDate),
    modified_date: formatDate(new Date()),
    deductible: formatCurrency(5000 + Math.random() * 20000),
    notes: i % 3 === 0 ? 'Standard coverage' : ''
  };
}

function generateRawClaimsRecord(i) {
  const claimDate = randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
  const incidentDate = new Date(claimDate);
  incidentDate.setDate(incidentDate.getDate() - 7);
  const claimAmount = 5000 + Math.random() * 495000;
  const settlementAmount = claimAmount * (0.6 + Math.random() * 0.3);
  return {
    claim_id: `CLM-${String(1000 + i).padStart(4, '0')}`,
    claim_number: `CLM-2024-${String(100000 + i).padStart(6, '0')}`,
    policy_id: `POL-${String(1000 + (i % 25)).padStart(4, '0')}`,
    claim_date: formatDate(claimDate),
    claim_amount: formatCurrency(claimAmount),
    settlement_amount: i % 2 === 0 ? formatCurrency(settlementAmount) : '',
    status: claimStatuses[i % claimStatuses.length],
    adjuster_id: `ADJ-${String(1000 + (i % 10)).padStart(4, '0')}`,
    incident_date: formatDate(incidentDate),
    description: 'Claim details',
    created_date: formatDate(claimDate),
    closed_date: i % 2 === 0 ? formatDate(new Date(claimDate.getTime() + 30 * 24 * 60 * 60 * 1000)) : ''
  };
}

function generateRawPolicyholdersRecord(i) {
  const company = companies[i % companies.length];
  return {
    policyholder_id: `PH-${String(1000 + i).padStart(4, '0')}`,
    company_name: company,
    tax_id: `${String(100 + (i % 900)).padStart(3, '0')}-${String(1000000 + (i % 9000000)).padStart(7, '0')}`,
    industry_code: ['TECH', 'MFG', 'RETAIL', 'HEALTH', 'FINANCE'][i % 5],
    email: `${company.split(' ')[0].toLowerCase()}.corp${i}@example.com`,
    phone: `555-${String(100 + (i % 900)).padStart(3, '0')}-${String(1000 + (i % 9000)).padStart(4, '0')}`,
    address_line1: `${100 + i} Main Street`,
    address_line2: i % 2 === 0 ? `Suite ${100 + i}` : '',
    city: cities[i % cities.length],
    state: states[i % states.length],
    zip_code: String(10000 + (i * 111 % 90000)).padStart(5, '0'),
    country: 'USA',
    annual_revenue: formatCurrency(1000000 + Math.random() * 99000000),
    employee_count: Math.floor(50 + Math.random() * 9950),
    founded_year: 1950 + Math.floor(Math.random() * 70),
    website: `www.${company.toLowerCase().replace(/\s/g, '')}.com`,
    created_date: formatDate(randomDate(new Date(2020, 0, 1), new Date(2024, 0, 1))),
    credit_rating: ['AAA', 'AA', 'A', 'BBB', 'BB'][i % 5]
  };
}

function generateRawBeneficiariesRecord(i) {
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[i % lastNames.length];
  return {
    beneficiary_id: `BEN-${String(1000 + i).padStart(4, '0')}`,
    policyholder_id: `PH-${String(1000 + (i % 20)).padStart(4, '0')}`,
    first_name: firstName,
    last_name: lastName,
    ssn: `${String(100 + (i % 900)).padStart(3, '0')}-${String(10 + (i % 90)).padStart(2, '0')}-${String(1000 + (i % 9000)).padStart(4, '0')}`,
    date_of_birth: `${1960 + (i % 45)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
    phone: `555-${String(100 + (i % 900)).padStart(3, '0')}-${String(1000 + (i % 9000)).padStart(4, '0')}`,
    employee_id: `EMP-${String(10000 + i).padStart(6, '0')}`,
    department: ['Engineering', 'Sales', 'Marketing', 'Operations', 'Finance'][i % 5],
    relationship: i % 3 === 0 ? 'Self' : i % 3 === 1 ? 'Spouse' : 'Dependent',
    coverage_percentage: i % 3 === 0 ? '100.00' : '50.00',
    status: 'Active',
    created_date: formatDate(randomDate(new Date(2020, 0, 1), new Date(2024, 0, 1)))
  };
}

function generateRawPaymentsRecord(i) {
  const paymentDate = randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
  const amount = 1000 + Math.random() * 99000;
  return {
    payment_id: `PAY-${String(1000 + i).padStart(4, '0')}`,
    policy_id: `POL-${String(1000 + (i % 25)).padStart(4, '0')}`,
    claim_id: i % 3 === 0 ? `CLM-${String(1000 + (i % 30)).padStart(4, '0')}` : '',
    payment_date: formatDate(paymentDate),
    amount: formatCurrency(amount),
    payment_type: i % 3 === 0 ? 'Claim Settlement' : 'Premium',
    payment_method: paymentMethods[i % paymentMethods.length],
    bank_account_last4: String(1000 + (i % 9000)).slice(-4),
    currency: 'USD',
    status: 'Completed',
    created_date: formatDate(paymentDate)
  };
}

function generateRawTrainingCertificationRecord(i) {
  const completionDate = randomDate(new Date(2022, 0, 1), new Date(2024, 0, 1));
  const expiryDate = new Date(completionDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 2);
  return {
    certification_id: `CERT-${String(1000 + i).padStart(4, '0')}`,
    agent_id: `AG-${String(1000 + (i % 20)).padStart(4, '0')}`,
    certification_type: ['Property & Casualty', 'Life & Health', 'Commercial Lines', 'Cyber Insurance'][i % 4],
    completion_date: formatDate(completionDate),
    expiry_date: formatDate(expiryDate),
    region_authorized: states[i % states.length],
    status: expiryDate > new Date() ? 'Active' : 'Expired',
    issuing_authority: 'State Insurance Commission'
  };
}

function generateRawRegionRegulatoryRulesRecord(i) {
  return {
    rule_id: `RULE-${String(1000 + i).padStart(4, '0')}`,
    region: states[i % states.length],
    allowed_policy_types: JSON.stringify(policyTypes.slice(0, 4 + (i % 4))),
    min_certification_required: 'Property & Casualty License',
    license_renewal_period: 24,
    effective_date: formatDate(new Date(2020, 0, 1))
  };
}

function generateRawAgentEmployeeBrokersRecord(i) {
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[i % lastNames.length];
  const licenseExpiry = randomDate(new Date(2024, 0, 1), new Date(2026, 11, 31));
  return {
    agent_id: `AG-${String(1000 + i).padStart(4, '0')}`,
    first_name: firstName,
    last_name: lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
    phone: `555-${String(100 + (i % 900)).padStart(3, '0')}-${String(1000 + (i % 9000)).padStart(4, '0')}`,
    ssn: `${String(100 + (i % 900)).padStart(3, '0')}-${String(10 + (i % 90)).padStart(2, '0')}-${String(1000 + (i % 9000)).padStart(4, '0')}`,
    license_number: `LIC-${states[i % states.length]}-${String(100000 + i).padStart(6, '0')}`,
    license_expiry: formatDate(licenseExpiry),
    agent_type: ['Employee', 'Broker', 'Independent'][i % 3],
    commission_rate: `${(2 + Math.random() * 8).toFixed(2)}`,
    status: 'Active',
    created_date: formatDate(randomDate(new Date(2018, 0, 1), new Date(2023, 0, 1)))
  };
}

// ---------- Standalone PII masking (unchanged) ----------
export const maskPII = (value, type) => {
  switch (type) {
    case 'ssn': return maskSSN(Math.random() * 1000);
    case 'email': return maskEmail('user', 'name', Math.random() * 1000);
    case 'phone': return maskPhone(Math.random() * 1000);
    case 'dob': return maskDOB(Math.random() * 1000);
    default: return value;
  }
};