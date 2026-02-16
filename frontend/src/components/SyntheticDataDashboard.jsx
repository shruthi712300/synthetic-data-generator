import React, { useState } from 'react';
import { Database, ChevronDown, ChevronUp, Save, RotateCcw, Download, AlertCircle, CheckCircle, Info, Eye, Shield, Link as LinkIcon, Edit, X } from 'lucide-react';
import { generateSampleData, maskPII } from '../utils/dataGenerator';
import { Step3DataGenerationControls, Step4GeneratedDataPreview } from './StepComponents';
import { Step5ConfigureErrors, Step5BusinessRules, Step6DestinationPreview } from './Step5and6';

const SyntheticDataDashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [detectedTables, setDetectedTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableGenerationConfig, setTableGenerationConfig] = useState({});
  const [piiMaskingMode, setPiiMaskingMode] = useState({});
  
  // ----- Manual PII Override State -----
  const [piiOverrides, setPiiOverrides] = useState({}); // key: "tableName.columnName", value: true/false
  const [showPiiOverrideModal, setShowPiiOverrideModal] = useState(false);
  const [modalTableName, setModalTableName] = useState('');
  // ------------------------------------

  // ----- GLOBAL ERROR CONFIG (Dataset Defaults) -----
  const [errorConfig, setErrorConfig] = useState({
    missingPolicyDates: 2,
    incompleteBeneficiary: 3,
    missingClaimAdjuster: 2,
    nullPremium: 0,
    missingClientId: 0,
    endBeforeStart: 0,
    claimExceedsCoverage: 0,
    paymentBeforeClaim: 0,
    invalidStatusTransitions: 0,
    duplicatePolicyNumbers: 0,
    incorrectJurisdiction: 0,
    inconsistentDateFormats: 3,
    invalidEmailFormats: 2,
    malformedPhoneNumbers: 2,
    overlappingPolicyPeriods: 0,
    claimBeforePolicyStart: 0,
    paymentExceedsClaim: 0,
    zeroPremiumPolicies: 0,
    claimExceedsCoverageLimit: 0,
    ageUnder18: 0,
    claimExceedsPremiumPaid: 0,
    orphanedClaims: 0,
    paymentsWithoutClaims: 0,
    claimsWithoutPolicyId: 2,
    policyWithoutClient: 2,
    policyWithoutAgent: 0
  });
  // -------------------------------------------------

  // ----- PER-TABLE ERROR OVERRIDES (granular thresholds) -----
  const [perTableErrorOverrides, setPerTableErrorOverrides] = useState({});
  // ---------------------------------------------------------

  // ----- CUSTOM BUSINESS RULES -----
  const [businessRules, setBusinessRules] = useState([]);
  // -------------------------------

  // ----- CUSTOM ERRORS (new) -----
  const [customErrors, setCustomErrors] = useState([]);
  // -------------------------------

  const [behaviorRules, setBehaviorRules] = useState({
    claimRate: { current: 23.4, target: { min: 10, max: 30 }, adjust: false },
    premiumSkewed: { current: true, target: true, adjust: false },
    seasonalRenewals: { current: true, target: true, adjust: false }
  });

  const [activeSubSection, setActiveSubSection] = useState('data');
  const [savedData, setSavedData] = useState(null);

  // ---------- Static data (unchanged) ----------
  const databases = [
    { id: 'Insurance_db', name: 'Production Insurance DB', type: 'ORACLE', status: 'Connected' },
    { id: 'policies_claims_transactions_db', name: 'Production Policies & Claims DB', type: 'ORACLE', status: 'Connected' },
    { id: 'policy_master_db', name: 'Production Policy Master DB', type: 'PostgreSQL Server', status: 'Connected' },
    { id: 'customer_profiles_db', name: 'Production Customer Profiles DB', type: 'MongoDB', status: 'Connected' },
    { id: 'warehouse_db', name: 'Production Data Warehouse', type: 'Presto', status: 'Connected' },
    { id: 'google_analytics_db', name: 'Production Web & Mobile App User Activity', type: 'Google Analytics', status: 'Connected' }
  ];

  const destinationDbs = [
    { id: 'dev_insurance_db', name: 'Development Insurance DB', type: 'ORACLE', status: 'Ready' },
    { id: 'qa_policies_claims_transactions_db', name: 'QA Policies & Claims DB', type: 'ORACLE', status: 'Ready' },
    { id: 'dev_policy_master_db', name: 'Development Policy Master DB', type: 'PostgreSQL Server', status: 'Ready' },
    { id: 'dev_customer_profiles_db', name: 'Development Customer Profiles DB', type: 'MongoDB', status: 'Ready' },
    { id: 'staging_warehouse_db', name: 'Staging Data Warehouse', type: 'Presto', status: 'Ready' },
    { id: 'qa_google_analytics_db', name: 'QA Web & Mobile App User Activity', type: 'Google Analytics', status: 'Ready' }
  ];

  const tables = [
    {
      name: 'policies',
      description: 'Insurance policy details',
      columns: 15,
      records: 50,
      primaryKey: 'policy_id',
      foreignKeys: ['policyholder_id', 'agent_id'],
      piiFields: [],
      schema: [
        { name: 'policy_id', type: 'VARCHAR(20)', constraint: 'PRIMARY KEY' },
        { name: 'policy_number', type: 'VARCHAR(50)', constraint: 'UNIQUE NOT NULL' },
        { name: 'policyholder_id', type: 'VARCHAR(20)', constraint: 'FOREIGN KEY' },
        { name: 'agent_id', type: 'VARCHAR(20)', constraint: 'FOREIGN KEY' },
        { name: 'policy_type', type: 'VARCHAR(50)', constraint: 'NOT NULL' },
        { name: 'effective_date', type: 'DATE', constraint: 'NOT NULL' },
        { name: 'expiry_date', type: 'DATE', constraint: 'NOT NULL' },
        { name: 'premium_amount', type: 'DECIMAL(12,2)', constraint: 'NOT NULL' },
        { name: 'coverage_amount', type: 'DECIMAL(12,2)', constraint: 'NOT NULL' },
        { name: 'status', type: 'VARCHAR(20)', constraint: 'NOT NULL' },
        { name: 'region', type: 'VARCHAR(50)', constraint: 'NOT NULL' },
        { name: 'created_date', type: 'TIMESTAMP', constraint: 'DEFAULT CURRENT_TIMESTAMP' },
        { name: 'modified_date', type: 'TIMESTAMP', constraint: 'DEFAULT CURRENT_TIMESTAMP' },
        { name: 'deductible', type: 'DECIMAL(10,2)', constraint: '' },
        { name: 'notes', type: 'TEXT', constraint: '' }
      ]
    },
    {
      name: 'claims',
      description: 'Insurance claim records',
      columns: 12,
      records: 50,
      primaryKey: 'claim_id',
      foreignKeys: ['policy_id', 'adjuster_id'],
      piiFields: [],
      schema: [
        { name: 'claim_id', type: 'VARCHAR(20)', constraint: 'PRIMARY KEY' },
        { name: 'claim_number', type: 'VARCHAR(50)', constraint: 'UNIQUE NOT NULL' },
        { name: 'policy_id', type: 'VARCHAR(20)', constraint: 'FOREIGN KEY' },
        { name: 'claim_date', type: 'DATE', constraint: 'NOT NULL' },
        { name: 'claim_amount', type: 'DECIMAL(12,2)', constraint: 'NOT NULL' },
        { name: 'settlement_amount', type: 'DECIMAL(12,2)', constraint: '' },
        { name: 'status', type: 'VARCHAR(30)', constraint: 'NOT NULL' },
        { name: 'adjuster_id', type: 'VARCHAR(20)', constraint: '' },
        { name: 'incident_date', type: 'DATE', constraint: 'NOT NULL' },
        { name: 'description', type: 'TEXT', constraint: '' },
        { name: 'created_date', type: 'TIMESTAMP', constraint: 'DEFAULT CURRENT_TIMESTAMP' },
        { name: 'closed_date', type: 'DATE', constraint: '' }
      ]
    },
    {
      name: 'policyholders',
      description: 'Corporate policyholders (companies)',
      columns: 18,
      records: 50,
      primaryKey: 'policyholder_id',
      foreignKeys: [],
      piiFields: ['tax_id', 'email', 'phone'],
      schema: [
        { name: 'policyholder_id', type: 'VARCHAR(20)', constraint: 'PRIMARY KEY' },
        { name: 'company_name', type: 'VARCHAR(200)', constraint: 'NOT NULL' },
        { name: 'tax_id', type: 'VARCHAR(20)', constraint: 'UNIQUE', pii: true },
        { name: 'industry_code', type: 'VARCHAR(10)', constraint: 'NOT NULL' },
        { name: 'email', type: 'VARCHAR(100)', constraint: 'NOT NULL', pii: true },
        { name: 'phone', type: 'VARCHAR(20)', constraint: 'NOT NULL', pii: true },
        { name: 'address_line1', type: 'VARCHAR(200)', constraint: 'NOT NULL' },
        { name: 'address_line2', type: 'VARCHAR(200)', constraint: '' },
        { name: 'city', type: 'VARCHAR(100)', constraint: 'NOT NULL' },
        { name: 'state', type: 'VARCHAR(50)', constraint: 'NOT NULL' },
        { name: 'zip_code', type: 'VARCHAR(10)', constraint: 'NOT NULL' },
        { name: 'country', type: 'VARCHAR(50)', constraint: 'DEFAULT USA' },
        { name: 'annual_revenue', type: 'DECIMAL(15,2)', constraint: '' },
        { name: 'employee_count', type: 'INTEGER', constraint: '' },
        { name: 'founded_year', type: 'INTEGER', constraint: '' },
        { name: 'website', type: 'VARCHAR(200)', constraint: '' },
        { name: 'created_date', type: 'TIMESTAMP', constraint: 'DEFAULT CURRENT_TIMESTAMP' },
        { name: 'credit_rating', type: 'VARCHAR(5)', constraint: '' }
      ]
    },
    {
      name: 'beneficiaries',
      description: 'Employee beneficiaries of corporate policies',
      columns: 14,
      records: 50,
      primaryKey: 'beneficiary_id',
      foreignKeys: ['policyholder_id'],
      piiFields: ['ssn', 'date_of_birth', 'email', 'phone'],
      schema: [
        { name: 'beneficiary_id', type: 'VARCHAR(20)', constraint: 'PRIMARY KEY' },
        { name: 'policyholder_id', type: 'VARCHAR(20)', constraint: 'FOREIGN KEY' },
        { name: 'first_name', type: 'VARCHAR(100)', constraint: 'NOT NULL' },
        { name: 'last_name', type: 'VARCHAR(100)', constraint: 'NOT NULL' },
        { name: 'ssn', type: 'VARCHAR(11)', constraint: 'UNIQUE', pii: true },
        { name: 'date_of_birth', type: 'DATE', constraint: 'NOT NULL', pii: true },
        { name: 'email', type: 'VARCHAR(100)', constraint: '', pii: true },
        { name: 'phone', type: 'VARCHAR(20)', constraint: '', pii: true },
        { name: 'employee_id', type: 'VARCHAR(20)', constraint: '' },
        { name: 'department', type: 'VARCHAR(100)', constraint: '' },
        { name: 'relationship', type: 'VARCHAR(50)', constraint: 'NOT NULL' },
        { name: 'coverage_percentage', type: 'DECIMAL(5,2)', constraint: 'DEFAULT 100.00' },
        { name: 'status', type: 'VARCHAR(20)', constraint: 'NOT NULL' },
        { name: 'created_date', type: 'TIMESTAMP', constraint: 'DEFAULT CURRENT_TIMESTAMP' }
      ]
    },
    {
      name: 'payments',
      description: 'Premium payments and claim settlements',
      columns: 11,
      records: 50,
      primaryKey: 'payment_id',
      foreignKeys: ['policy_id', 'claim_id'],
      piiFields: ['bank_account_last4'],
      schema: [
        { name: 'payment_id', type: 'VARCHAR(20)', constraint: 'PRIMARY KEY' },
        { name: 'policy_id', type: 'VARCHAR(20)', constraint: 'FOREIGN KEY' },
        { name: 'claim_id', type: 'VARCHAR(20)', constraint: '' },
        { name: 'payment_date', type: 'DATE', constraint: 'NOT NULL' },
        { name: 'amount', type: 'DECIMAL(12,2)', constraint: 'NOT NULL' },
        { name: 'payment_type', type: 'VARCHAR(30)', constraint: 'NOT NULL' },
        { name: 'payment_method', type: 'VARCHAR(30)', constraint: 'NOT NULL' },
        { name: 'bank_account_last4', type: 'VARCHAR(4)', constraint: '', pii: true },
        { name: 'currency', type: 'VARCHAR(3)', constraint: 'DEFAULT USD' },
        { name: 'status', type: 'VARCHAR(20)', constraint: 'NOT NULL' },
        { name: 'created_date', type: 'TIMESTAMP', constraint: 'DEFAULT CURRENT_TIMESTAMP' }
      ]
    },
    {
      name: 'training_certification',
      description: 'Agent training and certifications',
      columns: 8,
      records: 50,
      primaryKey: 'certification_id',
      foreignKeys: ['agent_id'],
      piiFields: [],
      schema: [
        { name: 'certification_id', type: 'VARCHAR(20)', constraint: 'PRIMARY KEY' },
        { name: 'agent_id', type: 'VARCHAR(20)', constraint: 'FOREIGN KEY' },
        { name: 'certification_type', type: 'VARCHAR(100)', constraint: 'NOT NULL' },
        { name: 'completion_date', type: 'DATE', constraint: 'NOT NULL' },
        { name: 'expiry_date', type: 'DATE', constraint: 'NOT NULL' },
        { name: 'region_authorized', type: 'VARCHAR(50)', constraint: 'NOT NULL' },
        { name: 'status', type: 'VARCHAR(20)', constraint: 'NOT NULL' },
        { name: 'issuing_authority', type: 'VARCHAR(200)', constraint: '' }
      ]
    },
    {
      name: 'region_regulatory_rules',
      description: 'Regional regulatory requirements',
      columns: 6,
      records: 50,
      primaryKey: 'rule_id',
      foreignKeys: [],
      piiFields: [],
      schema: [
        { name: 'rule_id', type: 'VARCHAR(20)', constraint: 'PRIMARY KEY' },
        { name: 'region', type: 'VARCHAR(50)', constraint: 'UNIQUE NOT NULL' },
        { name: 'allowed_policy_types', type: 'JSON', constraint: 'NOT NULL' },
        { name: 'min_certification_required', type: 'VARCHAR(100)', constraint: 'NOT NULL' },
        { name: 'license_renewal_period', type: 'INTEGER', constraint: 'NOT NULL' },
        { name: 'effective_date', type: 'DATE', constraint: 'NOT NULL' }
      ]
    },
    {
      name: 'agent_employee_brokers',
      description: 'Insurance agents and brokers',
      columns: 12,
      records: 50,
      primaryKey: 'agent_id',
      foreignKeys: [],
      piiFields: ['email', 'phone', 'ssn'],
      schema: [
        { name: 'agent_id', type: 'VARCHAR(20)', constraint: 'PRIMARY KEY' },
        { name: 'first_name', type: 'VARCHAR(100)', constraint: 'NOT NULL' },
        { name: 'last_name', type: 'VARCHAR(100)', constraint: 'NOT NULL' },
        { name: 'email', type: 'VARCHAR(100)', constraint: 'UNIQUE NOT NULL', pii: true },
        { name: 'phone', type: 'VARCHAR(20)', constraint: 'NOT NULL', pii: true },
        { name: 'ssn', type: 'VARCHAR(11)', constraint: 'UNIQUE', pii: true },
        { name: 'license_number', type: 'VARCHAR(50)', constraint: 'UNIQUE NOT NULL' },
        { name: 'license_expiry', type: 'DATE', constraint: 'NOT NULL' },
        { name: 'agent_type', type: 'VARCHAR(30)', constraint: 'NOT NULL' },
        { name: 'commission_rate', type: 'DECIMAL(5,2)', constraint: '' },
        { name: 'status', type: 'VARCHAR(20)', constraint: 'NOT NULL' },
        { name: 'created_date', type: 'TIMESTAMP', constraint: 'DEFAULT CURRENT_TIMESTAMP' }
      ]
    }
  ];

  // ----- UPDATED STEPS (with Business Rules inserted) -----
  const steps = [
    { number: 1, label: 'Source & Destination' },
    { number: 2, label: 'Detected Schema' },
    { number: 3, label: 'Data Generation Controls' },
    { number: 4, label: 'Generated Data Preview' },
    { number: 5, label: 'Configure Errors & View Data' },
    { number: 6, label: 'Business Rules & Validation' },   // <-- NEW
    { number: 7, label: 'Destination Preview & Save' }     // was 6
  ];
  // -------------------------------------------------------

  // ---------- Event handlers (existing, unchanged) ----------
  const handleDatabaseSelection = (dbId, isSource = true) => {
    if (isSource) {
      setSelectedSource(dbId);
      setTimeout(() => {
        setDetectedTables(tables);
        const config = {};
        const maskingMode = {};
        tables.forEach(table => {
          config[table.name] = true;
          maskingMode[table.name] = table.piiFields.length > 0 ? 'masked' : 'none';
        });
        setTableGenerationConfig(config);
        setPiiMaskingMode(maskingMode);
      }, 500);
    } else {
      setSelectedDestination(dbId);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {  // <-- updated to use steps.length
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // ----- Global error change (Dataset Defaults) -----
  const handleErrorChange = (errorType, value) => {
    setErrorConfig(prev => ({
      ...prev,
      [errorType]: parseInt(value) || 0
    }));
  };

  // ----- Per-table error change (granular thresholds) -----
  const handlePerTableErrorChange = (tableName, errorType, value) => {
    setPerTableErrorOverrides(prev => {
      const tableOverrides = prev[tableName] ? { ...prev[tableName] } : {};
      tableOverrides[errorType] = parseInt(value) || 0;
      return { ...prev, [tableName]: tableOverrides };
    });
  };

  const handleClearTableOverrides = (tableName) => {
    setPerTableErrorOverrides(prev => {
      const newState = { ...prev };
      delete newState[tableName];
      return newState;
    });
  };

  // ----- Get effective error config for a specific table (global + overrides) -----
  const getEffectiveErrorConfig = (tableName) => {
    const global = { ...errorConfig };
    const overrides = perTableErrorOverrides[tableName];
    if (!overrides) return global;
    return { ...global, ...overrides };
  };

  // ----- Business Rules handlers -----
  const handleAddBusinessRule = (rule) => {
    setBusinessRules(prev => [...prev, { id: Date.now().toString(), ...rule }]);
  };

  const handleUpdateBusinessRule = (ruleId, updatedRule) => {
    setBusinessRules(prev => prev.map(r => r.id === ruleId ? { ...r, ...updatedRule } : r));
  };

  const handleDeleteBusinessRule = (ruleId) => {
    setBusinessRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const handleToggleRule = (ruleId) => {
    setBusinessRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
  };
  // --------------------------------

  // ----- NEW: Custom Errors handlers -----
  const handleAddCustomError = (error) => {
    setCustomErrors(prev => [...prev, { ...error, id: Date.now().toString() }]);
  };

  const handleUpdateCustomError = (id, updatedError) => {
    setCustomErrors(prev => prev.map(err => err.id === id ? { ...err, ...updatedError } : err));
  };

  const handleDeleteCustomError = (id) => {
    setCustomErrors(prev => prev.filter(err => err.id !== id));
  };

  const handleToggleCustomError = (id) => {
    setCustomErrors(prev => prev.map(err => 
      err.id === id ? { ...err, enabled: !err.enabled } : err
    ));
  };

  const handleCustomErrorPercentageChange = (id, percentage) => {
    setCustomErrors(prev => prev.map(err => 
      err.id === id ? { ...err, percentage } : err
    ));
  };
  // -------------------------------------

  // ----- getAffectedTables (unchanged, works with global config) -----
  const getAffectedTables = (errorType) => {
    const errorTableMap = {
      missingPolicyDates: ['policies'],
      incompleteBeneficiary: ['beneficiaries'],
      missingClaimAdjuster: ['claims'],
      nullPremium: ['policies'],
      missingClientId: ['policies'],
      endBeforeStart: ['policies'],
      claimExceedsCoverage: ['claims'],
      paymentBeforeClaim: ['payments'],
      invalidStatusTransitions: ['policies', 'claims'],
      duplicatePolicyNumbers: ['policies'],
      incorrectJurisdiction: ['policies'],
      inconsistentDateFormats: ['policies', 'claims', 'payments'],
      invalidEmailFormats: ['policyholders', 'beneficiaries', 'agent_employee_brokers'],
      malformedPhoneNumbers: ['policyholders', 'beneficiaries', 'agent_employee_brokers'],
      overlappingPolicyPeriods: ['policies'],
      claimBeforePolicyStart: ['claims'],
      paymentExceedsClaim: ['payments'],
      zeroPremiumPolicies: ['policies'],
      claimExceedsCoverageLimit: ['claims'],
      ageUnder18: ['beneficiaries'],
      claimExceedsPremiumPaid: ['claims'],
      orphanedClaims: ['claims'],
      paymentsWithoutClaims: ['payments'],
      claimsWithoutPolicyId: ['claims'],
      policyWithoutClient: ['policies'],
      policyWithoutAgent: ['policies']
    };
    return errorTableMap[errorType] || [];
  };

  // ----- getAffectedRecords (uses global config, kept for compatibility) -----
  const getAffectedRecords = (errorType) => {
    const affectedTables = getAffectedTables(errorType);
    if (affectedTables.length === 0) return 0;
    const percentage = errorConfig[errorType] || 0;
    return affectedTables.reduce((acc, tableName) => {
      const table = tables.find(t => t.name === tableName);
      if (table) {
        const exactCount = (table.records * percentage) / 100;
        return acc + (exactCount >= 1 ? Math.round(exactCount) : 0);
      }
      return acc;
    }, 0);
  };

  // ----- PII override helpers (unchanged) -----
  const getEffectivePiiFields = (tableName) => {
    const table = tables.find(t => t.name === tableName);
    if (!table) return [];
    const staticPii = table.schema.filter(col => col.pii).map(col => col.name);
    const overriddenPii = Object.keys(piiOverrides)
      .filter(key => key.startsWith(`${tableName}.`) && piiOverrides[key] === true)
      .map(key => key.split('.')[1]);
    const removedPii = Object.keys(piiOverrides)
      .filter(key => key.startsWith(`${tableName}.`) && piiOverrides[key] === false)
      .map(key => key.split('.')[1]);
    return [...new Set([...staticPii, ...overriddenPii])].filter(col => !removedPii.includes(col));
  };

  const handleOpenPiiModal = (tableName) => {
    setModalTableName(tableName);
    setShowPiiOverrideModal(true);
  };

  const handleClosePiiModal = () => {
    setShowPiiOverrideModal(false);
    setModalTableName('');
  };

  const handlePiiOverrideToggle = (tableName, columnName, value) => {
    const key = `${tableName}.${columnName}`;
    setPiiOverrides(prev => {
      if (value === null) {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      } else {
        return { ...prev, [key]: value };
      }
    });
  };

  // ----- MODIFIED: getCurrentTableData now passes effective error config + business rules + custom errors -----
  const getCurrentTableData = (tableName, includeErrors = false, raw = false) => {
    const table = tables.find(t => t.name === tableName);
    if (!table) return null;
    const config = includeErrors ? getEffectiveErrorConfig(tableName) : {};
    // If raw is true, do NOT apply any PII masking
    const effectivePiiFields = raw ? [] : getEffectivePiiFields(tableName);
    const tableRules = businessRules.filter(r => r.tableName === tableName && r.enabled);
    // Only apply custom errors if includeErrors is true
    const tableCustomErrors = includeErrors ? customErrors.filter(c => c.tableName === tableName && c.enabled) : [];
    return generateSampleData(
      tableName,
      table.records,
      config,
      effectivePiiFields,
      tableRules,
      tableCustomErrors
    );
  };
  // ---------------------------------------------------------------------------------------

  // ---------- Render step indicator ----------
  const renderStepIndicator = () => (
    <div className="step-indicator-container">
      <div className="step-indicator">
        {steps.map((step, idx) => (
          <React.Fragment key={step.number}>
            <div className={`step-item ${currentStep >= step.number ? 'active' : ''} ${currentStep === step.number ? 'current' : ''}`}>
              <div className="step-circle">{step.number}</div>
              <div className="step-label">{step.label}</div>
            </div>
            {idx < steps.length - 1 && <div className="step-line" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // ---------- Render current step ----------
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1DatabaseSelection 
          databases={databases}
          destinationDbs={destinationDbs}
          selectedSource={selectedSource}
          selectedDestination={selectedDestination}
          onSelectSource={(id) => handleDatabaseSelection(id, true)}
          onSelectDestination={(id) => handleDatabaseSelection(id, false)}
          onNext={handleNextStep}
          canProceed={selectedSource && selectedDestination}
        />;
      
      case 2:
        return <Step2DetectedSchema 
          tables={detectedTables}
          onNext={handleNextStep}
          onPrevious={handlePreviousStep}
        />;
      
      case 3:
        return <Step3DataGenerationControls 
          tables={detectedTables}
          tableGenerationConfig={tableGenerationConfig}
          piiMaskingMode={piiMaskingMode}
          onTableConfigChange={setTableGenerationConfig}
          onPiiModeChange={setPiiMaskingMode}
          onNext={handleNextStep}
          onPrevious={handlePreviousStep}
        />;
      
      case 4:
        return (
          <>
            {selectedTable && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleOpenPiiModal(selectedTable)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Edit size={16} />
                  Edit PII Overrides for {selectedTable}
                </button>
              </div>
            )}
            <Step4GeneratedDataPreview 
              tables={detectedTables}
              selectedTable={selectedTable}
              onSelectTable={setSelectedTable}
              tableGenerationConfig={tableGenerationConfig}
              piiMaskingMode={piiMaskingMode}
              getCurrentTableData={getCurrentTableData}
              activeSubSection={activeSubSection}
              onSubSectionChange={setActiveSubSection}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            />
            {showPiiOverrideModal && modalTableName && (
              <PIIOverrideModal
                table={tables.find(t => t.name === modalTableName)}
                piiOverrides={piiOverrides}
                onToggle={handlePiiOverrideToggle}
                onClose={handleClosePiiModal}
              />
            )}
          </>
        );
      
      case 5:
        return (
          <Step5ConfigureErrors 
            // Global error config & handler
            errorConfig={errorConfig}
            onErrorChange={handleErrorChange}
            // Per-table overrides & handlers
            perTableErrorOverrides={perTableErrorOverrides}
            onPerTableErrorChange={handlePerTableErrorChange}
            onClearTableOverrides={handleClearTableOverrides}
            // Existing props
            behaviorRules={behaviorRules}
            onBehaviorChange={setBehaviorRules}
            getAffectedTables={getAffectedTables}
            getAffectedRecords={getAffectedRecords}
            tables={detectedTables}
            getCurrentTableData={getCurrentTableData}
            // NEW: custom errors props
            customErrors={customErrors}
            onAddCustomError={handleAddCustomError}
            onUpdateCustomError={handleUpdateCustomError}
            onDeleteCustomError={handleDeleteCustomError}
            onToggleCustomError={handleToggleCustomError}
            onCustomErrorPercentageChange={handleCustomErrorPercentageChange}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      
      case 6:   // <-- Business Rules step
        return (
          <Step5BusinessRules
            tables={detectedTables}
            businessRules={businessRules}
            onAddRule={handleAddBusinessRule}
            onUpdateRule={handleUpdateBusinessRule}
            onDeleteRule={handleDeleteBusinessRule}
            onToggleRule={handleToggleRule}
            getCurrentTableData={getCurrentTableData} // for rule testing
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      
      case 7:   // was 6
        return <Step6DestinationPreview 
          tables={detectedTables}
          selectedTable={selectedTable}
          onSelectTable={setSelectedTable}
          getCurrentTableData={getCurrentTableData}
          errorConfig={errorConfig}
          getAffectedRecords={getAffectedRecords}
          selectedSource={selectedSource}
          selectedDestination={selectedDestination}
          databases={databases}
          destinationDbs={destinationDbs}
          onSave={() => {
            setSavedData({
              source: selectedSource,
              destination: selectedDestination,
              timestamp: new Date().toISOString()
            });
            alert('Data successfully saved to destination database!');
          }}
          savedData={savedData}
          onPrevious={handlePreviousStep}
        />;
      
      default:
        return null;
    }
  };

  return (
    <div className="synthetic-data-dashboard">
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          Synthetic Data Generator
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          Corporate Insurance Data Generation with PII Masking & Error Configuration
        </p>
      </div>
      {renderStepIndicator()}
      {renderCurrentStep()}
    </div>
  );
};

// ----- PII Override Modal (unchanged) -----
const PIIOverrideModal = ({ table, piiOverrides, onToggle, onClose }) => {
  if (!table) return null;
  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        background: 'white',
        borderRadius: '8px',
        width: '800px',
        maxWidth: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Edit PII Fields – {table.name}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Manually mark columns as PII. Overrides will be applied during data generation.
        </p>
        <table className="data-table" style={{ fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Data Type</th>
              <th>Auto‑detected PII</th>
              <th>Override</th>
            </tr>
          </thead>
          <tbody>
            {table.schema.map(col => {
              const autoPii = col.pii || false;
              const overrideKey = `${table.name}.${col.name}`;
              const overrideValue = piiOverrides.hasOwnProperty(overrideKey) 
                ? piiOverrides[overrideKey] 
                : null;
              return (
                <tr key={col.name}>
                  <td><strong>{col.name}</strong></td>
                  <td>{col.type}</td>
                  <td>
                    {autoPii ? (
                      <span className="badge badge-purple">PII</span>
                    ) : (
                      <span className="badge badge-secondary">-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="radio"
                          name={`pii-override-${col.name}`}
                          checked={overrideValue === true}
                          onChange={() => onToggle(table.name, col.name, true)}
                        />
                        <span style={{ fontSize: '12px' }}>Yes</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="radio"
                          name={`pii-override-${col.name}`}
                          checked={overrideValue === false}
                          onChange={() => onToggle(table.name, col.name, false)}
                        />
                        <span style={{ fontSize: '12px' }}>No</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="radio"
                          name={`pii-override-${col.name}`}
                          checked={overrideValue === null}
                          onChange={() => onToggle(table.name, col.name, null)}
                        />
                        <span style={{ fontSize: '12px' }}>Auto</span>
                      </label>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

// ----- Step 1: Database Selection (unchanged) -----
const Step1DatabaseSelection = ({ databases, destinationDbs, selectedSource, selectedDestination, onSelectSource, onSelectDestination, onNext, canProceed }) => (
  <div className="step-container">
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Source & Destination Database Selection</h2>
          <p className="card-subtitle">Select source (Production) and destination (Dev/QA/Staging) databases</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>Source Database (Production)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {databases.map(db => (
              <div key={db.id} onClick={() => onSelectSource(db.id)} className={`database-card ${selectedSource === db.id ? 'selected' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Database size={24} color={selectedSource === db.id ? 'var(--primary-color)' : 'var(--text-secondary)'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{db.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{db.type}</div>
                  </div>
                  <span className="badge badge-success">{db.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>Destination Database (Dev/QA/Staging)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {destinationDbs.map(db => (
              <div key={db.id} onClick={() => onSelectDestination(db.id)} className={`database-card ${selectedDestination === db.id ? 'selected' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Database size={24} color={selectedDestination === db.id ? 'var(--primary-color)' : 'var(--text-secondary)'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{db.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{db.type}</div>
                  </div>
                  <span className="badge badge-info">{db.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="step-actions">
        <div></div>
        <button className="btn btn-primary" onClick={onNext} disabled={!canProceed}>Next: Detect Schema →</button>
      </div>
    </div>
  </div>
);

// ----- Step 2: Detected Schema and Relationships (unchanged) -----
const Step2DetectedSchema = ({ tables, onNext, onPrevious }) => {
  const [expandedTable, setExpandedTable] = useState(null);
  return (
    <div className="step-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Detected Schema & Relationships</h2>
            <p className="card-subtitle">Corporate Insurance Domain - {tables.length} tables detected</p>
          </div>
        </div>
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <div>
            <strong>Schema Detection Complete!</strong> Found {tables.length} tables with full relationships, 
            constraints, and PII fields identified.
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{tables.length}</div><div className="stat-label">Tables Detected</div></div>
          <div className="stat-card"><div className="stat-value">{tables.reduce((acc, t) => acc + t.columns, 0)}</div><div className="stat-label">Total Columns</div></div>
          <div className="stat-card"><div className="stat-value">{tables.reduce((acc, t) => acc + (t.foreignKeys?.length || 0), 0)}</div><div className="stat-label">Foreign Keys</div></div>
          <div className="stat-card"><div className="stat-value">{tables.filter(t => t.piiFields && t.piiFields.length > 0).reduce((acc, t) => acc + t.piiFields.length, 0)}</div><div className="stat-label">PII Fields</div></div>
        </div>
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>Detected Tables</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {tables.map(table => (
              <TableSchemaCard key={table.name} table={table} expanded={expandedTable === table.name} onToggle={() => setExpandedTable(expandedTable === table.name ? null : table.name)} />
            ))}
          </div>
        </div>
      </div>
      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onPrevious}>← Previous</button>
        <button className="btn btn-primary" onClick={onNext}>Next: Configure Data Generation →</button>
      </div>
    </div>
  );
};

const TableSchemaCard = ({ table, expanded, onToggle }) => (
  <div className="table-schema-card">
    <div className="table-schema-header" onClick={onToggle}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>{table.name}</span>
          {table.piiFields && table.piiFields.length > 0 && <span className="badge badge-purple">{table.piiFields.length} PII Fields</span>}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {table.description} • {table.columns} columns • PK: {table.primaryKey}
          {table.foreignKeys.length > 0 && ` • FK: ${table.foreignKeys.join(', ')}`}
        </div>
      </div>
      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Schema
      </button>
    </div>
    {expanded && (
      <div className="table-schema-body">
        <table className="data-table" style={{ fontSize: '11px' }}>
          <thead><tr><th>Column Name</th><th>Data Type</th><th>Constraint</th></tr></thead>
          <tbody>
            {table.schema.map(col => (
              <tr key={col.name}>
                <td>{col.name}{col.pii && <span className="badge badge-purple" style={{ marginLeft: '8px' }}>PII</span>}</td>
                <td>{col.type}</td>
                <td>{col.constraint || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default SyntheticDataDashboard;