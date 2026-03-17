import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Save, CheckCircle, RotateCcw, Info, Plus, Trash2, Edit, ToggleLeft, ToggleRight, Download } from 'lucide-react';

// Helper: select display columns ensuring priority columns (PII, custom errors) are always visible
const getDisplayColumns = (schema, maxCols, priorityNames = []) => {
  const priorityCols = schema.filter(col => priorityNames.includes(col.name));
  const otherCols = schema.filter(col => !priorityNames.includes(col.name));
  const slotsForOthers = Math.max(0, maxCols - priorityCols.length);
  const selectedOthers = otherCols.slice(0, slotsForOthers);
  const selectedNames = new Set([...priorityCols.map(c => c.name), ...selectedOthers.map(c => c.name)]);
  return schema.filter(col => selectedNames.has(col.name));
};

// ============================================================================
// STEP 5: Configure Data Errors (with Per-Table Overrides and Custom Errors)
// ============================================================================
export const Step5ConfigureErrors = ({
  // Global config
  errorConfig,
  onErrorChange,
  // Existing props
  behaviorRules,
  onBehaviorChange,
  getAffectedTables,
  getAffectedRecords,
  tables,
  getCurrentTableData,
  getPriorityColumns,
  getEffectivePiiFields,
  // Custom errors
  customErrors,
  onAddCustomError,
  onUpdateCustomError,
  onDeleteCustomError,
  onToggleCustomError,
  onCustomErrorPercentageChange,
  onResetAllErrors,
  // Validation rules (business rules)
  businessRules,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onToggleRule,
  onNext,
  onPrevious
}) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedErrorTable, setSelectedErrorTable] = useState(null);
  const [activeTab, setActiveTab] = useState('builtin'); // 'builtin', 'custom', or 'validation'
  // Confirmation dialog state: null | 'builtin' | 'all'
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Helper to check if a table has any enabled custom error (simple with percentage > 0, or SQL with query)
  const tableHasCustomErrors = (tableName) => {
    return customErrors.some(err => err.tableName === tableName && err.enabled && (
      (err.queryType === 'sql' && err.sqlQuery) || err.percentage > 0
    ));
  };

  // Auto-select first table with errors for preview; keep current selection if no errors (e.g. after Reset All)
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
    } else if (!selectedErrorTable && tables.length > 0) {
      // No errors anywhere and no table selected — pick the first table so preview stays visible
      setSelectedErrorTable(tables[0].name);
    }
    // If selectedErrorTable is already set but has no errors, keep it (don't clear to null)
  }, [errorConfig, tables, getAffectedTables, getAffectedRecords, selectedErrorTable, customErrors]);

  const handleConfirmReset = () => {
    if (confirmDialog === 'builtin') {
      Object.keys(errorConfig).forEach(key => { onErrorChange(key, 0); });
    } else if (confirmDialog === 'all') {
      if (onResetAllErrors) onResetAllErrors(true);
    }
    setConfirmDialog(null);
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => setConfirmDialog('builtin')} title="Reset built-in error sliders to 0%">
              <RotateCcw size={16} />
              Reset Built-in
            </button>
            {onResetAllErrors && (
              <button className="btn btn-secondary" onClick={() => setConfirmDialog('all')} title="Reset all errors: built-in, custom, and validation rules" style={{ color: 'var(--accent-error)' }}>
                <Trash2 size={16} />
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Inline confirmation dialog */}
        {confirmDialog && (
          <div style={{
            padding: '16px', marginBottom: '16px', borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} style={{ color: 'var(--accent-error)', flexShrink: 0 }} />
              <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                {confirmDialog === 'builtin'
                  ? 'Reset all built-in error sliders to 0%?'
                  : 'This will reset all built-in errors, delete all custom errors, and remove all validation rules. Continue?'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDialog(null)} style={{ padding: '6px 16px', fontSize: '13px' }}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmReset} style={{ padding: '6px 16px', fontSize: '13px' }}>
                Yes, Reset
              </button>
            </div>
          </div>
        )}

        {/* Built-in vs Custom Errors explanation */}
        <div style={{ padding: '16px', background: 'rgba(102, 126, 234, 0.08)', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Info size={18} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <strong style={{ color: 'var(--primary-color)' }}>Two types of errors you can configure:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                <div style={{ padding: '10px', background: 'white', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Built-in Errors</strong>
                  <div style={{ marginTop: '4px', fontSize: '12px' }}>Pre-configured error patterns common in insurance data (e.g., missing dates, invalid formats, orphaned records). Adjust each slider to set the error percentage.</div>
                </div>
                <div style={{ padding: '10px', background: 'white', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Custom Errors</strong>
                  <div style={{ marginTop: '4px', fontSize: '12px' }}>Define your own error patterns by choosing a table, column, and action (set to NULL, invalid value, or constant). Useful for testing specific scenarios.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
          <button
            className={`tab-btn ${activeTab === 'validation' ? 'active' : ''}`}
            onClick={() => setActiveTab('validation')}
            style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'validation' ? '2px solid var(--primary-color)' : 'none', fontWeight: activeTab === 'validation' ? '600' : '400', cursor: 'pointer' }}
          >
            Validation Rules {businessRules.length > 0 && <span className="badge badge-info" style={{ marginLeft: '6px', fontSize: '10px' }}>{businessRules.length}</span>}
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
                errorConfig={errorConfig}
                onErrorChange={onErrorChange}
                getAffectedTables={getAffectedTables}
                getAffectedRecords={getAffectedRecords}
                expanded={expandedSection === category.id}
                onToggle={() => setExpandedSection(expandedSection === category.id ? null : category.id)}
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
          />
        )}

        {/* VALIDATION RULES */}
        {activeTab === 'validation' && (
          <ValidationRulesManager
            tables={tables}
            businessRules={businessRules}
            onAddRule={onAddRule}
            onUpdateRule={onUpdateRule}
            onDeleteRule={onDeleteRule}
            onToggleRule={onToggleRule}
            getCurrentTableData={getCurrentTableData}
          />
        )}
      </div>

      {/* Affected Tables Preview */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Affected Tables Preview</h2>
          <p className="card-subtitle">Preview data with errors and validation rule violations highlighted</p>
        </div>
        <div className="table-selector">
          {tables.map(table => {
            // Count custom errors for this table
            const customErrorCount = customErrors.filter(err => err.tableName === table.name && err.enabled && (
              (err.queryType === 'sql' && err.sqlQuery) || err.percentage > 0
            )).length;
            // Count built-in errors for this table
            const builtInErrorCount = Object.keys(errorConfig).filter(key =>
              errorConfig[key] > 0 && getAffectedTables(key).includes(table.name) && getAffectedRecords(key) >= 1
            ).length;
            const totalErrorCount = builtInErrorCount + customErrorCount;
            const hasConfiguredErrors = totalErrorCount > 0;
            // Count actual violated records for this table (not just rule count)
            const tableData = getCurrentTableData(table.name, true);
            const violationRecordCount = tableData ? tableData.filter(row => row._hasRuleViolation).length : 0;

            const tablePiiFields = getEffectivePiiFields ? getEffectivePiiFields(table.name) : [];
            const hasPii = tablePiiFields.length > 0;

            return (
              <button
                key={table.name}
                className={`table-selector-btn ${selectedErrorTable === table.name ? 'active' : ''} ${!hasConfiguredErrors && violationRecordCount === 0 ? 'no-errors' : ''}`}
                onClick={() => setSelectedErrorTable(table.name)}
              >
                <span className="table-name">{table.name}</span>
                {hasPii && <span style={{ fontSize: '12px', marginLeft: '2px' }} title={`${tablePiiFields.length} PII field${tablePiiFields.length > 1 ? 's' : ''}`}>🔒</span>}
                {totalErrorCount > 0 && <span className="error-badge">⚠ {totalErrorCount}</span>}
                {violationRecordCount > 0 && <span className="error-badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#b45309' }}>⚡ {violationRecordCount}</span>}
              </button>
            );
          })}
        </div>
        {affectedTableData && affectedTableInfo && (
          <>
          {/* Error injection stats */}
          {(() => {
            const errorRows = affectedTableData.filter(row => row._hasError).length;
            const violationRows = affectedTableData.filter(row => row._hasRuleViolation).length;
            const totalIssues = affectedTableData.filter(row => row._hasError || row._hasRuleViolation).length;
            const pct = affectedTableData.length > 0 ? ((totalIssues / affectedTableData.length) * 100).toFixed(1) : '0.0';
            return totalIssues > 0 ? (
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {totalIssues} of {affectedTableData.length} records affected ({pct}%)
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                  {errorRows > 0 && <span style={{ color: 'var(--error, #ef4444)' }}>⚠ {errorRows} error{errorRows !== 1 ? 's' : ''}</span>}
                  {violationRows > 0 && <span style={{ color: '#b45309' }}>⚡ {violationRows} violation{violationRows !== 1 ? 's' : ''}</span>}
                </div>
                {/* Progress bar */}
                <div style={{ flex: 1, minWidth: '120px', height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: parseFloat(pct) > 20 ? '#ef4444' : parseFloat(pct) > 10 ? '#f59e0b' : '#22c55e', borderRadius: '3px', transition: 'width 0.3s' }} />
                </div>
              </div>
            ) : null;
          })()}
          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            {(() => {
              const priorityNames = getPriorityColumns ? getPriorityColumns(selectedErrorTable) : [];
              const piiFields = getEffectivePiiFields ? getEffectivePiiFields(selectedErrorTable) : [];
              const displayCols = getDisplayColumns(affectedTableInfo.schema, 11, priorityNames);
              return (
                <table className="data-table">
                  <thead>
                    <tr>
                      {displayCols.map(col => (
                        <th key={col.name}>
                          {col.name}
                          {piiFields.includes(col.name) && <span style={{ marginLeft: '4px', fontSize: '10px' }}>🔒</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {affectedTableData.map((row, idx) => {
                      const rowClasses = [
                        row._hasError ? 'row-error' : '',
                        row._hasRuleViolation ? 'row-violation' : ''
                      ].filter(Boolean).join(' ');
                      return (
                        <tr key={idx} className={rowClasses || undefined}>
                          {displayCols.map(col => {
                            const value = row[col.name];
                            const isError = row._errors && row._errors.includes(col.name);
                            const isPII = piiFields.includes(col.name);
                            const isViolationTarget = row._ruleViolations && row._ruleViolations.length > 0 && businessRules
                              .filter(r => r.enabled && row._ruleViolations.includes(r.id))
                              .some(r => r.column === col.name);
                            let cellClass = '';
                            if (isError) cellClass = 'error-cell';
                            else if (isViolationTarget) cellClass = 'rule-violation-cell';
                            return (
                              <td key={col.name} className={cellClass || undefined}>
                                {isPII ? (
                                  <span className={`pii-highlight pii-${col.name.includes('ssn') || col.name.includes('tax') ? 'ssn' : col.name.includes('email') ? 'email' : col.name.includes('phone') ? 'phone' : col.name.includes('dob') || col.name.includes('birth') ? 'dob' : 'generic'}`}>{value}</span>
                                ) : value}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </div>
          </>
        )}
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onPrevious}>← Previous</button>
        <button className="btn btn-primary" onClick={onNext}>Next: Destination Preview & Save →</button>
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
  onToggle
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
          return (
            <div key={error.key} style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
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
const CustomErrorsManager = ({ tables, customErrors, onAdd, onUpdate, onDelete, onToggle, onPercentageChange }) => {
  const [selectedTable, setSelectedTable] = useState(tables[0]?.name || '');
  const [form, setForm] = useState({
    name: '',
    tableName: selectedTable,
    column: '',
    action: 'set_null',
    invalidValue: '',
    constantValue: '',
    percentage: 0,
    enabled: true,
    queryType: 'simple',
    sqlQuery: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const currentTable = tables.find(t => t.name === selectedTable);
  // Exclude PK and FK columns — not useful for error injection
  const columns = currentTable?.schema
    .filter(col => !col.constraint?.includes('PRIMARY KEY') && !col.constraint?.includes('FOREIGN KEY'))
    .map(col => col.name) || [];

  useEffect(() => {
    setForm(prev => {
      const next = { ...prev, tableName: selectedTable, column: '' };
      // If in SQL mode, update the sample query for the new table
      if (prev.queryType === 'sql') {
        const sampleQuery = sampleSqlQueries[selectedTable] || sampleSqlQueries.policies;
        next.sqlQuery = sampleQuery;
        next.name = autoGenerateSqlName(sampleQuery);
      }
      return next;
    });
    setValidationErrors({});
  }, [selectedTable]);

  // Auto-generate error name based on column + action (simple mode)
  const autoGenerateName = (col, action) => {
    if (!col) return '';
    const actionLabels = { set_null: 'NULL', set_invalid: 'Invalid', set_constant: 'Constant' };
    return `${col} — ${actionLabels[action] || action}`;
  };

  // Auto-generate error name from SQL query
  const autoGenerateSqlName = (sqlQuery) => {
    if (!sqlQuery || !sqlQuery.trim()) return 'SQL Query';
    try {
      const cleaned = sqlQuery.replace(/;\s*$/, '').trim();
      const regex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*('[^']*'|\d+)\s+WHERE\s+(.+?)\s+PERCENT\s+(\d+)\s*$/i;
      const match = cleaned.match(regex);
      if (match) {
        const target = match[1];
        const val = match[2].startsWith("'") ? match[2].slice(1, -1) : match[2];
        return `${target} = ${val} (${match[4]}%)`;
      }
    } catch (e) { /* ignore parse errors */ }
    return sqlQuery.length > 40 ? sqlQuery.substring(0, 40) + '...' : sqlQuery;
  };

  // Sample SQL queries per table (hardcoded for prototype)
  const sampleSqlQueries = {
    policies: "agent_id = 'AG-9999-INVALID' WHERE region = 'CA' PERCENT 50",
    claims: "adjuster_id = 'ADJ-0000-INVALID' WHERE status = 'Approved' PERCENT 30",
    policyholders: "credit_rating = 'INVALID' WHERE industry_code = 'TECH' PERCENT 40",
    beneficiaries: "status = 'SUSPENDED' WHERE relationship = 'Self' PERCENT 25",
    payments: "status = 'FAILED' WHERE payment_method = 'ACH' PERCENT 20",
    agent_employee_brokers: "agent_id = 'AG-8888-INVALID' WHERE agent_type = 'Broker' PERCENT 50",
    training_certification: "status = 'REVOKED' WHERE certification_type = 'Cyber Insurance' PERCENT 30",
    region_regulatory_rules: "license_renewal_period = 0 WHERE region = 'NY' PERCENT 50"
  };

  const handleInputChange = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (!editingId) {
        // When switching to SQL mode, auto-populate query and name
        if (field === 'queryType') {
          if (value === 'sql') {
            const sampleQuery = sampleSqlQueries[prev.tableName] || sampleSqlQueries.policies;
            next.sqlQuery = sampleQuery;
            next.name = autoGenerateSqlName(sampleQuery);
          } else {
            next.sqlQuery = '';
            const prevSqlName = autoGenerateSqlName(prev.sqlQuery);
            if (!prev.name || prev.name === prevSqlName) {
              next.name = autoGenerateName(prev.column, prev.action);
            }
          }
        }
        // Auto-populate name when column or action changes (simple mode)
        if ((field === 'column' || field === 'action') && (prev.queryType === 'simple' || next.queryType === 'simple')) {
          const col = field === 'column' ? value : prev.column;
          const action = field === 'action' ? value : prev.action;
          const currentAutoName = autoGenerateName(prev.column, prev.action);
          if (!prev.name || prev.name === currentAutoName) {
            next.name = autoGenerateName(col, action);
          }
        }
      }
      return next;
    });
    // Clear validation error for this field when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleSubmit = () => {
    const errors = {};
    if (!form.name) errors.name = 'Error name is required';
    if (form.queryType === 'sql') {
      if (!form.sqlQuery) errors.sqlQuery = 'Please enter a SQL query';
    } else {
      if (!form.column) errors.column = 'Please select a column';
      if (form.action === 'set_invalid' && !form.invalidValue) errors.invalidValue = 'Please provide an invalid value';
      if (form.action === 'set_constant' && !form.constantValue) errors.constantValue = 'Please provide a constant value';
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
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
      enabled: true,
      queryType: 'simple',
      sqlQuery: ''
    });
  };

  const handleEdit = (err) => {
    setEditingId(err.id);
    setSelectedTable(err.tableName);
    setValidationErrors({});
    setForm({
      name: err.name,
      tableName: err.tableName,
      column: err.column,
      action: err.action,
      invalidValue: err.invalidValue || '',
      constantValue: err.constantValue || '',
      percentage: err.percentage,
      enabled: err.enabled,
      queryType: err.queryType || 'simple',
      sqlQuery: err.sqlQuery || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setValidationErrors({});
    setForm({
      name: '',
      tableName: selectedTable,
      column: '',
      action: 'set_null',
      invalidValue: '',
      constantValue: '',
      percentage: 0,
      enabled: true,
      queryType: 'simple',
      sqlQuery: ''
    });
  };

  // Show all custom errors, grouped by selected table first
  const filteredErrors = customErrors;

  return (
    <div>
      <div className="alert alert-info" style={{ marginBottom: '20px' }}>
        <AlertCircle size={20} />
        <div>
          <strong>Custom Errors — Precise, Per-Table Error Injection</strong>
          <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            While <strong>Built-in Errors</strong> apply the same percentage across all tables, Custom Errors give you <strong>table-level and column-level control</strong>.
            Select a specific table, pick the exact column, choose what kind of bad data to inject, and set the percentage — all targeted to that one table.
          </div>
          <div style={{ marginTop: '12px', display: 'grid', gap: '4px', fontSize: '12px' }}>
            <div><strong>Set to NULL</strong> — Replaces the value with NULL (simulates missing data)</div>
            <div><strong>Set to Invalid</strong> — Replaces with a specific bad value you choose (e.g., &quot;9999-99-99&quot; for a date field)</div>
            <div><strong>Set to Constant</strong> — Replaces with a fixed value (e.g., &quot;N/A&quot; or &quot;UNKNOWN&quot;)</div>
          </div>
          <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '4px', border: '1px solid rgba(234, 179, 8, 0.2)', fontSize: '12px', color: '#92400e' }}>
            <strong>Tip:</strong> Enter values that match the column&apos;s data type for realistic testing. For example, use a bad date like &quot;9999-99-99&quot; for a DATE column, not random text — otherwise the error may not be meaningful for testing your validation pipelines.
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Use the percentage slider to control what fraction of records get this error (0-10%).
          </div>
        </div>
      </div>

      <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
          {editingId ? 'Edit Custom Error' : 'Add New Custom Error'}
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Table</label>
          <select
            className="form-select"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          >
            {tables.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
        </div>

        {/* Query Type Toggle */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-dim)' }}>Error Mode</label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', border: `1px solid ${form.queryType === 'simple' ? 'var(--primary-color)' : 'var(--border-color)'}`, background: form.queryType === 'simple' ? 'rgba(102, 126, 234, 0.08)' : 'transparent', cursor: 'pointer' }}>
              <input type="radio" name="queryType" value="simple" checked={form.queryType === 'simple'} onChange={() => handleInputChange('queryType', 'simple')} />
              <span style={{ fontSize: '13px', fontWeight: form.queryType === 'simple' ? '600' : '400' }}>Custom Query</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', border: `1px solid ${form.queryType === 'sql' ? 'var(--primary-color)' : 'var(--border-color)'}`, background: form.queryType === 'sql' ? 'rgba(102, 126, 234, 0.08)' : 'transparent', cursor: 'pointer' }}>
              <input type="radio" name="queryType" value="sql" checked={form.queryType === 'sql'} onChange={() => handleInputChange('queryType', 'sql')} />
              <span style={{ fontSize: '13px', fontWeight: form.queryType === 'sql' ? '600' : '400' }}>SQL Query</span>
            </label>
          </div>
        </div>

        {/* SQL Query Mode */}
        {form.queryType === 'sql' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>SQL Statement</label>
            <textarea
              className="form-input"
              value={form.sqlQuery}
              readOnly
              rows={2}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '13px', resize: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'default' }}
            />
            <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              Sample query auto-populated for {selectedTable}. In the actual implementation, the query will be fully editable with syntax highlighting and auto-complete.
            </div>
          </div>
        )}

        {/* Simple Query Mode (existing fields) */}
        {form.queryType === 'simple' && (<>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Column <span style={{ color: 'var(--accent-error)' }}>*</span></label>
          <select
            className="form-select"
            value={form.column}
            onChange={(e) => handleInputChange('column', e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '8px', borderRadius: '4px', border: `1px solid ${validationErrors.column ? 'var(--accent-error)' : 'var(--border-color)'}` }}
          >
            <option value="">Select column</option>
            {columns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
          {validationErrors.column && <div style={{ fontSize: '11px', color: 'var(--accent-error)', marginTop: '4px' }}>{validationErrors.column}</div>}
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
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Invalid Value <span style={{ color: 'var(--accent-error)' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              value={form.invalidValue}
              onChange={(e) => handleInputChange('invalidValue', e.target.value)}
              placeholder="e.g. INVALID, 9999-99-99"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: `1px solid ${validationErrors.invalidValue ? 'var(--accent-error)' : 'var(--border-color)'}` }}
            />
            {validationErrors.invalidValue && <div style={{ fontSize: '11px', color: 'var(--accent-error)', marginTop: '4px' }}>{validationErrors.invalidValue}</div>}
          </div>
        )}

        {form.action === 'set_constant' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Constant Value <span style={{ color: 'var(--accent-error)' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              value={form.constantValue}
              onChange={(e) => handleInputChange('constantValue', e.target.value)}
              placeholder="e.g. N/A, 0, UNKNOWN"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: `1px solid ${validationErrors.constantValue ? 'var(--accent-error)' : 'var(--border-color)'}` }}
            />
            {validationErrors.constantValue && <div style={{ fontSize: '11px', color: 'var(--accent-error)', marginTop: '4px' }}>{validationErrors.constantValue}</div>}
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
        </>)}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Error Name <span style={{ color: 'var(--accent-error)' }}>*</span></label>
          <input
            type="text"
            className="form-input"
            value={form.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Auto-generated from column + action — edit if needed"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: `1px solid ${validationErrors.name ? 'var(--accent-error)' : 'var(--border-color)'}` }}
          />
          {validationErrors.name && <div style={{ fontSize: '11px', color: 'var(--accent-error)', marginTop: '4px' }}>{validationErrors.name}</div>}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{err.name}</span>
                        {err.queryType === 'sql' ? (
                          <span className="badge badge-info" style={{ fontFamily: 'monospace' }}>SQL</span>
                        ) : (
                          <>
                            <span className="badge badge-info">{err.tableName}.{err.column}</span>
                            <span className="badge badge-secondary">
                              {err.action === 'set_null' ? 'NULL' : err.action === 'set_invalid' ? `Invalid: ${err.invalidValue}` : `Constant: ${err.constantValue}`}
                            </span>
                          </>
                        )}
                        <span className={`badge ${err.enabled ? 'badge-success' : 'badge-secondary'}`}>
                          {err.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <div><strong>Affected Table:</strong> {err.tableName}</div>
                        {err.queryType === 'sql' ? (
                          <div><strong>SQL Query:</strong> <code style={{ background: 'var(--bg-secondary)', padding: '2px 4px', borderRadius: '3px', fontSize: '11px' }}>{err.sqlQuery}</code></div>
                        ) : (
                          <>
                            <div><strong>Affected Column:</strong> {err.column}</div>
                            <div><strong>Affected Records:</strong> {table ? Math.round(table.records * err.percentage / 100) : '—'} records ({err.percentage}% configured)</div>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {err.queryType !== 'sql' && (
                        <>
                          <button className="btn btn-icon" onClick={() => handleEdit(err)} title="Edit">
                            <Edit size={16} />
                          </button>
                          <button className="btn btn-icon" onClick={() => onToggle(err.id)} title={err.enabled ? 'Disable' : 'Enable'}>
                            {err.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                        </>
                      )}
                      <button className="btn btn-icon" onClick={() => onDelete(err.id)} title="Remove">
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

// ----------------------------------------------------------------------------
// ValidationRulesManager (embedded in Step 5 Validation Rules tab)
// ----------------------------------------------------------------------------
const ValidationRulesManager = ({ tables, businessRules, onAddRule, onUpdateRule, onDeleteRule, onToggleRule, getCurrentTableData }) => {
  const [selectedTable, setSelectedTable] = useState(tables[0]?.name || '');
  const [ruleForm, setRuleForm] = useState({
    tableName: tables[0]?.name || '',
    column: '',
    operator: '==',
    value: '',
    errorMessage: '',
    enabled: true
  });
  const [testResult, setTestResult] = useState(null);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const currentTable = tables.find(t => t.name === selectedTable);
  // Exclude PK and FK columns — not useful for validation rules
  const columns = currentTable?.schema
    .filter(col => !col.constraint?.includes('PRIMARY KEY') && !col.constraint?.includes('FOREIGN KEY'))
    .map(col => col.name) || [];

  // Determine column type category for the selected column
  const getColumnType = (colName) => {
    const col = currentTable?.schema.find(c => c.name === colName);
    if (!col) return 'text';
    const t = col.type.toUpperCase();
    if (t.includes('DECIMAL') || t.includes('INTEGER') || t.includes('NUMERIC') || t.includes('INT') || t.includes('FLOAT')) return 'number';
    if (t.includes('DATE') || t.includes('TIMESTAMP')) return 'date';
    return 'text';
  };
  const selectedColType = getColumnType(ruleForm.column);

  // Operators available per column type
  const allOperators = [
    { value: '==', label: 'Equals (==)' },
    { value: '!=', label: 'Not equals (!=)' },
    { value: '>', label: 'Greater than (>)' },
    { value: '<', label: 'Less than (<)' },
    { value: '>=', label: 'Greater or equal (>=)' },
    { value: '<=', label: 'Less or equal (<=)' }
  ];
  const operatorsByType = {
    text: ['==', '!='],
    number: ['==', '!=', '>', '<', '>=', '<='],
    date: ['==', '!=', '>', '<', '>=', '<=']
  };
  const availableOperators = ruleForm.column
    ? allOperators.filter(op => operatorsByType[selectedColType].includes(op.value))
    : allOperators;

  useEffect(() => {
    setRuleForm(prev => ({ ...prev, tableName: selectedTable, column: '', operator: '==' }));
    setValidationErrors({});
  }, [selectedTable]);

  // Auto-generate description based on column, operator, value
  const autoGenerateDesc = (col, op, val) => {
    if (!col || !val) return '';
    const opLabels = { '==': 'must equal', '!=': 'must not equal', '>': 'must be greater than', '<': 'must be less than', '>=': 'must be at least', '<=': 'must be at most' };
    return `${col} ${opLabels[op] || op} ${val}`;
  };

  const handleInputChange = (field, value) => {
    setRuleForm(prev => {
      const next = { ...prev, [field]: value };
      // When column changes, reset operator if current operator isn't valid for the new column type
      if (field === 'column' && value) {
        const colType = getColumnType(value);
        const validOps = operatorsByType[colType];
        if (!validOps.includes(prev.operator)) {
          next.operator = '==';
        }
      }
      // Auto-populate description when column, operator, or value changes (only if not editing and desc was auto or empty)
      if ((field === 'column' || field === 'operator' || field === 'value') && !editingRuleId) {
        const col = field === 'column' ? value : next.column;
        const op = field === 'operator' ? value : prev.operator;
        const val = field === 'value' ? value : prev.value;
        const currentAutoDesc = autoGenerateDesc(prev.column, prev.operator, prev.value);
        if (!prev.errorMessage || prev.errorMessage === currentAutoDesc) {
          next.errorMessage = autoGenerateDesc(col, op, val);
        }
      }
      return next;
    });
    if (validationErrors[field]) setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const evaluateCondition = (value, operator, target) => {
    if (value === null || value === undefined) return false;
    const strValue = String(value);
    const strTarget = String(target);

    // Date detection: YYYY-MM-DD format — compare as timestamps
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(strValue) && dateRegex.test(strTarget)) {
      const dv = new Date(strValue).getTime();
      const dt = new Date(strTarget).getTime();
      if (!isNaN(dv) && !isNaN(dt)) {
        switch (operator) {
          case '==': return dv === dt;
          case '!=': return dv !== dt;
          case '>': return dv > dt;
          case '<': return dv < dt;
          case '>=': return dv >= dt;
          case '<=': return dv <= dt;
        }
      }
    }

    // Strip currency formatting ($, commas) before numeric comparison
    const cleanNum = (s) => s.replace(/[$,%]/g, '').replace(/,/g, '').trim();
    const numValue = Number(cleanNum(strValue));
    const numTarget = Number(cleanNum(strTarget));
    if (cleanNum(strValue) !== '' && cleanNum(strTarget) !== '' && !isNaN(numValue) && !isNaN(numTarget)) {
      switch (operator) {
        case '==': return numValue === numTarget;
        case '!=': return numValue !== numTarget;
        case '>': return numValue > numTarget;
        case '<': return numValue < numTarget;
        case '>=': return numValue >= numTarget;
        case '<=': return numValue <= numTarget;
      }
    }

    // String fallback (== and != only)
    switch (operator) {
      case '==': return strValue === strTarget;
      case '!=': return strValue !== strTarget;
      default: return false;
    }
  };

  const handleSubmit = () => {
    const errors = {};
    if (!ruleForm.column) errors.column = 'Please select a column';
    if (!ruleForm.value) errors.value = 'Please enter a value';
    if (!ruleForm.errorMessage) errors.errorMessage = 'Please enter an error message';
    if (Object.keys(errors).length > 0) { setValidationErrors(errors); return; }
    setValidationErrors({});

    if (editingRuleId) {
      onUpdateRule(editingRuleId, ruleForm);
      setEditingRuleId(null);
    } else {
      onAddRule(ruleForm);
    }
    setRuleForm({ tableName: selectedTable, column: '', operator: '==', value: '', errorMessage: '', enabled: true });
    setTestResult(null);
  };

  const handleEdit = (rule) => {
    setEditingRuleId(rule.id);
    setSelectedTable(rule.tableName);
    setRuleForm({ tableName: rule.tableName, column: rule.column, operator: rule.operator, value: rule.value, errorMessage: rule.errorMessage, enabled: rule.enabled });
    setValidationErrors({});
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setRuleForm({ tableName: selectedTable, column: '', operator: '==', value: '', errorMessage: '', enabled: true });
    setTestResult(null);
    setValidationErrors({});
  };

  const handleTestRule = () => {
    if (!ruleForm.column || !ruleForm.value) return;
    const data = getCurrentTableData(selectedTable, true, false);
    if (!data) return;
    const violations = data.filter(row => {
      const value = row[ruleForm.column];
      return !evaluateCondition(value, ruleForm.operator, ruleForm.value);
    });
    setTestResult({ total: data.length, violations: violations.length, sample: violations.slice(0, 3).map(row => row[ruleForm.column]) });
  };

  const filteredRules = businessRules.filter(r => r.tableName === selectedTable);

  return (
    <div>
      {/* Guidance text */}
      <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <Info size={20} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: '600', color: '#16a34a', marginBottom: '6px', fontSize: '14px' }}>
              Positive Validation — Define How Your Data Should Be
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Unlike the error tabs which <strong>deliberately inject bad data</strong>, validation rules work the other way —
              you define <strong>what correct data looks like</strong>, and the system flags any records that don&apos;t meet your criteria.
              They <strong>do not modify, correct, or filter</strong> your data in any way.
            </p>
            <div style={{ marginTop: '10px', display: 'grid', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontWeight: '700', color: '#16a34a', minWidth: '16px' }}>1.</span>
                <span><strong>Add a rule</strong> — define a condition your data should satisfy (e.g. <em>premium_amount &gt; 0</em>).</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontWeight: '700', color: '#16a34a', minWidth: '16px' }}>2.</span>
                <span><strong>Test before saving</strong> — click &quot;Test Rule&quot; to see how many records violate it, before you commit.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontWeight: '700', color: '#16a34a', minWidth: '16px' }}>3.</span>
                <span><strong>See results instantly</strong> — violating records are highlighted with a <span style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: '600', fontSize: '11px' }}>⚡ Rule Violation</span> badge in the Affected Tables Preview below and in the final Destination Preview.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table selector */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Select Table</label>
        <select
          className="form-select"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          style={{ width: '100%', maxWidth: '300px', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
        >
          {tables.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
        </select>
      </div>

      {/* Rule Builder */}
      <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '14px', color: 'var(--text-primary)' }}>
          {editingRuleId ? 'Edit Validation Rule' : 'Add Validation Rule'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>
              Column <span style={{ color: 'var(--accent-error)' }}>*</span>
            </label>
            <select
              className="form-select"
              value={ruleForm.column}
              onChange={(e) => handleInputChange('column', e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: `1px solid ${validationErrors.column ? 'var(--accent-error)' : 'var(--border-color)'}` }}
            >
              <option value="">Select column</option>
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
            {validationErrors.column && <div style={{ fontSize: '11px', color: 'var(--accent-error)', marginTop: '4px' }}>{validationErrors.column}</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Operator</label>
            <select
              className="form-select"
              value={ruleForm.operator}
              onChange={(e) => handleInputChange('operator', e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            >
              {availableOperators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>
              Value <span style={{ color: 'var(--accent-error)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={ruleForm.value}
              onChange={(e) => handleInputChange('value', e.target.value)}
              placeholder={selectedColType === 'number' ? 'e.g. 50000' : selectedColType === 'date' ? 'e.g. 2024-06-01' : 'e.g. Active'}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: `1px solid ${validationErrors.value ? 'var(--accent-error)' : 'var(--border-color)'}` }}
            />
            {validationErrors.value && <div style={{ fontSize: '11px', color: 'var(--accent-error)', marginTop: '4px' }}>{validationErrors.value}</div>}
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>
            Description / Error Message <span style={{ color: 'var(--accent-error)' }}>*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={ruleForm.errorMessage}
            onChange={(e) => handleInputChange('errorMessage', e.target.value)}
            placeholder="e.g. Premium amount must be greater than 0"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: `1px solid ${validationErrors.errorMessage ? 'var(--accent-error)' : 'var(--border-color)'}` }}
          />
          {validationErrors.errorMessage && <div style={{ fontSize: '11px', color: 'var(--accent-error)', marginTop: '4px' }}>{validationErrors.errorMessage}</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleTestRule} disabled={!ruleForm.column || !ruleForm.value} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={14} /> Test Rule
          </button>
          <div style={{ flex: 1 }} />
          {editingRuleId && (
            <button className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
          )}
          <button className="btn btn-primary" onClick={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> {editingRuleId ? 'Update Rule' : 'Add Rule'}
          </button>
        </div>

        {testResult && (
          <div className={`alert ${testResult.violations === 0 ? 'alert-success' : 'alert-warning'}`} style={{ marginTop: '12px' }}>
            <AlertCircle size={18} />
            <div>
              <strong>Test Result:</strong> {testResult.violations} of {testResult.total} records violate this rule.
              {testResult.violations > 0 && testResult.sample.length > 0 && (
                <div style={{ marginTop: '4px', fontSize: '12px' }}>Sample values: {testResult.sample.join(', ')}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rules list for selected table */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>
          Validation Rules for <em>{selectedTable}</em> ({filteredRules.length})
        </h3>
        {filteredRules.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
            No validation rules defined for this table yet. Add a rule above to check your data quality.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {filteredRules.map(rule => (
              <div key={rule.id} style={{ padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>
                        {rule.column} {rule.operator} {rule.value}
                      </span>
                      <span className={`badge ${rule.enabled ? 'badge-success' : 'badge-secondary'}`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {rule.errorMessage}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-icon" onClick={() => handleEdit(rule)} title="Edit"><Edit size={15} /></button>
                    <button className="btn btn-icon" onClick={() => onToggleRule(rule.id)} title={rule.enabled ? 'Disable' : 'Enable'}>
                      {rule.enabled ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                    <button className="btn btn-icon" onClick={() => onDeleteRule(rule.id)} title="Delete"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show all rules across tables summary */}
        {businessRules.length > filteredRules.length && (
          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(102, 126, 234, 0.06)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            You also have {businessRules.length - filteredRules.length} validation rule{businessRules.length - filteredRules.length !== 1 ? 's' : ''} on other tables. Switch the table selector above to view them.
          </div>
        )}
      </div>

    </div>
  );
};

// ============================================================================
// STEP 6 (LEGACY — no longer rendered as a separate step, kept for reference)
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
    enabled: true
  });
  const [testResult, setTestResult] = useState(null);
  const [editingRuleId, setEditingRuleId] = useState(null);

  const currentTable = tables.find(t => t.name === selectedTable);
  // Exclude PK and FK columns
  const columns = currentTable?.schema
    .filter(col => !col.constraint?.includes('PRIMARY KEY') && !col.constraint?.includes('FOREIGN KEY'))
    .map(col => col.name) || [];

  // Determine column type for operator filtering
  const getColumnType = (colName) => {
    const col = currentTable?.schema.find(c => c.name === colName);
    if (!col) return 'text';
    const t = col.type.toUpperCase();
    if (t.includes('DECIMAL') || t.includes('INTEGER') || t.includes('NUMERIC') || t.includes('INT') || t.includes('FLOAT')) return 'number';
    if (t.includes('DATE') || t.includes('TIMESTAMP')) return 'date';
    return 'text';
  };
  const selectedColType = getColumnType(ruleForm.column);
  const allOperators = [
    { value: '==', label: 'Equals (==)' },
    { value: '!=', label: 'Not equals (!=)' },
    { value: '>', label: 'Greater than (>)' },
    { value: '<', label: 'Less than (<)' },
    { value: '>=', label: 'Greater or equal (>=)' },
    { value: '<=', label: 'Less or equal (<=)' }
  ];
  const operatorsByType = { text: ['==', '!='], number: ['==', '!=', '>', '<', '>=', '<='], date: ['==', '!=', '>', '<', '>=', '<='] };
  const availableOperators = ruleForm.column
    ? allOperators.filter(op => operatorsByType[selectedColType].includes(op.value))
    : allOperators;

  useEffect(() => {
    setRuleForm(prev => ({ ...prev, tableName: selectedTable, column: '', operator: '==' }));
  }, [selectedTable]);

  const handleInputChange = (field, value) => {
    setRuleForm(prev => {
      const next = { ...prev, [field]: value };
      // When column changes, reset operator if not valid for the new type
      if (field === 'column' && value) {
        const colType = getColumnType(value);
        if (!operatorsByType[colType].includes(prev.operator)) {
          next.operator = '==';
        }
      }
      return next;
    });
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
    const strValue = String(value);
    const strTarget = String(target);

    // Date detection: YYYY-MM-DD format — compare as timestamps
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(strValue) && dateRegex.test(strTarget)) {
      const dv = new Date(strValue).getTime();
      const dt = new Date(strTarget).getTime();
      if (!isNaN(dv) && !isNaN(dt)) {
        switch (operator) {
          case '==': return dv === dt;
          case '!=': return dv !== dt;
          case '>': return dv > dt;
          case '<': return dv < dt;
          case '>=': return dv >= dt;
          case '<=': return dv <= dt;
        }
      }
    }

    // Strip currency formatting ($, commas) before numeric comparison
    const cleanNum = (s) => s.replace(/[$,%]/g, '').replace(/,/g, '').trim();
    const numValue = Number(cleanNum(strValue));
    const numTarget = Number(cleanNum(strTarget));
    if (cleanNum(strValue) !== '' && cleanNum(strTarget) !== '' && !isNaN(numValue) && !isNaN(numTarget)) {
      switch (operator) {
        case '==': return numValue === numTarget;
        case '!=': return numValue !== numTarget;
        case '>': return numValue > numTarget;
        case '<': return numValue < numTarget;
        case '>=': return numValue >= numTarget;
        case '<=': return numValue <= numTarget;
      }
    }

    // String fallback (== and != only)
    switch (operator) {
      case '==': return strValue === strTarget;
      case '!=': return strValue !== strTarget;
      default: return false;
    }
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

        <div style={{ padding: '20px', background: 'rgba(102, 126, 234, 0.08)', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Info size={20} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: '600', color: 'var(--primary-color)', marginBottom: '8px', fontSize: '14px' }}>
                What are Business Rules?
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
                Business rules are <strong>validation checks</strong> that your generated data should satisfy.
                Unlike the error injection in the previous step (which deliberately adds bad data for testing),
                business rules ensure that the generated data meets your real-world requirements.
              </p>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
                <strong>Example:</strong> If your business requires that all premium amounts must be greater than 0,
                you can add a rule: <em>policies.premium_amount &gt; 0</em>. The system will flag any records that violate this.
              </div>
              <div style={{ fontSize: '12px' }}>
                <div style={{ padding: '10px', background: 'white', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Test Rule</strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Click "Test Rule" to check how many records currently violate the rule before saving it. This helps you verify the rule logic is correct.</div>
                </div>
              </div>
            </div>
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
                {availableOperators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-dim)' }}>Value</label>
              <input
                type="text"
                className="form-input"
                value={ruleForm.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                placeholder={selectedColType === 'number' ? 'e.g. 50000' : selectedColType === 'date' ? 'e.g. 2024-06-01' : 'e.g. Active'}
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
  tables, selectedTable, onSelectTable, getCurrentTableData, getPriorityColumns, getEffectivePiiFields, errorConfig, getAffectedRecords,
  selectedSource, selectedDestination, databases, destinationDbs, onSave, savedData, onPrevious, businessRules = [], customErrors = []
}) => {
  const [currentTable, setCurrentTable] = useState(selectedTable || tables[0]?.name);
  const tableData = currentTable ? getCurrentTableData(currentTable, true) : null;
  const tableInfo = tables.find(t => t.name === currentTable);

  // CSV export state
  const [exportStatus, setExportStatus] = useState(null); // null | 'success' | 'error'

  // CSV export helper — uses File System Access API (works in sandboxed iframes) with blob fallback
  const exportToCSV = async (tableName) => {
    const data = getCurrentTableData(tableName, true);
    if (!data || data.length === 0) return;
    const cols = Object.keys(data[0]).filter(k => !k.startsWith('_'));
    const header = cols.join(',');
    const rows = data.map(row => cols.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(','));
    const csv = [header, ...rows].join('\n');
    const fileName = `${tableName}_synthetic_data.csv`;

    // Strategy 1: File System Access API (Chrome 86+, works even in sandboxed iframes)
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: 'CSV Files', accept: { 'text/csv': ['.csv'] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(csv);
        await writable.close();
        setExportStatus('success');
        setTimeout(() => setExportStatus(null), 3000);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // User cancelled the save dialog
        // Fall through to next strategy
      }
    }

    // Strategy 2: Standard blob download (works in normal Chrome/Firefox/Edge)
    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportStatus('success');
      setTimeout(() => setExportStatus(null), 3000);
    } catch (err) {
      // Strategy 3: Open CSV in new tab (user can Ctrl+S to save)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setExportStatus('success');
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const sourceDb = databases.find(db => db.id === selectedSource);
  const destDb = destinationDbs.find(db => db.id === selectedDestination);

  const totalRecords = tables.reduce((acc, t) => acc + t.records, 0);

  // Compute total error/violation records across ALL tables by actually generating the data
  const { totalErrorRecords, totalErrorsAll, totalViolationsAll } = useMemo(() => {
    let totalIssues = 0, totalErrs = 0, totalViols = 0;
    tables.forEach(table => {
      const data = getCurrentTableData(table.name, true);
      if (data) {
        totalErrs += data.filter(row => row._hasError).length;
        totalViols += data.filter(row => row._hasRuleViolation).length;
        totalIssues += data.filter(row => row._hasError || row._hasRuleViolation).length;
      }
    });
    return { totalErrorRecords: totalIssues, totalErrorsAll: totalErrs, totalViolationsAll: totalViols };
  }, [tables, getCurrentTableData, errorConfig, businessRules, customErrors]);

  const avgErrorRate = totalRecords > 0 ? ((totalErrorRecords / totalRecords) * 100).toFixed(2) : '0.00';

  // Per-table stats for the currently selected table
  const totalErrorsCurrent = tableData ? tableData.filter(row => row._hasError).length : 0;
  const totalViolationsCurrent = tableData ? tableData.filter(row => row._hasRuleViolation).length : 0;
  const totalIssuesCurrent = tableData ? tableData.filter(row => row._hasError || row._hasRuleViolation).length : 0;
  const errorPercentage = tableData ? ((totalIssuesCurrent / tableData.length) * 100).toFixed(1) : '0.0';

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
          <div className="stat-card"><div className="stat-value"><strong>{avgErrorRate}%</strong></div><div className="stat-label">Avg Issue Rate</div></div>
          <div className="stat-card">
            <div className="stat-value">
              <span style={{ color: 'var(--accent-error)' }}>{totalErrorsAll}</span>
              <span style={{ color: 'var(--text-dim)', margin: '0 4px', fontSize: '18px', fontWeight: '400' }}>/</span>
              <span style={{ color: 'var(--accent-error)' }}>{totalViolationsAll}</span>
            </div>
            <div className="stat-label">Errors / Violations</div>
          </div>
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
            const errCount = data ? data.filter(row => row._hasError).length : 0;
            const violCount = data ? data.filter(row => row._hasRuleViolation).length : 0;
            const tablePiiFields = getEffectivePiiFields ? getEffectivePiiFields(table.name) : [];
            return (
              <button key={table.name} className={`table-selector-btn ${currentTable === table.name ? 'active' : ''}`} onClick={() => { setCurrentTable(table.name); onSelectTable(table.name); }}>
                <span className="table-name">{table.name}</span>
                {tablePiiFields.length > 0 && <span style={{ fontSize: '12px', marginLeft: '2px' }} title={`${tablePiiFields.length} PII field${tablePiiFields.length > 1 ? 's' : ''}`}>🔒</span>}
                <span className="table-count">{table.records} records</span>
                {errCount > 0 && <span className="error-badge">⚠ {errCount} errors</span>}
                {violCount > 0 && <span className="error-badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#b45309' }}>⚡ {violCount} violations</span>}
              </button>
            );
          })}
        </div>

        {tableData && tableInfo && (
          <>
            <div className="alert alert-warning" style={{ marginTop: '20px' }}>
              <AlertCircle size={20} />
              <div>
                <strong>Data Quality Summary for {currentTable}:</strong>
                <div style={{ fontSize: '13px', marginTop: '6px', display: 'grid', gap: '4px' }}>
                  <div>
                    {totalIssuesCurrent} of {tableData.length} records contain issues ({errorPercentage}% issue rate).
                  </div>
                  {totalErrorsCurrent > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '14px', height: '14px', borderLeft: '3px solid var(--error, #ef4444)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '2px', flexShrink: 0 }} />
                      <span>{totalErrorsCurrent} record{totalErrorsCurrent !== 1 ? 's' : ''} with injected errors — red border + highlighted cells</span>
                    </div>
                  )}
                  {totalViolationsCurrent > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '14px', height: '14px', borderLeft: '3px solid #eab308', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '2px', flexShrink: 0 }} />
                      <span>{totalViolationsCurrent} record{totalViolationsCurrent !== 1 ? 's' : ''} that don&apos;t meet your validation rules — amber border + highlighted cells</span>
                    </div>
                  )}
                  {totalIssuesCurrent === 0 && (
                    <div style={{ color: '#16a34a' }}>All records are clean — no errors or violations detected.</div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              {(() => {
                const priorityNames = getPriorityColumns ? getPriorityColumns(currentTable) : [];
                const piiFields = getEffectivePiiFields ? getEffectivePiiFields(currentTable) : [];
                const displayCols = getDisplayColumns(tableInfo.schema, 8, priorityNames);
                return (
                  <table className="data-table">
                    <thead>
                      <tr>
                        {displayCols.map(col => (
                          <th key={col.name}>
                            {col.name}
                            {piiFields.includes(col.name) && <span style={{ marginLeft: '4px', fontSize: '10px' }}>🔒</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, idx) => {
                        const rowClasses = [
                          row._hasError ? 'row-error' : '',
                          row._hasRuleViolation ? 'row-violation' : ''
                        ].filter(Boolean).join(' ');
                        return (
                          <tr key={idx} className={rowClasses || undefined}>
                            {displayCols.map(col => {
                              const value = row[col.name];
                              const isError = row._errors && row._errors.includes(col.name);
                              const isViolationTarget = row._ruleViolations && row._ruleViolations.length > 0 && businessRules
                                .filter(r => r.enabled && row._ruleViolations.includes(r.id))
                                .some(r => r.column === col.name);
                              const isPII = piiFields.includes(col.name);
                              let cellClass = '';
                              if (isError) cellClass = 'error-cell';
                              else if (isViolationTarget) cellClass = 'rule-violation-cell';
                              return (
                                <td key={col.name} className={cellClass || undefined}>
                                  {isPII ? (
                                    <span className={`pii-highlight pii-${col.name.includes('ssn') || col.name.includes('tax') ? 'ssn' : col.name.includes('email') ? 'email' : col.name.includes('phone') ? 'phone' : col.name.includes('dob') || col.name.includes('birth') ? 'dob' : 'generic'}`}>
                                      {value}
                                    </span>
                                  ) : (
                                    value
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
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
          <button
            className={`btn ${exportStatus === 'success' ? 'btn-success' : 'btn-secondary'}`}
            onClick={() => currentTable && exportToCSV(currentTable)}
            title="Download current table as CSV file"
            disabled={!currentTable}
          >
            {exportStatus === 'success' ? <CheckCircle size={16} /> : <Download size={16} />}
            {exportStatus === 'success' ? 'Downloaded!' : 'Export CSV'}
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