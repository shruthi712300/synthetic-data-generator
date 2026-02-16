import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Save, CheckCircle, RotateCcw, Info, Plus, Trash2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';

// ============================================================================
// STEP 5: Configure Data Errors (with Per-Table Overrides and Custom Errors)
// ============================================================================
export const Step5ConfigureErrors = ({
  // Global config
  errorConfig,
  onErrorChange,
  // Per-table overrides
  perTableErrorOverrides,
  onPerTableErrorChange,
  onClearTableOverrides,
  // Existing props
  behaviorRules,
  onBehaviorChange,
  getAffectedTables,
  getAffectedRecords,
  tables,
  getCurrentTableData,
  // Custom errors
  customErrors,
  onAddCustomError,
  onUpdateCustomError,
  onDeleteCustomError,
  onToggleCustomError,
  onCustomErrorPercentageChange,
  onNext,
  onPrevious
}) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedErrorTable, setSelectedErrorTable] = useState(null);
  const [configMode, setConfigMode] = useState('global');
  const [editingTable, setEditingTable] = useState(null);
  const [activeTab, setActiveTab] = useState('builtin'); // 'builtin' or 'custom'

  // Helper to check if a table has any enabled custom error with percentage > 0
  const tableHasCustomErrors = (tableName) => {
    return customErrors.some(err => err.tableName === tableName && err.enabled && err.percentage > 0);
  };

  // Auto-select first table with errors (built-in or custom) for preview
  useEffect(() => {
    // Check if current selected table still has any errors (built-in or custom)
    const currentTableHasErrors = selectedErrorTable && (
      Object.keys(errorConfig).some(key => 
        errorConfig[key] > 0 && getAffectedTables(key).includes(selectedErrorTable) && getAffectedRecords(key) >= 1
      ) || tableHasCustomErrors(selectedErrorTable)
    );

    if (selectedErrorTable && currentTableHasErrors) return;

    // Find first table with either built-in errors or custom errors
    const firstTableWithErrors = tables.find(table => 
      Object.keys(errorConfig).some(key => 
        errorConfig[key] > 0 && getAffectedTables(key).includes(table.name) && getAffectedRecords(key) >= 1
      ) || tableHasCustomErrors(table.name)
    );

    if (firstTableWithErrors) {
      setSelectedErrorTable(firstTableWithErrors.name);
    } else {
      setSelectedErrorTable(null);
    }
  }, [errorConfig, tables, getAffectedTables, getAffectedRecords, selectedErrorTable, customErrors]);

  useEffect(() => {
    if (configMode === 'perTable' && !editingTable && tables.length > 0) {
      setEditingTable(tables[0].name);
    }
  }, [configMode, editingTable, tables]);

  const getCurrentErrorConfigForUI = () => {
    if (configMode === 'global') {
      return errorConfig;
    } else {
      const overrides = perTableErrorOverrides[editingTable] || {};
      return { ...errorConfig, ...overrides };
    }
  };

  const currentUIConfig = getCurrentErrorConfigForUI();

  const handleSliderChange = (errorType, value) => {
    if (configMode === 'global') {
      onErrorChange(errorType, value);
    } else {
      onPerTableErrorChange(editingTable, errorType, value);
    }
  };

  const handleResetTableOverrides = () => {
    if (editingTable) {
      onClearTableOverrides(editingTable);
    }
  };

  const handleResetAll = () => {
    Object.keys(errorConfig).forEach(key => {
      onErrorChange(key, 0);
    });
  };

  const errorCategories = [
    {
      id: 'data-quality',
      title: 'Data Quality Issues',
      subtitle: 'Completeness, Consistency, Accuracy & Format',
      aiInsight: '📊 Industry Average: 3-8% | Most common in corporate insurance data',
      errors: [
        { key: 'missingPolicyDates', label: 'Missing Policy Effective Dates', columns: ['effective_date'], benchmark: '2-3%' },
        { key: 'incompleteBeneficiary', label: 'Incomplete Beneficiary Info', columns: ['email', 'phone'], benchmark: '3-5%' },
        { key: 'missingClaimAdjuster', label: 'Missing Claim Adjuster', columns: ['adjuster_id'], benchmark: '2-4%' },
        { key: 'missingClientId', label: 'Missing Client ID', columns: ['policyholder_id'], benchmark: '2-3%' },
        { key: 'endBeforeStart', label: 'End Date Before Start Date', columns: ['effective_date', 'expiry_date'], benchmark: '1-2%' },
        { key: 'claimExceedsCoverage', label: 'Claim > Coverage Limit', columns: ['claim_amount'], benchmark: '2-3%' },
        { key: 'paymentBeforeClaim', label: 'Payment Before Claim Date', columns: ['payment_date'], benchmark: '1-2%' },
        { key: 'invalidStatusTransitions', label: 'Invalid Status Transitions', columns: ['status'], benchmark: '2-3%' },
        { key: 'duplicatePolicyNumbers', label: 'Duplicate Policy Numbers', columns: ['policy_number'], benchmark: '1-2%' },
        { key: 'incorrectJurisdiction', label: 'Incorrect Jurisdiction Codes', columns: ['region'], benchmark: '2-3%' },
        { key: 'inconsistentDateFormats', label: 'Inconsistent Date Formats', columns: ['effective_date', 'claim_date', 'payment_date'], benchmark: '3-5%' },
        { key: 'invalidEmailFormats', label: 'Invalid Email Formats', columns: ['email'], benchmark: '2-4%' },
        { key: 'malformedPhoneNumbers', label: 'Malformed Phone Numbers', columns: ['phone'], benchmark: '2-4%' }
      ]
    },
    {
      id: 'business-logic',
      title: 'Business Logic & Statistical Violations',
      subtitle: 'Business rules and statistical anomalies',
      aiInsight: '⚖️ Industry Average: 1-3% | Critical for compliance testing',
      errors: [
        { key: 'overlappingPolicyPeriods', label: 'Overlapping Policy Periods', columns: ['effective_date', 'expiry_date'], benchmark: '1-2%' },
        { key: 'claimBeforePolicyStart', label: 'Claim Before Policy Start', columns: ['claim_date'], benchmark: '1-2%' },
        { key: 'paymentExceedsClaim', label: 'Payment > Claimed Amount', columns: ['amount'], benchmark: '1-2%' },
        { key: 'zeroPremiumPolicies', label: 'Zero Premium Policies (Statistical)', columns: ['premium_amount'], benchmark: '1%' },
        { key: 'claimExceedsCoverageLimit', label: 'Claim > Coverage (Statistical)', columns: ['claim_amount'], benchmark: '2%' },
        { key: 'ageUnder18', label: 'Age Under 18 Violations (Statistical)', columns: ['date_of_birth'], benchmark: '1%' },
        { key: 'claimExceedsPremiumPaid', label: 'Claim Amount > Premium Paid (Statistical)', columns: ['claim_amount'], benchmark: '1-2%' }
      ]
    },
    {
      id: 'relationships',
      title: 'Referential Integrity & Relationships',
      subtitle: 'Foreign key and relationship violations',
      aiInsight: '🔗 Industry Average: 2-4% | Common after data migrations',
      errors: [
        { key: 'orphanedClaims', label: 'Orphaned Claims', columns: ['policy_id'], benchmark: '2-3%' },
        { key: 'paymentsWithoutClaims', label: 'Payments Without Claims', columns: ['claim_id'], benchmark: '2-3%' },
        { key: 'policyWithoutClient', label: 'Policy Without Valid Client', columns: ['policyholder_id'], benchmark: '2-3%' },
        { key: 'policyWithoutAgent', label: 'Policy Without Valid Agent', columns: ['agent_id'], benchmark: '2-3%' }
      ]
    }
  ];

  const affectedTableData = selectedErrorTable ? getCurrentTableData(selectedErrorTable, true) : null;
  const affectedTableInfo = tables.find(t => t.name === selectedErrorTable);

  return (
    <div className="step-container">
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>
              <h2 className="card-title" style={{ marginBottom: 0 }}>AI-Suggested Error Configuration</h2>
            </div>
            <p className="card-subtitle">
              Based on schema analysis of your corporate insurance database, I've identified and pre-configured 
              <strong> {Object.keys(errorConfig).length} error patterns</strong> with industry-standard rates.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {configMode === 'perTable' && editingTable && (
              <button className="btn btn-secondary" onClick={handleResetTableOverrides}>
                <RotateCcw size={16} />
                Reset {editingTable} to Global
              </button>
            )}
            <button className="btn btn-secondary" onClick={handleResetAll}>
              <RotateCcw size={16} />
              Reset All Defaults
            </button>
          </div>
        </div>

        {/* MODE TOGGLE */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="radio"
              name="errorConfigMode"
              value="global"
              checked={configMode === 'global'}
              onChange={() => setConfigMode('global')}
            />
            <span style={{ fontWeight: '600' }}>Dataset Defaults</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>– apply to all tables unless overridden</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="radio"
              name="errorConfigMode"
              value="perTable"
              checked={configMode === 'perTable'}
              onChange={() => setConfigMode('perTable')}
            />
            <span style={{ fontWeight: '600' }}>Per‑Table Overrides</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>– configure each table separately</span>
          </label>
        </div>

        {/* PER-TABLE SELECTOR */}
        {configMode === 'perTable' && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Select Table to Override:
            </label>
            <div className="table-selector" style={{ marginBottom: '8px' }}>
              {tables.map(table => {
                const hasOverrides = perTableErrorOverrides[table.name] && Object.keys(perTableErrorOverrides[table.name]).length > 0;
                return (
                  <button
                    key={table.name}
                    className={`table-selector-btn ${editingTable === table.name ? 'active' : ''}`}
                    onClick={() => setEditingTable(table.name)}
                  >
                    <span className="table-name">{table.name}</span>
                    {hasOverrides && <span className="error-badge">⚠ Overrides</span>}
                  </button>
                );
              })}
            </div>
            {editingTable && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Editing overrides for <strong>{editingTable}</strong>. Sliders below will apply only to this table.
                {!perTableErrorOverrides[editingTable] && <span> (no overrides yet – using global defaults)</span>}
              </div>
            )}
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <button
            className={`tab-btn ${activeTab === 'builtin' ? 'active' : ''}`}
            onClick={() => setActiveTab('builtin')}
            style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'builtin' ? '2px solid var(--primary-color)' : 'none', fontWeight: activeTab === 'builtin' ? '600' : '400', cursor: 'pointer' }}
          >
            Built‑in Errors
          </button>
          <button
            className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
            style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'custom' ? '2px solid var(--primary-color)' : 'none', fontWeight: activeTab === 'custom' ? '600' : '400', cursor: 'pointer' }}
          >
            Custom Errors
          </button>
        </div>

        {/* BUILT-IN ERRORS */}
        {activeTab === 'builtin' && (
          <>
            <div className="alert alert-info">
              <AlertCircle size={20} />
              <div>
                <strong>Error Configuration:</strong> Use sliders to set error percentage (0-10%) for each error type. 
                Errors will respect database constraints and relationship integrity.
              </div>
            </div>

            {errorCategories.map(category => (
              <ErrorCategorySection
                key={category.id}
                category={category}
                errorConfig={currentUIConfig}
                onErrorChange={handleSliderChange}
                getAffectedTables={getAffectedTables}
                getAffectedRecords={getAffectedRecords}
                expanded={expandedSection === category.id}
                onToggle={() => setExpandedSection(expandedSection === category.id ? null : category.id)}
                showOverrideBadge={configMode === 'perTable' && editingTable}
                globalErrorConfig={errorConfig}
                tableOverrides={perTableErrorOverrides[editingTable]}
              />
            ))}

            {/* Behavior Rules Section */}
            <div style={{ marginTop: '30px', padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>Behavior Rules Validation</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Validate realistic data patterns from source data. Adjust if values fall outside target ranges.
              </p>
              <BehaviorRuleControl
                label="Claim Rate"
                description="Percentage of policies that have claims"
                current={behaviorRules.claimRate.current}
                target={behaviorRules.claimRate.target}
                adjust={behaviorRules.claimRate.adjust}
                onAdjust={(value) => onBehaviorChange({ ...behaviorRules, claimRate: { ...behaviorRules.claimRate, adjust: value } })}
              />
              <BehaviorRuleControl
                label="Premium Distribution"
                description="Premium amounts should follow skewed distribution"
                current={behaviorRules.premiumSkewed.current ? 'Skewed' : 'Uniform'}
                target={behaviorRules.premiumSkewed.target ? 'Skewed' : 'Uniform'}
                adjust={behaviorRules.premiumSkewed.adjust}
                isBoolean
                onAdjust={(value) => onBehaviorChange({ ...behaviorRules, premiumSkewed: { ...behaviorRules.premiumSkewed, adjust: value } })}
              />
              <BehaviorRuleControl
                label="Seasonal Renewal Patterns"
                description="Policy renewals should cluster in Q1 and Q4"
                current={behaviorRules.seasonalRenewals.current ? 'Present' : 'Absent'}
                target={behaviorRules.seasonalRenewals.target ? 'Present' : 'Absent'}
                adjust={behaviorRules.seasonalRenewals.adjust}
                isBoolean
                onAdjust={(value) => onBehaviorChange({ ...behaviorRules, seasonalRenewals: { ...behaviorRules.seasonalRenewals, adjust: value } })}
              />
            </div>
          </>
        )}

        {/* CUSTOM ERRORS */}
        {activeTab === 'custom' && (
          <CustomErrorsManager
            tables={tables}
            customErrors={customErrors}
            onAdd={onAddCustomError}
            onUpdate={onUpdateCustomError}
            onDelete={onDeleteCustomError}
            onToggle={onToggleCustomError}
            onPercentageChange={onCustomErrorPercentageChange}
            configMode={configMode}
            editingTable={editingTable}
          />
        )}
      </div>

      {/* Affected Tables Preview */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Affected Tables Preview</h2>
          <p className="card-subtitle">Preview data with errors introduced (built‑in and custom)</p>
        </div>
        <div className="table-selector">
          {tables.map(table => {
            // Check for built-in errors
            const hasBuiltInErrors = Object.keys(errorConfig).some(key => 
              errorConfig[key] > 0 && getAffectedTables(key).includes(table.name) && getAffectedRecords(key) >= 1
            );
            // Check for custom errors
            const hasCustomErrors = customErrors.some(err => err.tableName === table.name && err.enabled && err.percentage > 0);
            const hasConfiguredErrors = hasBuiltInErrors || hasCustomErrors;

            return (
              <button
                key={table.name}
                className={`table-selector-btn ${selectedErrorTable === table.name ? 'active' : ''} ${!hasConfiguredErrors ? 'no-errors' : ''}`}
                onClick={() => setSelectedErrorTable(table.name)}
              >
                <span className="table-name">{table.name}</span>
                {hasConfiguredErrors && <span className="error-badge">⚠ Errors</span>}
              </button>
            );
          })}
        </div>
        {affectedTableData && affectedTableInfo && (
          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>{affectedTableInfo.schema.slice(0, 11).map(col => <th key={col.name}>{col.name}</th>)}</tr>
              </thead>
              <tbody>
                {affectedTableData.map((row, idx) => (
                  <tr key={idx}>
                    {affectedTableInfo.schema.slice(0, 11).map(col => {
                      const value = row[col.name];
                      const isError = row._errors && row._errors.includes(col.name);
                      return <td key={col.name} className={isError ? 'error-cell' : ''}>{value}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onPrevious}>← Previous</button>
        <button className="btn btn-primary" onClick={onNext}>Next: Business Rules & Validation →</button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// ErrorCategorySection (with override badge)
// ----------------------------------------------------------------------------
const ErrorCategorySection = ({
  category,
  errorConfig,
  onErrorChange,
  getAffectedTables,
  getAffectedRecords,
  expanded,
  onToggle,
  showOverrideBadge,
  globalErrorConfig,
  tableOverrides
}) => (
  <div style={{ marginBottom: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
    <div onClick={onToggle} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expanded ? '16px' : 0 }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{category.title}</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{category.subtitle}</p>
        {category.aiInsight && <div style={{ fontSize: '12px', color: 'var(--primary-color)', fontWeight: '600', marginTop: '4px' }}>{category.aiInsight}</div>}
      </div>
      {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </div>
    {expanded && (
      <div style={{ display: 'grid', gap: '12px' }}>
        {category.errors.map(error => {
          const affectedTables = getAffectedTables(error.key);
          const affectedRecords = getAffectedRecords(error.key);
          const currentValue = errorConfig[error.key] || 0;
          let isOverride = false;
          if (showOverrideBadge && globalErrorConfig && tableOverrides) {
            isOverride = tableOverrides[error.key] !== undefined && tableOverrides[error.key] !== globalErrorConfig[error.key];
          }
          return (
            <div key={error.key} style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', ...(isOverride ? { borderLeft: '4px solid var(--primary-color)' } : {}) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{error.label}</div>
                    {errorConfig[error.key] > 0 ? (
                      <span style={{ fontSize: '10px', padding: '2px 8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px', fontWeight: '600' }}>
                        ✨ AI Pre-configured: {error.benchmark}
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(156, 163, 175, 0.1)', color: 'var(--text-secondary)', borderRadius: '10px', fontWeight: '500', border: '1px dashed var(--border-color)' }}>
                        💡 Suggested: {error.benchmark}
                      </span>
                    )}
                    {isOverride && <span style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--primary-color)', color: 'white', borderRadius: '10px', fontWeight: '600' }}>⚡ Override</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}><strong>Affected Tables:</strong> {affectedTables.join(', ')}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}><strong>Affected Columns:</strong> {error.columns.join(', ')}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}><strong>Affected Records:</strong> {affectedRecords} records ({currentValue}% configured)</div>
                </div>
                <div className="error-slider-container">
                  <input type="range" min="0" max="10" value={currentValue} onChange={(e) => onErrorChange(error.key, e.target.value)} onInput={(e) => onErrorChange(error.key, e.target.value)} className="error-slider" />
                  <span className="error-slider-value">{currentValue}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

// ----------------------------------------------------------------------------
// BehaviorRuleControl
// ----------------------------------------------------------------------------
const BehaviorRuleControl = ({ label, description, current, target, adjust, isBoolean, onAdjust }) => {
  const isInRange = isBoolean 
    ? current === target
    : typeof target === 'object' 
      ? current >= target.min && current <= target.max
      : current === target;

  return (
    <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>{label}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{description}</div>
          <div style={{ fontSize: '13px' }}>
            <span style={{ color: 'var(--text-dim)' }}>Target:</span>{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{typeof target === 'object' ? `${target.min}-${target.max}%` : target}</strong>
            {' • '}
            <span style={{ color: 'var(--text-dim)' }}>Current:</span>{' '}
            <strong style={{ color: isInRange ? 'var(--success)' : 'var(--warning)' }}>{typeof current === 'number' ? `${current}%` : current}</strong>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`badge ${isInRange ? 'badge-success' : 'badge-warning'}`}>
            {isInRange ? '✓ In Range' : '⚠ Out of Range'}
          </span>
          {!isInRange && (
            <label className="toggle-switch">
              <input type="checkbox" checked={adjust} onChange={(e) => onAdjust(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          )}
        </div>
      </div>
      {!isInRange && adjust && (
        <div className="alert alert-info" style={{ fontSize: '12px', padding: '8px 12px' }}>
          <Info size={14} />
          <span>Data will be adjusted to fit within target range during generation</span>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------
// CustomErrorsManager
// ----------------------------------------------------------------------------
const CustomErrorsManager = ({ tables, customErrors, onAdd, onUpdate, onDelete, onToggle, onPercentageChange, configMode, editingTable }) => {
  const [selectedTable, setSelectedTable] = useState(tables[0]?.name || '');
  const [form, setForm] = useState({
    name: '',
    tableName: selectedTable,
    column: '',
    action: 'set_null',
    invalidValue: '',
    constantValue: '',
    percentage: 0,
    enabled: true
  });
  const [editingId, setEditingId] = useState(null);

  const currentTable = tables.find(t => t.name === selectedTable);
  const columns = currentTable?.schema.map(col => col.name) || [];

  useEffect(() => {
    setForm(prev => ({ ...prev, tableName: selectedTable, column: '' }));
  }, [selectedTable]);

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.column || form.percentage === undefined) {
      alert('Please fill in all required fields');
      return;
    }
    if (form.action === 'set_invalid' && !form.invalidValue) {
      alert('Please provide an invalid value');
      return;
    }
    if (form.action === 'set_constant' && !form.constantValue) {
      alert('Please provide a constant value');
      return;
    }
    if (editingId) {
      onUpdate(editingId, form);
      setEditingId(null);
    } else {
      onAdd({ ...form, id: Date.now().toString() });
    }
    setForm({
      name: '',
      tableName: selectedTable,
      column: '',
      action: 'set_null',
      invalidValue: '',
      constantValue: '',
      percentage: 0,
      enabled: true
    });
  };

  const handleEdit = (err) => {
    setEditingId(err.id);
    setSelectedTable(err.tableName);
    setForm({
      name: err.name,
      tableName: err.tableName,
      column: err.column,
      action: err.action,
      invalidValue: err.invalidValue || '',
      constantValue: err.constantValue || '',
      percentage: err.percentage,
      enabled: err.enabled
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      name: '',
      tableName: selectedTable,
      column: '',
      action: 'set_null',
      invalidValue: '',
      constantValue: '',
      percentage: 0,
      enabled: true
    });
  };

  const filteredErrors = configMode === 'global'
    ? customErrors
    : customErrors.filter(err => err.tableName === editingTable);

  return (
    <div>
      <div className="alert alert-info" style={{ marginBottom: '20px' }}>
        <AlertCircle size={20} />
        <div>
          <strong>Custom Errors:</strong> Define your own error patterns. Set a name, choose a table and column, and define what action to take (set to null, set an invalid value, or set a constant). Use the percentage slider to control how many records get this error.
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--warning)' }}>
          ⚠️ Note: For custom errors to appear in the final preview, the generator must set <code>record._hasError = true</code> in <code>dataGenerator.js</code>. Please verify that your <code>applyCustomErrors</code> function includes that line.
        </div>
      </div>

      {configMode === 'global' && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>Select Table (for new error):</label>
          <select
            className="form-select"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            style={{ width: '300px', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          >
            {tables.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
        </div>
      )}

      <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
          {editingId ? 'Edit Custom Error' : 'Add New Custom Error'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Error Name</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g. Agent License Expired"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Column</label>
            <select
              className="form-select"
              value={form.column}
              onChange={(e) => handleInputChange('column', e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            >
              <option value="">Select column</option>
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Action</label>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="radio"
                name="action"
                value="set_null"
                checked={form.action === 'set_null'}
                onChange={(e) => handleInputChange('action', e.target.value)}
              />
              <span style={{ fontSize: '13px' }}>Set to NULL</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="radio"
                name="action"
                value="set_invalid"
                checked={form.action === 'set_invalid'}
                onChange={(e) => handleInputChange('action', e.target.value)}
              />
              <span style={{ fontSize: '13px' }}>Set to invalid value</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="radio"
                name="action"
                value="set_constant"
                checked={form.action === 'set_constant'}
                onChange={(e) => handleInputChange('action', e.target.value)}
              />
              <span style={{ fontSize: '13px' }}>Set to constant</span>
            </label>
          </div>
        </div>

        {form.action === 'set_invalid' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Invalid Value</label>
            <input
              type="text"
              className="form-input"
              value={form.invalidValue}
              onChange={(e) => handleInputChange('invalidValue', e.target.value)}
              placeholder="e.g. INVALID, 9999-99-99"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            />
          </div>
        )}

        {form.action === 'set_constant' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Constant Value</label>
            <input
              type="text"
              className="form-input"
              value={form.constantValue}
              onChange={(e) => handleInputChange('constantValue', e.target.value)}
              placeholder="e.g. N/A, 0, UNKNOWN"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Percentage (%)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input
              type="range"
              min="0"
              max="10"
              value={form.percentage}
              onChange={(e) => handleInputChange('percentage', parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '40px' }}>{form.percentage}%</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {editingId && (
            <button className="btn btn-secondary" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
          <button className="btn btn-primary" onClick={handleSubmit}>
            <Plus size={16} />
            {editingId ? 'Update Error' : 'Add Error'}
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
          Defined Custom Errors ({filteredErrors.length})
        </h3>
        {filteredErrors.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
            No custom errors defined yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filteredErrors.map(err => {
              const table = tables.find(t => t.name === err.tableName);
              return (
                <div key={err.id} style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{err.name}</span>
                        <span className="badge badge-info">{err.tableName}.{err.column}</span>
                        <span className="badge badge-secondary">
                          {err.action === 'set_null' ? 'NULL' : err.action === 'set_invalid' ? `Invalid: ${err.invalidValue}` : `Constant: ${err.constantValue}`}
                        </span>
                        <span className={`badge ${err.enabled ? 'badge-success' : 'badge-secondary'}`}>
                          {err.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Percentage: {err.percentage}%
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-icon" onClick={() => handleEdit(err)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-icon" onClick={() => onToggle(err.id)} title={err.enabled ? 'Disable' : 'Enable'}>
                        {err.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button className="btn btn-icon" onClick={() => onDelete(err.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// STEP 6: Custom Business Rules & Validation (with test using final data)
// ============================================================================
export const Step5BusinessRules = ({
  tables,
  businessRules,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onToggleRule,
  getCurrentTableData,
  onNext,
  onPrevious
}) => {
  const [selectedTable, setSelectedTable] = useState(tables[0]?.name || '');
  const [ruleForm, setRuleForm] = useState({
    tableName: tables[0]?.name || '',
    column: '',
    operator: '==',
    value: '',
    errorMessage: '',
    autoFix: false,
    enabled: true
  });
  const [testResult, setTestResult] = useState(null);
  const [editingRuleId, setEditingRuleId] = useState(null);

  const currentTable = tables.find(t => t.name === selectedTable);
  const columns = currentTable?.schema.map(col => col.name) || [];

  useEffect(() => {
    setRuleForm(prev => ({ ...prev, tableName: selectedTable, column: '' }));
  }, [selectedTable]);

  const handleInputChange = (field, value) => {
    setRuleForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!ruleForm.column || !ruleForm.value || !ruleForm.errorMessage) {
      alert('Please fill in all required fields');
      return;
    }
    if (editingRuleId) {
      onUpdateRule(editingRuleId, ruleForm);
      setEditingRuleId(null);
    } else {
      onAddRule(ruleForm);
    }
    setRuleForm({
      tableName: selectedTable,
      column: '',
      operator: '==',
      value: '',
      errorMessage: '',
      autoFix: false,
      enabled: true
    });
    setTestResult(null);
  };

  const handleEdit = (rule) => {
    setEditingRuleId(rule.id);
    setSelectedTable(rule.tableName);
    setRuleForm({
      tableName: rule.tableName,
      column: rule.column,
      operator: rule.operator,
      value: rule.value,
      errorMessage: rule.errorMessage,
      autoFix: rule.autoFix || false,
      enabled: rule.enabled
    });
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setRuleForm({
      tableName: selectedTable,
      column: '',
      operator: '==',
      value: '',
      errorMessage: '',
      autoFix: false,
      enabled: true
    });
    setTestResult(null);
  };

  // UPDATED: Use final data with custom errors for testing (includeErrors=true, raw=false)
  const handleTestRule = () => {
    if (!ruleForm.column || !ruleForm.value) return;
    // Use includeErrors=true to get data with built-in and custom errors, raw=false to include PII masking
    const data = getCurrentTableData(selectedTable, true, false);
    if (!data) return;
    const violations = data.filter(row => {
      const value = row[ruleForm.column];
      return !evaluateCondition(value, ruleForm.operator, ruleForm.value);
    });
    setTestResult({
      total: data.length,
      violations: violations.length,
      sample: violations.slice(0, 3).map(row => row[ruleForm.column])
    });
  };

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

  return (
    <div className="step-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Custom Business Rules & Validation</h2>
            <p className="card-subtitle">
              Define validation rules to ensure data meets your business requirements
            </p>
          </div>
        </div>

        <div className="alert alert-info">
          <AlertCircle size={20} />
          <div>
            <strong>Business Rules:</strong> Add conditions that generated data must satisfy. 
            Enable "Auto-fix" to automatically regenerate non‑compliant records.
            <br />
            <small>Note: The test below now uses final data (including custom errors) to reflect what you see in the preview.</small>
          </div>
        </div>

        {/* Rule Builder */}
        <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {editingRuleId ? 'Edit Rule' : 'Add New Rule'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Table</label>
              <select
                className="form-select"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              >
                {tables.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Column</label>
              <select
                className="form-select"
                value={ruleForm.column}
                onChange={(e) => handleInputChange('column', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              >
                <option value="">Select column</option>
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Operator</label>
              <select
                className="form-select"
                value={ruleForm.operator}
                onChange={(e) => handleInputChange('operator', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              >
                <option value="==">Equals (==)</option>
                <option value="!=">Not equals (!=)</option>
                <option value=">">{`Greater than (>)`}</option>
                <option value="<">{`Less than (<)`}</option>
                <option value=">=">{`Greater than or equal (>=)`}</option>
                <option value="<=">{`Less than or equal (<=)`}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Value</label>
              <input
                type="text"
                className="form-input"
                value={ruleForm.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                placeholder="e.g. 2006-01-01, 18, Active"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Error Message</label>
            <input
              type="text"
              className="form-input"
              value={ruleForm.errorMessage}
              onChange={(e) => handleInputChange('errorMessage', e.target.value)}
              placeholder="e.g. Age must be ≥ 18"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={ruleForm.autoFix}
                onChange={(e) => handleInputChange('autoFix', e.target.checked)}
              />
              <span style={{ fontSize: '13px' }}>Auto‑fix (regenerate until valid)</span>
            </label>
            <button className="btn btn-secondary" onClick={handleTestRule} disabled={!ruleForm.column || !ruleForm.value}>
              <CheckCircle size={16} />
              Test Rule
            </button>
          </div>

          {testResult && (
            <div className={`alert ${testResult.violations === 0 ? 'alert-success' : 'alert-warning'}`} style={{ marginBottom: '16px' }}>
              <AlertCircle size={20} />
              <div>
                <strong>Rule Test Result:</strong> {testResult.violations} of {testResult.total} records would violate this rule.
                {testResult.violations > 0 && testResult.sample.length > 0 && (
                  <div style={{ marginTop: '4px', fontSize: '12px' }}>
                    Sample violations: {testResult.sample.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            {editingRuleId && (
              <button className="btn btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
            <button className="btn btn-primary" onClick={handleSubmit}>
              <Plus size={16} />
              {editingRuleId ? 'Update Rule' : 'Add Rule'}
            </button>
          </div>
        </div>

        {/* Existing Rules List */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Existing Rules ({businessRules.length})
          </h3>
          {businessRules.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
              No business rules defined yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {businessRules.map(rule => (
                <div key={rule.id} style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{rule.tableName}.{rule.column} {rule.operator} {rule.value}</span>
                        {rule.autoFix && <span className="badge badge-success">Auto‑fix</span>}
                        <span className={`badge ${rule.enabled ? 'badge-success' : 'badge-secondary'}`}>
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {rule.errorMessage}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-icon" onClick={() => handleEdit(rule)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-icon" onClick={() => onToggleRule(rule.id)} title={rule.enabled ? 'Disable' : 'Enable'}>
                        {rule.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button className="btn btn-icon" onClick={() => onDeleteRule(rule.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onPrevious}>← Previous</button>
        <button className="btn btn-primary" onClick={onNext}>Next: Destination Preview & Save →</button>
      </div>
    </div>
  );
};
// ============================================================================
// STEP 7: Destination Data Preview (FIXED: accurate average error rate)
// ============================================================================
export const Step6DestinationPreview = ({ 
  tables, selectedTable, onSelectTable, getCurrentTableData, errorConfig, getAffectedRecords,
  selectedSource, selectedDestination, databases, destinationDbs, onSave, savedData, onPrevious 
}) => {
  const [currentTable, setCurrentTable] = useState(selectedTable || tables[0]?.name);
  const tableData = currentTable ? getCurrentTableData(currentTable, true) : null;
  const tableInfo = tables.find(t => t.name === currentTable);

  const sourceDb = databases.find(db => db.id === selectedSource);
  const destDb = destinationDbs.find(db => db.id === selectedDestination);

  const totalRecords = tables.reduce((acc, t) => acc + t.records, 0);

  // Compute total error records across ALL tables by actually generating the data
  const totalErrorRecords = useMemo(() => {
    let total = 0;
    tables.forEach(table => {
      const data = getCurrentTableData(table.name, true);
      if (data) {
        total += data.filter(row => row._hasError || row._hasRuleViolation).length;
      }
    });
    return total;
  }, [tables, getCurrentTableData]); // Add other dependencies if needed (errorConfig, perTableErrorOverrides, customErrors, businessRules)

  const avgErrorRate = totalRecords > 0 ? ((totalErrorRecords / totalRecords) * 100).toFixed(2) : '0.00';

  const totalErrorsCurrent = tableData ? tableData.filter(row => row._hasError || row._hasRuleViolation).length : 0;
  const errorPercentage = tableData ? ((totalErrorsCurrent / tableData.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="step-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Destination Data Preview</h2>
            <p className="card-subtitle">Final data with errors and business rules applied, ready for destination database</p>
          </div>
        </div>

        <div className="alert alert-success">
          <CheckCircle size={20} />
          <div>
            <strong>Ready to Save:</strong> {totalRecords} records across {tables.length} tables with configured errors and rules
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{tables.length}</div><div className="stat-label">Tables</div></div>
          <div className="stat-card"><div className="stat-value">{totalRecords}</div><div className="stat-label">Total Records</div></div>
          <div className="stat-card"><div className="stat-value"><strong>{avgErrorRate}%</strong></div><div className="stat-label">Avg Error Rate</div></div>
          <div className="stat-card"><div className="stat-value">{errorPercentage}%</div><div className="stat-label">Errors in Current Table</div></div>
        </div>

        <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>Configuration Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
            <div><div style={{ color: 'var(--text-dim)', marginBottom: '4px' }}>Source Database:</div><div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{sourceDb?.name}</div></div>
            <div><div style={{ color: 'var(--text-dim)', marginBottom: '4px' }}>Destination Database:</div><div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{destDb?.name}</div></div>
            <div><div style={{ color: 'var(--text-dim)', marginBottom: '4px' }}>Tables Selected:</div><div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{tables.length} tables</div></div>
            <div><div style={{ color: 'var(--text-dim)', marginBottom: '4px' }}>Total Records:</div><div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{totalRecords.toLocaleString()}</div></div>
          </div>
        </div>

        <div className="table-selector" style={{ marginTop: '24px' }}>
          {tables.map(table => {
            const data = getCurrentTableData(table.name, true);
            const errors = data ? data.filter(row => row._hasError || row._hasRuleViolation).length : 0;
            return (
              <button key={table.name} className={`table-selector-btn ${currentTable === table.name ? 'active' : ''}`} onClick={() => { setCurrentTable(table.name); onSelectTable(table.name); }}>
                <span className="table-name">{table.name}</span>
                <span className="table-count">{table.records} records</span>
                {errors > 0 && <span className="error-badge">⚠ {errors} issues</span>}
              </button>
            );
          })}
        </div>

        {tableData && tableInfo && (
          <>
            <div className="alert alert-warning" style={{ marginTop: '20px' }}>
              <AlertCircle size={20} />
              <div>
                <strong>Error Summary for {currentTable}:</strong>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>
                  {totalErrorsCurrent} of {tableData.length} records contain issues ({errorPercentage}% error rate). 
                  Errors respect database constraints and relationships.
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    {tableInfo.schema.slice(0, 7).map(col => <th key={col.name}>{col.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr key={idx}>
                      <td>
                        {row._hasError || row._hasRuleViolation ? (
                          <span className="badge badge-error">⚠ Issue</span>
                        ) : (
                          <span className="badge badge-success">✓ Valid</span>
                        )}
                      </td>
                      {tableInfo.schema.slice(0, 7).map(col => {
                        const value = row[col.name];
                        const isError = row._errors && row._errors.includes(col.name);
                        const isRuleViolation = row._ruleViolations && row._ruleViolations.length > 0;
                        const isPII = col.pii;
                        let cellClass = '';
                        if (isError) cellClass = 'error-cell';
                        if (isRuleViolation && !isError) cellClass = 'rule-violation-cell';
                        return (
                          <td key={col.name} className={cellClass}>
                            {isPII ? (
                              <span className={`pii-highlight pii-${col.name.includes('ssn') ? 'ssn' : col.name.includes('email') ? 'email' : col.name.includes('phone') ? 'phone' : 'dob'}`}>
                                {value}
                              </span>
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Save to Destination</h2>
          <p className="card-subtitle">Complete the data generation process</p>
        </div>
        <div className="alert alert-info">
          <AlertCircle size={20} />
          <div>
            <strong>Final Step:</strong> Review the configuration and click "Save to Destination Database" to complete the process.
            Data will be written to <strong>{destDb?.name}</strong>.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={onSave} style={{ flex: 1 }}>
            <Save size={16} />
            Save to Destination Database
          </button>
        </div>
        {savedData && (
          <div className="alert alert-success" style={{ marginTop: '20px' }}>
            <CheckCircle size={20} />
            <div>
              <strong>✓ Data Saved Successfully!</strong>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>
                Saved to {destDb?.name} at {new Date(savedData.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onPrevious}>← Previous</button>
        <div></div>
      </div>
    </div>
  );
};