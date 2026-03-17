import React, { useState } from 'react';
import {
  Database, ChevronDown, ChevronUp, Save, RotateCcw, Download,
  AlertCircle, CheckCircle, Info, Eye, Shield, Link as LinkIcon,
  Edit, X, Upload
} from 'lucide-react';
import { generateSampleData, maskPII } from '../utils/dataGenerator';
import { Step3DataGenerationControls, Step4GeneratedDataPreview } from './StepComponents';
import { Step5ConfigureErrors, Step6DestinationPreview } from './Step5and6';
import { getPredefinedSchema } from '../predefinedSchemas'; // you need to create this file

const SyntheticDataDashboard = () => {
  // ----- Existing state (database mode) -----
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [detectedTables, setDetectedTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableGenerationConfig, setTableGenerationConfig] = useState({});
  const [piiMaskingMode, setPiiMaskingMode] = useState({});
  const [piiOverrides, setPiiOverrides] = useState({});
  const [showPiiOverrideModal, setShowPiiOverrideModal] = useState(false);
  const [modalTableName, setModalTableName] = useState('');
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
  const [businessRules, setBusinessRules] = useState([]);
  const [customErrors, setCustomErrors] = useState([]);
  const [behaviorRules, setBehaviorRules] = useState({
    claimRate: { current: 23.4, target: { min: 10, max: 30 }, adjust: false },
    premiumSkewed: { current: true, target: true, adjust: false },
    seasonalRenewals: { current: true, target: true, adjust: false }
  });
  const [activeSubSection, setActiveSubSection] = useState('data');
  const [savedData, setSavedData] = useState(null);

  // ----- New state for synthetic mode -----
  const [mode, setMode] = useState('database'); // 'database' or 'synthetic'
  const [syntheticVertical, setSyntheticVertical] = useState('');
  const [syntheticBU, setSyntheticBU] = useState('');
  const [syntheticRowCount, setSyntheticRowCount] = useState(50000);
  const [syntheticUploadedFile, setSyntheticUploadedFile] = useState(null);
  const [syntheticSchema, setSyntheticSchema] = useState([]); // loaded schema (tables)

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

  const tables = [ /* ... your existing hardcoded tables array ... */ ]; // unchanged, omitted for brevity

  const steps = [
    { number: 1, label: 'Source & Destination' },
    { number: 2, label: 'Detected Schema' },
    { number: 3, label: 'Data Generation Controls' },
    { number: 4, label: 'Generated Data Preview' },
    { number: 5, label: 'Configure Errors & Validation' },
    { number: 6, label: 'Destination Preview & Save' }
  ];

  // ---------- Existing event handlers (database mode) ----------
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
    if (currentStep < steps.length) {
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
    setErrorConfig(prev => ({ ...prev, [errorType]: parseInt(value) || 0 }));
  };

  // ----- Get effective error config for a specific table -----
  const getEffectiveErrorConfig = (tableName) => ({ ...errorConfig });

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
    setBusinessRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  // ----- Custom Errors handlers -----
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
    setCustomErrors(prev => prev.map(err => err.id === id ? { ...err, enabled: !err.enabled } : err));
  };
  const handleCustomErrorPercentageChange = (id, percentage) => {
    setCustomErrors(prev => prev.map(err => err.id === id ? { ...err, percentage } : err));
  };
  const handleResetAllErrors = (skipConfirm = false) => {
    setErrorConfig(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}));
    setCustomErrors([]);
    setBusinessRules([]);
  };

  // ----- getAffectedTables (unchanged) -----
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

  // ----- getAffectedRecords (uses global config) -----
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
    if (modalTableName) {
      const effectivePii = getEffectivePiiFields(modalTableName);
      if (effectivePii.length > 0 && (!piiMaskingMode[modalTableName] || piiMaskingMode[modalTableName] === 'none')) {
        setPiiMaskingMode(prev => ({ ...prev, [modalTableName]: 'masked' }));
      }
      if (effectivePii.length === 0 && piiMaskingMode[modalTableName] && piiMaskingMode[modalTableName] !== 'none') {
        setPiiMaskingMode(prev => ({ ...prev, [modalTableName]: 'none' }));
      }
    }
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

  // ----- Helper: get priority columns -----
  const getPriorityColumns = (tableName) => {
    const piiFields = getEffectivePiiFields(tableName);
    const customErrorCols = customErrors
      .filter(err => err.tableName === tableName && err.enabled)
      .flatMap(err => {
        if (err.queryType === 'sql' && err.sqlQuery) {
          try {
            const match = err.sqlQuery.replace(/;\s*$/, '').trim()
              .match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/i);
            return match ? [match[1]] : [];
          } catch (e) { return []; }
        }
        return err.column ? [err.column] : [];
      });
    const validationRuleCols = businessRules
      .filter(r => r.tableName === tableName && r.enabled)
      .map(r => r.column);
    const builtinErrorColumnMap = {
      missingPolicyDates: { tables: ['policies'], columns: ['effective_date'] },
      incompleteBeneficiary: { tables: ['beneficiaries'], columns: ['email', 'phone'] },
      missingClaimAdjuster: { tables: ['claims'], columns: ['adjuster_id'] },
      missingClientId: { tables: ['policies'], columns: ['policyholder_id'] },
      endBeforeStart: { tables: ['policies'], columns: ['effective_date', 'expiry_date'] },
      claimExceedsCoverage: { tables: ['claims'], columns: ['claim_amount'] },
      paymentBeforeClaim: { tables: ['payments'], columns: ['payment_date'] },
      invalidStatusTransitions: { tables: ['policies', 'claims'], columns: ['status'] },
      duplicatePolicyNumbers: { tables: ['policies'], columns: ['policy_number'] },
      incorrectJurisdiction: { tables: ['policies'], columns: ['region'] },
      inconsistentDateFormats: { tables: ['policies', 'claims', 'payments'], columns: ['effective_date', 'claim_date', 'payment_date'] },
      invalidEmailFormats: { tables: ['policyholders', 'beneficiaries', 'agent_employee_brokers'], columns: ['email'] },
      malformedPhoneNumbers: { tables: ['policyholders', 'beneficiaries', 'agent_employee_brokers'], columns: ['phone'] },
      overlappingPolicyPeriods: { tables: ['policies'], columns: ['effective_date', 'expiry_date'] },
      claimBeforePolicyStart: { tables: ['claims'], columns: ['claim_date'] },
      paymentExceedsClaim: { tables: ['payments'], columns: ['amount'] },
      zeroPremiumPolicies: { tables: ['policies'], columns: ['premium_amount'] },
      claimExceedsCoverageLimit: { tables: ['claims'], columns: ['claim_amount'] },
      ageUnder18: { tables: ['beneficiaries'], columns: ['date_of_birth'] },
      claimExceedsPremiumPaid: { tables: ['claims'], columns: ['claim_amount'] },
      orphanedClaims: { tables: ['claims'], columns: ['policy_id'] },
      paymentsWithoutClaims: { tables: ['payments'], columns: ['claim_id'] },
      policyWithoutClient: { tables: ['policies'], columns: ['policyholder_id'] },
      policyWithoutAgent: { tables: ['policies'], columns: ['agent_id'] }
    };
    const builtinCols = [];
    Object.entries(errorConfig).forEach(([key, pct]) => {
      if (pct > 0 && builtinErrorColumnMap[key] && builtinErrorColumnMap[key].tables.includes(tableName)) {
        builtinCols.push(...builtinErrorColumnMap[key].columns);
      }
    });
    return [...new Set([...piiFields, ...customErrorCols, ...validationRuleCols, ...builtinCols])];
  };

  // ----- MODIFIED: getCurrentTableData now handles both modes -----
  const getCurrentTableData = (tableName, includeErrors = false, raw = false) => {
    if (mode === 'database') {
      // Original logic using hardcoded tables and old generateSampleData
      const table = tables.find(t => t.name === tableName);
      if (!table) return null;
      try {
        const config = includeErrors ? getEffectiveErrorConfig(tableName) : {};
        const effectivePiiFields = raw ? [] : getEffectivePiiFields(tableName);
        const tableRules = businessRules.filter(r => r.tableName === tableName && r.enabled);
        const tableCustomErrors = includeErrors ? customErrors.filter(c => c.tableName === tableName && c.enabled) : [];
        return generateSampleData(
          tableName,
          table.records,
          config,
          effectivePiiFields,
          tableRules,
          tableCustomErrors
        );
      } catch (e) {
        console.error('Error generating table data for', tableName, ':', e);
        return [];
      }
    } else {
      // Synthetic mode – use the loaded schema
      // TODO: Replace with actual synthetic data generator that uses syntheticSchema and syntheticRowCount
      console.warn('Synthetic data generation not yet implemented');
      return [];
    }
  };

  // ----- New synthetic mode handlers -----
  const loadSyntheticSchema = async () => {
    let loadedSchema = [];

    if (syntheticVertical && syntheticBU) {
      // Load pre‑defined schema
      loadedSchema = getPredefinedSchema(syntheticVertical, syntheticBU);
    } else if (syntheticUploadedFile) {
      // In a real implementation, you would upload the file to your backend
      // and receive a parsed schema. For now, we simulate a placeholder.
      // Replace this with actual API call.
      loadedSchema = [
        {
          name: 'uploaded_table',
          description: 'Table from uploaded file',
          columns: 3,
          primaryKey: 'id',
          foreignKeys: [],
          schema: [
            { name: 'id', type: 'INTEGER', constraint: 'PRIMARY KEY' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'value', type: 'DECIMAL' }
          ]
        }
      ];
      // After parsing, you would call your LLM analysis endpoint
      // to enrich the schema with faker providers and PII flags.
    }

    setSyntheticSchema(loadedSchema);
    setCurrentStep(2); // proceed to Step 2
  };

  const handleSyntheticNext = () => {
    loadSyntheticSchema();
  };

  // ---------- Render step indicator (unchanged) ----------
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

  // ---------- Render current step (modified for mode toggle) ----------
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (mode === 'database') {
          return (
            <Step1DatabaseSelection
              databases={databases}
              destinationDbs={destinationDbs}
              selectedSource={selectedSource}
              selectedDestination={selectedDestination}
              onSelectSource={(id) => handleDatabaseSelection(id, true)}
              onSelectDestination={(id) => handleDatabaseSelection(id, false)}
              onNext={handleNextStep}
              canProceed={selectedSource && selectedDestination}
            />
          );
        } else {
          return (
            <Step1SyntheticInput
              vertical={syntheticVertical}
              bu={syntheticBU}
              rowCount={syntheticRowCount}
              uploadedFile={syntheticUploadedFile}
              onVerticalChange={setSyntheticVertical}
              onBUChange={setSyntheticBU}
              onRowCountChange={setSyntheticRowCount}
              onFileUpload={setSyntheticUploadedFile}
              onNext={handleSyntheticNext}
              canProceed={(syntheticVertical && syntheticBU) || syntheticUploadedFile}
            />
          );
        }

      case 2:
        return (
          <Step2DetectedSchema
            tables={mode === 'database' ? detectedTables : syntheticSchema}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            mode={mode}
            onSchemaChange={setSyntheticSchema} // allow updates in synthetic mode
          />
        );

      case 3:
        return (
          <>
            <Step3DataGenerationControls
              tables={mode === 'database' ? detectedTables : syntheticSchema}
              tableGenerationConfig={tableGenerationConfig}
              piiMaskingMode={piiMaskingMode}
              onTableConfigChange={setTableGenerationConfig}
              onPiiModeChange={setPiiMaskingMode}
              onOpenPiiModal={handleOpenPiiModal}
              getEffectivePiiFields={getEffectivePiiFields}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            />
            {showPiiOverrideModal && modalTableName && (
              <PIIOverrideModal
                table={(mode === 'database' ? tables : syntheticSchema).find(t => t.name === modalTableName)}
                piiOverrides={piiOverrides}
                onCommit={(draftOverrides) => {
                  setPiiOverrides(prev => {
                    const cleaned = Object.fromEntries(
                      Object.entries(prev).filter(([key]) => !key.startsWith(`${modalTableName}.`))
                    );
                    return { ...cleaned, ...draftOverrides };
                  });
                  handleClosePiiModal();
                }}
                onClose={() => {
                  setShowPiiOverrideModal(false);
                  setModalTableName('');
                }}
              />
            )}
          </>
        );

      case 4:
        return (
          <Step4GeneratedDataPreview
            tables={mode === 'database' ? detectedTables : syntheticSchema}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
            tableGenerationConfig={tableGenerationConfig}
            piiMaskingMode={piiMaskingMode}
            getCurrentTableData={getCurrentTableData}
            getEffectivePiiFields={getEffectivePiiFields}
            activeSubSection={activeSubSection}
            onSubSectionChange={setActiveSubSection}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );

      case 5:
        return (
          <Step5ConfigureErrors
            errorConfig={errorConfig}
            onErrorChange={handleErrorChange}
            behaviorRules={behaviorRules}
            onBehaviorChange={setBehaviorRules}
            getAffectedTables={getAffectedTables}
            getAffectedRecords={getAffectedRecords}
            tables={mode === 'database' ? detectedTables : syntheticSchema}
            getCurrentTableData={getCurrentTableData}
            getPriorityColumns={getPriorityColumns}
            getEffectivePiiFields={getEffectivePiiFields}
            customErrors={customErrors}
            onAddCustomError={handleAddCustomError}
            onUpdateCustomError={handleUpdateCustomError}
            onDeleteCustomError={handleDeleteCustomError}
            onToggleCustomError={handleToggleCustomError}
            onCustomErrorPercentageChange={handleCustomErrorPercentageChange}
            onResetAllErrors={handleResetAllErrors}
            businessRules={businessRules}
            onAddRule={handleAddBusinessRule}
            onUpdateRule={handleUpdateBusinessRule}
            onDeleteRule={handleDeleteBusinessRule}
            onToggleRule={handleToggleRule}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );

      case 6:
        return (
          <Step6DestinationPreview
            tables={mode === 'database' ? detectedTables : syntheticSchema}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
            getCurrentTableData={getCurrentTableData}
            getPriorityColumns={getPriorityColumns}
            getEffectivePiiFields={getEffectivePiiFields}
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
            businessRules={businessRules}
            customErrors={customErrors}
          />
        );

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
          {mode === 'database'
            ? 'Corporate Insurance Data Generation with PII Masking & Error Configuration'
            : 'Generate synthetic data from pre‑defined schemas or your own upload'}
        </p>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <div style={{ display: 'inline-flex', background: '#f0f0f0', borderRadius: '30px', padding: '4px' }}>
            <button
              className={`mode-toggle-btn ${mode === 'database' ? 'active' : ''}`}
              onClick={() => setMode('database')}
              style={{
                padding: '8px 24px',
                borderRadius: '30px',
                border: 'none',
                background: mode === 'database' ? '#667eea' : 'transparent',
                color: mode === 'database' ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              Connect to Databases
            </button>
            <button
              className={`mode-toggle-btn ${mode === 'synthetic' ? 'active' : ''}`}
              onClick={() => setMode('synthetic')}
              style={{
                padding: '8px 24px',
                borderRadius: '30px',
                border: 'none',
                background: mode === 'synthetic' ? '#667eea' : 'transparent',
                color: mode === 'synthetic' ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              Generate Synthetic Data
            </button>
          </div>
        </div>
      </div>

      {renderStepIndicator()}
      {renderCurrentStep()}
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
        <button className="btn btn-primary" onClick={onNext} disabled={!canProceed}>Next: Suggest Schema →</button>
      </div>
    </div>
  </div>
);

// ----- NEW Step 1: Synthetic Input -----
const Step1SyntheticInput = ({
  vertical, bu, rowCount, uploadedFile,
  onVerticalChange, onBUChange, onRowCountChange, onFileUpload, onNext, canProceed
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onFileUpload(file);
  };

  return (
    <div className="step-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Synthetic Data Generator</h2>
            <p className="card-subtitle">Define the schema for your synthetic data</p>
          </div>
        </div>

        {/* Option A: Pre‑defined Vertical + BU */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>
            Option A: Select Vertical & Business Unit
          </h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              value={vertical}
              onChange={(e) => onVerticalChange(e.target.value)}
              style={{ minWidth: '200px' }}
            >
              <option value="">-- Select Vertical --</option>
              <option value="Insurance">Insurance</option>
              <option value="Retail">Retail</option>
            </select>

            <select
              className="form-select"
              value={bu}
              onChange={(e) => onBUChange(e.target.value)}
              style={{ minWidth: '200px' }}
              disabled={!vertical}
            >
              <option value="">-- Select Business Unit --</option>
              {vertical === 'Insurance' && <option value="HR">HR</option>}
              {vertical === 'Retail' && <option value="Sales">Sales</option>}
            </select>

            {vertical && bu && (
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', alignSelf: 'center' }}>
                ✓ Pre‑defined schema will be loaded (editable later)
              </div>
            )}
          </div>
        </div>

        {/* Option B: Upload Schema */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>
            Option B: Upload Schema File
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="file"
              accept=".json,.csv,.sql"
              onChange={handleFileChange}
              className="file-input"
            />
            {uploadedFile && (
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                File selected: {uploadedFile.name}
              </div>
            )}
          </div>
        </div>

        {/* Row Count (common) */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>
            Total Rows to Generate
          </h3>
          <input
            type="number"
            min="1"
            max="50000"
            value={rowCount}
            onChange={(e) => onRowCountChange(parseInt(e.target.value) || 50000)}
            className="form-input"
            style={{ width: '200px' }}
          />
          <span style={{ marginLeft: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            (max 50,000 for pilot)
          </span>
        </div>

        <div className="step-actions">
          <div></div>
          <button className="btn btn-primary" onClick={onNext} disabled={!canProceed}>
            Next: Configure Schema →
          </button>
        </div>
      </div>
    </div>
  );
};

// ----- Step 2: Detected Schema (modified to allow editing in synthetic mode) -----
const Step2DetectedSchema = ({ tables, onNext, onPrevious, mode, onSchemaChange }) => {
  const [expandedTable, setExpandedTable] = useState(null);
  const [editingTable, setEditingTable] = useState(null); // table being edited

  const handleEditTable = (table) => {
    setEditingTable(table);
  };

  const handleSaveTable = (updatedTable) => {
    // Update the schema
    const newSchema = tables.map(t => t.name === updatedTable.name ? updatedTable : t);
    onSchemaChange(newSchema);
    setEditingTable(null);
  };

  const handleCloseEdit = () => {
    setEditingTable(null);
  };

  return (
    <div className="step-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Detected Schema & Relationships</h2>
            <p className="card-subtitle">
              {mode === 'database'
                ? `Corporate Insurance Domain - ${tables.length} tables detected`
                : `Synthetic Schema - ${tables.length} tables loaded`}
            </p>
          </div>
        </div>

        {mode === 'database' && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <div>
              <strong>Schema Detection Complete!</strong> Found {tables.length} tables with full relationships,
              constraints, and PII fields identified.
              {tables.filter(t => t.piiFields && t.piiFields.length > 0).length > 0 && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  PII fields (marked with purple badges below) will be automatically masked. You can customize which fields are treated as PII in <strong>Step 3: Data Generation Controls</strong>.
                </div>
              )}
            </div>
          </div>
        )}

        {mode === 'synthetic' && (
          <div className="alert alert-info">
            <Info size={20} />
            <div>
              <strong>Schema Loaded.</strong> You can edit the tables and columns below. Click the edit icon to modify a table.
            </div>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{tables.length}</div><div className="stat-label">Tables</div></div>
          <div className="stat-card"><div className="stat-value">{tables.reduce((acc, t) => acc + t.columns, 0)}</div><div className="stat-label">Total Columns</div></div>
          <div className="stat-card"><div className="stat-value">{tables.reduce((acc, t) => acc + (t.foreignKeys?.length || 0), 0)}</div><div className="stat-label">Foreign Keys</div></div>
          <div className="stat-card"><div className="stat-value">{tables.filter(t => t.piiFields && t.piiFields.length > 0).reduce((acc, t) => acc + t.piiFields.length, 0)}</div><div className="stat-label">PII Fields</div></div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {mode === 'database' ? 'Detected Tables' : 'Loaded Tables'}
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {tables.map(table => (
              <TableSchemaCard
                key={table.name}
                table={table}
                expanded={expandedTable === table.name}
                onToggle={() => setExpandedTable(expandedTable === table.name ? null : table.name)}
                editable={mode === 'synthetic'}
                onEdit={() => handleEditTable(table)}
              />
            ))}
          </div>
          {mode === 'synthetic' && (
            <button
              className="btn btn-secondary"
              style={{ marginTop: '16px' }}
              onClick={() => {
                // Add a new empty table
                const newTable = {
                  name: `new_table_${tables.length + 1}`,
                  description: 'New table',
                  columns: 1,
                  primaryKey: 'id',
                  foreignKeys: [],
                  schema: [{ name: 'id', type: 'INTEGER', constraint: 'PRIMARY KEY' }]
                };
                onSchemaChange([...tables, newTable]);
              }}
            >
              + Add Table
            </button>
          )}
        </div>

        {/* Edit Table Modal */}
        {editingTable && (
          <EditTableModal
            table={editingTable}
            onSave={handleSaveTable}
            onClose={handleCloseEdit}
          />
        )}
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onPrevious}>← Previous</button>
        <button className="btn btn-primary" onClick={onNext}>
          {mode === 'database' ? 'Next: Configure Data Generation →' : 'Next: Preview & Generate →'}
        </button>
      </div>
    </div>
  );
};

// Table card component (with optional edit button)
const TableSchemaCard = ({ table, expanded, onToggle, editable, onEdit }) => (
  <div className="table-schema-card">
    <div className="table-schema-header" onClick={onToggle}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>{table.name}</span>
          {table.piiFields && table.piiFields.length > 0 && (
            <span className="badge badge-purple">{table.piiFields.length} PII Fields</span>
          )}
          {editable && (
            <button
              className="btn-icon"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Edit size={16} />
            </button>
          )}
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
          <thead><tr><th>Column Name</th><th>Data Type</th><th>Constraint</th><th>PII</th></tr></thead>
          <tbody>
            {table.schema.map(col => (
              <tr key={col.name}>
                <td>{col.name}</td>
                <td>{col.type}</td>
                <td>{col.constraint || '-'}</td>
                <td>{col.pii ? <span className="badge badge-purple">PII</span> : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// Modal for editing a table (simple version)
const EditTableModal = ({ table, onSave, onClose }) => {
  const [editedTable, setEditedTable] = useState({ ...table });

  const handleColumnChange = (index, field, value) => {
    const newSchema = [...editedTable.schema];
    newSchema[index][field] = value;
    setEditedTable({ ...editedTable, schema: newSchema, columns: newSchema.length });
  };

  const handleAddColumn = () => {
    setEditedTable({
      ...editedTable,
      schema: [...editedTable.schema, { name: 'new_column', type: 'VARCHAR(100)', constraint: '', pii: false }],
      columns: editedTable.schema.length + 1
    });
  };

  const handleRemoveColumn = (index) => {
    const newSchema = editedTable.schema.filter((_, i) => i !== index);
    setEditedTable({ ...editedTable, schema: newSchema, columns: newSchema.length });
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div className="modal-content" style={{ background:'white', borderRadius:'8px', width:'800px', maxWidth:'90%', maxHeight:'80vh', overflow:'auto', padding:'24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h3 style={{ fontSize:'18px', fontWeight:'600' }}>Edit Table: {table.name}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ marginBottom:'20px' }}>
          <label style={{ fontWeight:'500', display:'block', marginBottom:'4px' }}>Table Name</label>
          <input
            type="text"
            value={editedTable.name}
            onChange={(e) => setEditedTable({ ...editedTable, name: e.target.value })}
            className="form-input"
            style={{ width:'100%' }}
          />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={{ fontWeight:'500', display:'block', marginBottom:'4px' }}>Description</label>
          <input
            type="text"
            value={editedTable.description}
            onChange={(e) => setEditedTable({ ...editedTable, description: e.target.value })}
            className="form-input"
            style={{ width:'100%' }}
          />
        </div>

        <h4 style={{ fontSize:'16px', fontWeight:'600', marginBottom:'12px' }}>Columns</h4>
        <table className="data-table" style={{ fontSize:'13px', width:'100%' }}>
          <thead>
            <tr><th>Column Name</th><th>Data Type</th><th>Constraint</th><th>PII</th><th></th></tr>
          </thead>
          <tbody>
            {editedTable.schema.map((col, idx) => (
              <tr key={idx}>
                <td><input value={col.name} onChange={(e) => handleColumnChange(idx, 'name', e.target.value)} className="form-input" style={{ width:'100%' }} /></td>
                <td><input value={col.type} onChange={(e) => handleColumnChange(idx, 'type', e.target.value)} className="form-input" style={{ width:'100%' }} /></td>
                <td><input value={col.constraint || ''} onChange={(e) => handleColumnChange(idx, 'constraint', e.target.value)} className="form-input" style={{ width:'100%' }} /></td>
                <td><input type="checkbox" checked={col.pii || false} onChange={(e) => handleColumnChange(idx, 'pii', e.target.checked)} /></td>
                <td><button onClick={() => handleRemoveColumn(idx)} className="btn-icon"><X size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleAddColumn} className="btn btn-secondary" style={{ marginTop:'12px' }}>+ Add Column</button>

        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'24px', gap:'12px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(editedTable)}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

// ----- PII Override Modal (unchanged, but included for completeness) -----
const PIIOverrideModal = ({ table, piiOverrides, onCommit, onClose }) => {
  const [draft, setDraft] = React.useState(() => {
    const initial = {};
    if (table) {
      table.schema.forEach(col => {
        const key = `${table.name}.${col.name}`;
        if (piiOverrides.hasOwnProperty(key)) {
          initial[key] = piiOverrides[key];
        }
      });
    }
    return initial;
  });

  if (!table) return null;

  const handleToggle = (tableName, columnName, value) => {
    const key = `${tableName}.${columnName}`;
    setDraft(prev => {
      if (value === null) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  const handleDone = () => {
    onCommit(draft);
  };

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
        <div style={{ padding: '16px', background: 'rgba(102, 126, 234, 0.08)', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            The system automatically detects PII (Personally Identifiable Information) fields like SSN, email, and phone numbers.
            Use this modal to override those detections if needed:
          </p>
          <div style={{ display: 'grid', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div><strong style={{ color: 'var(--text-primary)' }}>Yes</strong> — Force this column to be treated as PII (it will be masked/synthesized during generation)</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>No</strong> — Force this column to NOT be treated as PII (keeps original values, even if auto-detected)</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>Auto</strong> — Use the system's automatic detection (default behavior)</div>
          </div>
        </div>
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
              const overrideValue = draft.hasOwnProperty(overrideKey)
                ? draft[overrideKey]
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
                          onChange={() => handleToggle(table.name, col.name, true)}
                        />
                        <span style={{ fontSize: '12px' }}>Yes</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="radio"
                          name={`pii-override-${col.name}`}
                          checked={overrideValue === false}
                          onChange={() => handleToggle(table.name, col.name, false)}
                        />
                        <span style={{ fontSize: '12px' }}>No</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="radio"
                          name={`pii-override-${col.name}`}
                          checked={overrideValue === null}
                          onChange={() => handleToggle(table.name, col.name, null)}
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
          <button className="btn btn-primary" onClick={handleDone}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default SyntheticDataDashboard;