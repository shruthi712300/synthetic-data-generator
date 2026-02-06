import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Save, CheckCircle, RotateCcw } from 'lucide-react';

// Step 5: Configure Data Errors
export const Step5ConfigureErrors = ({ errorConfig, behaviorRules, onErrorChange, onBehaviorChange, getAffectedTables, getAffectedRecords, tables, getCurrentTableData, onNext, onPrevious }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedErrorTable, setSelectedErrorTable] = useState('policies');

  const errorCategories = [
    {
      id: 'data-quality',
      title: 'Data Quality Issues',
      subtitle: 'Completeness, Consistency, Accuracy & Format',
      errors: [
        { key: 'missingPolicyDates', label: 'Missing Policy Effective Dates', columns: ['effective_date'] },
        { key: 'incompleteBeneficiary', label: 'Incomplete Beneficiary Info', columns: ['email', 'phone'] },
        { key: 'missingClaimAdjuster', label: 'Missing Claim Adjuster', columns: ['adjuster_id'] },
        { key: 'nullPremium', label: 'Null Premium Amounts', columns: ['premium_amount'] },
        { key: 'missingClientId', label: 'Missing Client ID', columns: ['policyholder_id'] },
        { key: 'endBeforeStart', label: 'End Date Before Start Date', columns: ['effective_date', 'expiry_date'] },
        { key: 'claimExceedsCoverage', label: 'Claim > Coverage Limit', columns: ['claim_amount'] },
        { key: 'paymentBeforeClaim', label: 'Payment Before Claim Date', columns: ['payment_date'] },
        { key: 'invalidStatusTransitions', label: 'Invalid Status Transitions', columns: ['status'] },
        { key: 'duplicatePolicyNumbers', label: 'Duplicate Policy Numbers', columns: ['policy_number'] },
        { key: 'incorrectJurisdiction', label: 'Incorrect Jurisdiction Codes', columns: ['region'] },
        { key: 'inconsistentDateFormats', label: 'Inconsistent Date Formats', columns: ['effective_date', 'claim_date'] },
        { key: 'invalidEmailFormats', label: 'Invalid Email Formats', columns: ['email'] },
        { key: 'malformedPhoneNumbers', label: 'Malformed Phone Numbers', columns: ['phone'] }
      ]
    },
    {
      id: 'business-logic',
      title: 'Business Logic & Statistical Violations',
      subtitle: 'Business rules and statistical anomalies',
      errors: [
        { key: 'overlappingPolicyPeriods', label: 'Overlapping Policy Periods', columns: ['effective_date', 'expiry_date'] },
        { key: 'claimBeforePolicyStart', label: 'Claim Before Policy Start', columns: ['claim_date'] },
        { key: 'paymentExceedsClaim', label: 'Payment > Claimed Amount', columns: ['amount'] },
        { key: 'zeroPremiumPolicies', label: 'Zero Premium Policies (Statistical)', columns: ['premium_amount'] },
        { key: 'claimExceedsCoverageLimit', label: 'Claim > Coverage (Statistical)', columns: ['claim_amount'] },
        { key: 'ageUnder18', label: 'Age Under 18 Violations (Statistical)', columns: ['date_of_birth'] },
        { key: 'claimExceedsPremiumPaid', label: 'Claim Amount > Premium Paid (Statistical)', columns: ['claim_amount'] }
      ]
    },
    {
      id: 'relationships',
      title: 'Referential Integrity & Relationships',
      subtitle: 'Foreign key and relationship violations',
      errors: [
        { key: 'orphanedClaims', label: 'Orphaned Claims', columns: ['policy_id'] },
        { key: 'paymentsWithoutClaims', label: 'Payments Without Claims', columns: ['claim_id'] },
        { key: 'claimsWithoutPolicyId', label: 'Claims Without Valid Policy ID', columns: ['policy_id'] },
        { key: 'policyWithoutClient', label: 'Policy Without Valid Client', columns: ['policyholder_id'] },
        { key: 'policyWithoutAgent', label: 'Policy Without Valid Agent', columns: ['agent_id'] }
      ]
    }
  ];

  const affectedTableData = selectedErrorTable ? getCurrentTableData(selectedErrorTable, true) : null;
  const affectedTableInfo = tables.find(t => t.name === selectedErrorTable);

  const handleResetAll = () => {
    Object.keys(errorConfig).forEach(key => {
      onErrorChange(key, 0);
    });
  };

  const calculateTotalErrors = () => {
    return Object.values(errorConfig).reduce((acc, val) => acc + val, 0);
  };

  return (
    <div className="step-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Configure Data Errors</h2>
            <p className="card-subtitle">
              Introduce controlled errors for testing data quality systems. 
              Total error rate: <strong>{calculateTotalErrors()}%</strong>
            </p>
          </div>
          <button className="btn btn-secondary" onClick={handleResetAll}>
            <RotateCcw size={16} />
            Reset All
          </button>
        </div>

        <div className="alert alert-info">
          <AlertCircle size={20} />
          <div>
            <strong>Error Configuration:</strong> Use sliders to set error percentage (0-10%) for each error type. 
            Errors will respect database constraints and relationship integrity.
          </div>
        </div>

        {/* Error Categories */}
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
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Behavior Rules Validation
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Validate realistic data patterns from source data. Adjust if values fall outside target ranges.
          </p>

          <BehaviorRuleControl
            label="Claim Rate"
            description="Percentage of policies that have claims"
            current={behaviorRules.claimRate.current}
            target={behaviorRules.claimRate.target}
            adjust={behaviorRules.claimRate.adjust}
            onAdjust={(value) => onBehaviorChange({
              ...behaviorRules,
              claimRate: { ...behaviorRules.claimRate, adjust: value }
            })}
          />

          <BehaviorRuleControl
            label="Premium Distribution"
            description="Premium amounts should follow skewed distribution"
            current={behaviorRules.premiumSkewed.current ? 'Skewed' : 'Uniform'}
            target={behaviorRules.premiumSkewed.target ? 'Skewed' : 'Uniform'}
            adjust={behaviorRules.premiumSkewed.adjust}
            isBoolean
            onAdjust={(value) => onBehaviorChange({
              ...behaviorRules,
              premiumSkewed: { ...behaviorRules.premiumSkewed, adjust: value }
            })}
          />

          <BehaviorRuleControl
            label="Seasonal Renewal Patterns"
            description="Policy renewals should cluster in Q1 and Q4"
            current={behaviorRules.seasonalRenewals.current ? 'Present' : 'Absent'}
            target={behaviorRules.seasonalRenewals.target ? 'Present' : 'Absent'}
            adjust={behaviorRules.seasonalRenewals.adjust}
            isBoolean
            onAdjust={(value) => onBehaviorChange({
              ...behaviorRules,
              seasonalRenewals: { ...behaviorRules.seasonalRenewals, adjust: value }
            })}
          />
        </div>
      </div>

      {/* Affected Tables Preview */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Affected Tables Preview</h2>
          <p className="card-subtitle">Preview data with errors introduced</p>
        </div>

        <div className="table-selector">
          {tables.map(table => {
            const tableData = getCurrentTableData(table.name, true);
            const hasErrors = tableData && tableData.some(row => row._hasError);
            
            return (
              <button
                key={table.name}
                className={`table-selector-btn ${selectedErrorTable === table.name ? 'active' : ''}`}
                onClick={() => setSelectedErrorTable(table.name)}
                disabled={!hasErrors}
              >
                <span className="table-name">{table.name}</span>
                {hasErrors && <span className="error-badge">⚠ Errors</span>}
              </button>
            );
          })}
        </div>

        {affectedTableData && affectedTableInfo && (
          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {affectedTableInfo.schema.slice(0, 8).map(col => (
                    <th key={col.name}>{col.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {affectedTableData.map((row, idx) => (
                  <tr key={idx}>
                    {affectedTableInfo.schema.slice(0, 8).map(col => {
                      const value = row[col.name];
                      const isError = row._errors && row._errors.includes(col.name);
                      
                      return (
                        <td key={col.name} className={isError ? 'error-cell' : ''}>
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onPrevious}>
          ← Previous
        </button>
        <button className="btn btn-primary" onClick={onNext}>
          Next: Preview Destination Data →
        </button>
      </div>
    </div>
  );
};

const ErrorCategorySection = ({ category, errorConfig, onErrorChange, getAffectedTables, getAffectedRecords, expanded, onToggle }) => (
  <div style={{ marginBottom: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
    <div
      onClick={onToggle}
      style={{
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: expanded ? '16px' : '0'
      }}
    >
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
          {category.title}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {category.subtitle}
        </p>
      </div>
      {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </div>

    {expanded && (
      <div style={{ display: 'grid', gap: '12px' }}>
        {category.errors.map(error => {
          const affectedTables = getAffectedTables(error.key);
          const affectedRecords = getAffectedRecords(error.key);
          
          return (
            <div
              key={error.key}
              style={{
                padding: '16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {error.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <strong>Affected Tables:</strong> {affectedTables.join(', ')}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <strong>Affected Columns:</strong> {error.columns.join(', ')}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <strong>Affected Records:</strong> {affectedRecords} records ({errorConfig[error.key]}% of total)
                  </div>
                </div>
                <div className="error-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={errorConfig[error.key] || 0}
                    onChange={(e) => onErrorChange(error.key, e.target.value)}
                    className="error-slider"
                  />
                  <span className="error-slider-value">{errorConfig[error.key] || 0}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

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
          <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
            {label}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {description}
          </div>
          <div style={{ fontSize: '13px' }}>
            <span style={{ color: 'var(--text-dim)' }}>Target:</span>{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {typeof target === 'object' ? `${target.min}-${target.max}%` : target}
            </strong>
            {' • '}
            <span style={{ color: 'var(--text-dim)' }}>Current:</span>{' '}
            <strong style={{ color: isInRange ? 'var(--success)' : 'var(--warning)' }}>
              {typeof current === 'number' ? `${current}%` : current}
            </strong>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`badge ${isInRange ? 'badge-success' : 'badge-warning'}`}>
            {isInRange ? '✓ In Range' : '⚠ Out of Range'}
          </span>
          {!isInRange && (
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={adjust}
                onChange={(e) => onAdjust(e.target.checked)}
              />
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

// Step 6: Destination Data Preview
export const Step6DestinationPreview = ({ tables, selectedTable, onSelectTable, getCurrentTableData, errorConfig, selectedSource, selectedDestination, databases, destinationDbs, onSave, savedData, onPrevious }) => {
  const [currentTable, setCurrentTable] = useState(selectedTable || tables[0]?.name);
  const tableData = currentTable ? getCurrentTableData(currentTable, true) : null;
  const tableInfo = tables.find(t => t.name === currentTable);

  const sourceDb = databases.find(db => db.id === selectedSource);
  const destDb = destinationDbs.find(db => db.id === selectedDestination);

  const totalRecords = tables.reduce((acc, t) => acc + t.records, 0);
  const totalErrors = tableData ? tableData.filter(row => row._hasError).length : 0;
  const errorPercentage = tableData ? ((totalErrors / tableData.length) * 100).toFixed(1) : 0;

  return (
    <div className="step-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Destination Data Preview</h2>
            <p className="card-subtitle">Final data with errors ready for destination database</p>
          </div>
        </div>

        <div className="alert alert-success">
          <CheckCircle size={20} />
          <div>
            <strong>Ready to Save:</strong> {totalRecords} records across {tables.length} tables with configured errors
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{tables.length}</div>
            <div className="stat-label">Tables</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalRecords}</div>
            <div className="stat-label">Total Records</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Object.values(errorConfig).reduce((a, b) => a + b, 0)}%</div>
            <div className="stat-label">Avg Error Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{errorPercentage}%</div>
            <div className="stat-label">Errors in Current Table</div>
          </div>
        </div>

        <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Configuration Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
            <div>
              <div style={{ color: 'var(--text-dim)', marginBottom: '4px' }}>Source Database:</div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{sourceDb?.name}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', marginBottom: '4px' }}>Destination Database:</div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{destDb?.name}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', marginBottom: '4px' }}>Tables Selected:</div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{tables.length} tables</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', marginBottom: '4px' }}>Total Records:</div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{totalRecords.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="table-selector" style={{ marginTop: '24px' }}>
          {tables.map(table => {
            const data = getCurrentTableData(table.name, true);
            const errors = data ? data.filter(row => row._hasError).length : 0;
            return (
              <button
                key={table.name}
                className={`table-selector-btn ${currentTable === table.name ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTable(table.name);
                  onSelectTable(table.name);
                }}
              >
                <span className="table-name">{table.name}</span>
                <span className="table-count">{table.records} records</span>
                {errors > 0 && <span className="error-badge">⚠ {errors} errors</span>}
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
                  {totalErrors} of {tableData.length} records contain errors ({errorPercentage}% error rate). 
                  Errors respect database constraints and relationships.
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    {tableInfo.schema.slice(0, 7).map(col => (
                      <th key={col.name}>{col.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr key={idx}>
                      <td>
                        {row._hasError ? (
                          <span className="badge badge-error">⚠ Error</span>
                        ) : (
                          <span className="badge badge-success">✓ Valid</span>
                        )}
                      </td>
                      {tableInfo.schema.slice(0, 7).map(col => {
                        const value = row[col.name];
                        const isError = row._errors && row._errors.includes(col.name);
                        const isPII = col.pii;
                        
                        return (
                          <td key={col.name} className={isError ? 'error-cell' : ''}>
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
          <button 
            className="btn btn-primary" 
            onClick={onSave}
            style={{ flex: 1 }}
          >
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
        <button className="btn btn-secondary" onClick={onPrevious}>
          ← Previous
        </button>
        <div></div>
      </div>
    </div>
  );
};