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

// PII Masking functions
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
  const year = 1960 + (index % 45);
  const month = String(1 + (index % 12)).padStart(2, '0');
  const day = String(1 + (index % 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const maskTaxID = (index) => {
  const first = String(10 + (index % 90));
  const last = String(1000000 + (index % 9000000));
  return `${first}-${last}`;
};

export const maskBankAccount = (index) => {
  return String(1000 + (index % 9000)).slice(-4);
};

// Generate random date within range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const formatCurrency = (amount) => {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Introduce errors based on configuration
const introduceErrors = (record, tableName, errorConfig) => {
  const errors = [];
  const randomValue = Math.random() * 100;
  
  // Data Completeness Errors
  if (randomValue < errorConfig.missingPolicyDates && tableName === 'policies') {
    record.effective_date = null;
    errors.push('effective_date');
  }
  
  if (randomValue < errorConfig.incompleteBeneficiary && tableName === 'beneficiaries') {
    record.email = null;
    record.phone = null;
    errors.push('email', 'phone');
  }
  
  if (randomValue < errorConfig.missingClaimAdjuster && tableName === 'claims') {
    record.adjuster_id = null;
    errors.push('adjuster_id');
  }
  
  if (randomValue < errorConfig.nullPremium && tableName === 'policies') {
    record.premium_amount = null;
    errors.push('premium_amount');
  }
  
  if (randomValue < errorConfig.missingClientId && tableName === 'policies') {
    record.policyholder_id = null;
    errors.push('policyholder_id');
  }
  
  // Data Consistency Errors
  if (randomValue < errorConfig.endBeforeStart && tableName === 'policies') {
    const temp = record.effective_date;
    record.effective_date = record.expiry_date;
    record.expiry_date = temp;
    errors.push('effective_date', 'expiry_date');
  }
  
  if (randomValue < errorConfig.claimExceedsCoverage && tableName === 'claims') {
    record.claim_amount = formatCurrency(parseFloat(record.claim_amount.replace(/[$,]/g, '')) * 2);
    errors.push('claim_amount');
  }
  
  if (randomValue < errorConfig.paymentBeforeClaim && tableName === 'payments') {
    const claimDate = new Date(record.payment_date);
    claimDate.setDate(claimDate.getDate() + 30);
    record.payment_date = formatDate(claimDate);
    errors.push('payment_date');
  }
  
  // Data Accuracy Errors
  if (randomValue < errorConfig.invalidStatusTransitions && (tableName === 'policies' || tableName === 'claims')) {
    record.status = 'INVALID_STATUS';
    errors.push('status');
  }
  
  if (randomValue < errorConfig.duplicatePolicyNumbers && tableName === 'policies') {
    record.policy_number = 'POL-2024-DUPLICATE';
    errors.push('policy_number');
  }
  
  if (randomValue < errorConfig.incorrectJurisdiction && tableName === 'policies') {
    record.region = 'XX-INVALID';
    errors.push('region');
  }
  
  // Format Issues
  if (randomValue < errorConfig.inconsistentDateFormats && record.effective_date) {
    const parts = record.effective_date.split('-');
    record.effective_date = `${parts[1]}/${parts[2]}/${parts[0]}`; // MM/DD/YYYY
    errors.push('effective_date');
  }
  
  if (randomValue < errorConfig.invalidEmailFormats && record.email) {
    record.email = record.email.replace('@', '[at]');
    errors.push('email');
  }
  
  if (randomValue < errorConfig.malformedPhoneNumbers && record.phone) {
    record.phone = record.phone.replace(/[()-\s]/g, '');
    errors.push('phone');
  }
  
  // Statistical Errors
  if (randomValue < errorConfig.zeroPremiumPolicies && tableName === 'policies') {
    record.premium_amount = '$0.00';
    errors.push('premium_amount');
  }
  
  if (randomValue < errorConfig.ageUnder18 && tableName === 'beneficiaries') {
    record.date_of_birth = '2010-01-01';
    errors.push('date_of_birth');
  }
  
  // Referential Integrity Errors
  if (randomValue < errorConfig.orphanedClaims && tableName === 'claims') {
    record.policy_id = 'POL-9999-XXXX';
    errors.push('policy_id');
  }
  
  if (randomValue < errorConfig.paymentsWithoutClaims && tableName === 'payments') {
    record.claim_id = null;
    errors.push('claim_id');
  }
  
  if (errors.length > 0) {
    record._errors = errors;
    record._hasError = true;
  }
  
  return record;
};

// Generate data for specific tables
export const generateSampleData = (tableName, count = 25, errorConfig = {}) => {
  const data = [];
  
  switch (tableName) {
    case 'policies':
      for (let i = 0; i < count; i++) {
        const effectiveDate = randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
        const expiryDate = new Date(effectiveDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        
        const coverageAmount = 500000 + Math.random() * 9500000;
        const premiumAmount = coverageAmount * (0.005 + Math.random() * 0.045);
        
        let record = {
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
        
        record = introduceErrors(record, tableName, errorConfig);
        data.push(record);
      }
      break;
      
    case 'claims':
      for (let i = 0; i < count; i++) {
        const claimDate = randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
        const incidentDate = new Date(claimDate);
        incidentDate.setDate(incidentDate.getDate() - 7);
        
        const claimAmount = 5000 + Math.random() * 495000;
        const settlementAmount = claimAmount * (0.6 + Math.random() * 0.3);
        
        let record = {
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
        
        record = introduceErrors(record, tableName, errorConfig);
        data.push(record);
      }
      break;
      
    case 'policyholders':
      for (let i = 0; i < count; i++) {
        const company = companies[i % companies.length];
        
        let record = {
          policyholder_id: `PH-${String(1000 + i).padStart(4, '0')}`,
          company_name: company,
          tax_id: maskTaxID(i),
          industry_code: ['TECH', 'MFG', 'RETAIL', 'HEALTH', 'FINANCE'][i % 5],
          email: maskEmail(company.split(' ')[0], 'corp', i),
          phone: maskPhone(i),
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
        
        record = introduceErrors(record, tableName, errorConfig);
        data.push(record);
      }
      break;
      
    case 'beneficiaries':
      for (let i = 0; i < count; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        
        let record = {
          beneficiary_id: `BEN-${String(1000 + i).padStart(4, '0')}`,
          policyholder_id: `PH-${String(1000 + (i % 20)).padStart(4, '0')}`,
          first_name: firstName,
          last_name: lastName,
          ssn: maskSSN(i),
          date_of_birth: maskDOB(i),
          email: maskEmail(firstName, lastName, i),
          phone: maskPhone(i),
          employee_id: `EMP-${String(10000 + i).padStart(6, '0')}`,
          department: ['Engineering', 'Sales', 'Marketing', 'Operations', 'Finance'][i % 5],
          relationship: i % 3 === 0 ? 'Self' : i % 3 === 1 ? 'Spouse' : 'Dependent',
          coverage_percentage: i % 3 === 0 ? '100.00' : '50.00',
          status: 'Active',
          created_date: formatDate(randomDate(new Date(2020, 0, 1), new Date(2024, 0, 1)))
        };
        
        record = introduceErrors(record, tableName, errorConfig);
        data.push(record);
      }
      break;
      
    case 'payments':
      for (let i = 0; i < count; i++) {
        const paymentDate = randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
        const amount = 1000 + Math.random() * 99000;
        
        let record = {
          payment_id: `PAY-${String(1000 + i).padStart(4, '0')}`,
          policy_id: `POL-${String(1000 + (i % 25)).padStart(4, '0')}`,
          claim_id: i % 3 === 0 ? `CLM-${String(1000 + (i % 30)).padStart(4, '0')}` : '',
          payment_date: formatDate(paymentDate),
          amount: formatCurrency(amount),
          payment_type: i % 3 === 0 ? 'Claim Settlement' : 'Premium',
          payment_method: paymentMethods[i % paymentMethods.length],
          bank_account_last4: maskBankAccount(i),
          currency: 'USD',
          status: 'Completed',
          created_date: formatDate(paymentDate)
        };
        
        record = introduceErrors(record, tableName, errorConfig);
        data.push(record);
      }
      break;
      
    case 'training_certification':
      for (let i = 0; i < count; i++) {
        const completionDate = randomDate(new Date(2022, 0, 1), new Date(2024, 0, 1));
        const expiryDate = new Date(completionDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 2);
        
        let record = {
          certification_id: `CERT-${String(1000 + i).padStart(4, '0')}`,
          agent_id: `AG-${String(1000 + (i % 20)).padStart(4, '0')}`,
          certification_type: ['Property & Casualty', 'Life & Health', 'Commercial Lines', 'Cyber Insurance'][i % 4],
          completion_date: formatDate(completionDate),
          expiry_date: formatDate(expiryDate),
          region_authorized: states[i % states.length],
          status: expiryDate > new Date() ? 'Active' : 'Expired',
          issuing_authority: 'State Insurance Commission'
        };
        
        record = introduceErrors(record, tableName, errorConfig);
        data.push(record);
      }
      break;
      
    case 'region_regulatory_rules':
      for (let i = 0; i < count; i++) {
        let record = {
          rule_id: `RULE-${String(1000 + i).padStart(4, '0')}`,
          region: states[i % states.length],
          allowed_policy_types: JSON.stringify(policyTypes.slice(0, 4 + (i % 4))),
          min_certification_required: 'Property & Casualty License',
          license_renewal_period: 24,
          effective_date: formatDate(new Date(2020, 0, 1))
        };
        
        record = introduceErrors(record, tableName, errorConfig);
        data.push(record);
      }
      break;
      
    case 'agent_employee_brokers':
      for (let i = 0; i < count; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        const licenseExpiry = randomDate(new Date(2024, 0, 1), new Date(2026, 11, 31));
        
        let record = {
          agent_id: `AG-${String(1000 + i).padStart(4, '0')}`,
          first_name: firstName,
          last_name: lastName,
          email: maskEmail(firstName, lastName, i),
          phone: maskPhone(i),
          ssn: maskSSN(i),
          license_number: `LIC-${states[i % states.length]}-${String(100000 + i).padStart(6, '0')}`,
          license_expiry: formatDate(licenseExpiry),
          agent_type: ['Employee', 'Broker', 'Independent'][i % 3],
          commission_rate: `${(2 + Math.random() * 8).toFixed(2)}`,
          status: 'Active',
          created_date: formatDate(randomDate(new Date(2018, 0, 1), new Date(2023, 0, 1)))
        };
        
        record = introduceErrors(record, tableName, errorConfig);
        data.push(record);
      }
      break;
      
    default:
      break;
  }
  
  return data;
};

export const maskPII = (value, type) => {
  switch (type) {
    case 'ssn':
      return maskSSN(Math.random() * 1000);
    case 'email':
      return maskEmail('user', 'name', Math.random() * 1000);
    case 'phone':
      return maskPhone(Math.random() * 1000);
    case 'dob':
      return maskDOB(Math.random() * 1000);
    default:
      return value;
  }
};
