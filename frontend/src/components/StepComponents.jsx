import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, Info, Eye, Shield, Link as LinkIcon, Edit } from 'lucide-react';

// Step 3: Data Generation Controls
export const Step3DataGenerationControls = ({ tables, tableGenerationConfig, piiMaskingMode, onTableConfigChange, onPiiModeChange, onOpenPiiModal, getEffectivePiiFields, onNext, onPrevious }) => {
  const handleToggleTable = (tableName) => {
    onTableConfigChange({
      ...tableGenerationConfig,
      [tableName]: !tableGenerationConfig[tableName]
    });
  };

  const handlePiiModeChange = (tableName, mode) => {
    onPiiModeChange({
      ...piiMaskingMode,
      [tableName]: mode
    });
  };

  const getModeDescription = (mode) => {
    switch (mode) {
      case 'masked':
        return 'Prod structure + masked values for PII (fastest adoption)';
      case 'synthetic':
        return 'Entire dataset generated statistically (highest privacy)';
      case 'hybrid':
        return 'Keep safe non-sensitive fields + synthesize sensitive/high-risk columns';
      case 'none':
        return 'No PII fields in this table';
      default:
        return '';
    }
  };

  return (
    <div className="step-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Data Generation Controls</h2>
            <p className="card-subtitle">Configure table-level and PII masking strategies</p>
          </div>
        </div>

        <div className="alert alert-info">
          <Info size={20} />
          <div>
            <strong>Configuration Modes:</strong> Control which tables to generate and how to handle PII data.
            Select masking strategy for each table based on your privacy requirements.
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Table-Level Controls
          </h3>

          <div style={{ display: 'grid', gap: '16px' }}>
            {tables.map(table => {
              const effectivePii = getEffectivePiiFields ? getEffectivePiiFields(table.name) : (table.piiFields || []);
              const hasPii = effectivePii.length > 0;
              return (
              <div key={table.name} className="generation-control-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={tableGenerationConfig[table.name]}
                      onChange={() => handleToggleTable(table.name)}
                    />
                    <span className="toggle-slider"></span>
                  </label>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>
                        {table.name}
                      </span>
                      <span className={`badge ${tableGenerationConfig[table.name] ? 'badge-success' : 'badge-secondary'}`}>
                        {tableGenerationConfig[table.name] ? 'Enabled' : 'Disabled'}
                      </span>
                      {hasPii && (
                        <span className="badge badge-purple">
                          {effectivePii.length} PII Field{effectivePii.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {table.description} • {table.records} records • {table.columns} columns
                    </div>
                  </div>
                </div>

                {/* PII Masking Strategy — shown when table is enabled AND has effective PII fields */}
                {tableGenerationConfig[table.name] && hasPii && (
                  <div style={{ marginLeft: '60px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>
                      PII Masking Strategy
                    </div>

                    <div style={{ display: 'grid', gap: '8px' }}>
                      <label className="pii-mode-option">
                        <input
                          type="radio"
                          name={`pii-${table.name}`}
                          value="masked"
                          checked={piiMaskingMode[table.name] === 'masked' || (!piiMaskingMode[table.name] || piiMaskingMode[table.name] === 'none')}
                          onChange={() => handlePiiModeChange(table.name, 'masked')}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Masked Copy</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Prod structure + masked values for PII (fastest adoption)
                          </div>
                        </div>
                      </label>

                      <label className="pii-mode-option">
                        <input
                          type="radio"
                          name={`pii-${table.name}`}
                          value="synthetic"
                          checked={piiMaskingMode[table.name] === 'synthetic'}
                          onChange={() => handlePiiModeChange(table.name, 'synthetic')}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Fully Synthetic</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Entire dataset generated statistically (highest privacy)
                          </div>
                        </div>
                      </label>

                      <label className="pii-mode-option">
                        <input
                          type="radio"
                          name={`pii-${table.name}`}
                          value="hybrid"
                          checked={piiMaskingMode[table.name] === 'hybrid'}
                          onChange={() => handlePiiModeChange(table.name, 'hybrid')}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Hybrid</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Keep safe non-sensitive fields + synthesize sensitive/high-risk columns
                          </div>
                        </div>
                      </label>
                    </div>

                    <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>PII Fields:</strong> {effectivePii.join(', ')}
                      </div>
                      {onOpenPiiModal && (
                        <button
                          className="btn btn-primary"
                          onClick={() => onOpenPiiModal(table.name)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px' }}
                        >
                          <Edit size={14} />
                          Customize PII Fields
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Show PII override button for tables with NO effective PII fields */}
                {tableGenerationConfig[table.name] && !hasPii && onOpenPiiModal && (
                  <div style={{ marginLeft: '60px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ padding: '12px', background: 'rgba(102, 126, 234, 0.08)', borderRadius: '6px', border: '1px dashed rgba(102, 126, 234, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        No PII fields configured. If this table contains sensitive data, you can manually mark fields as PII.
                      </span>
                      <button
                        className="btn btn-primary"
                        onClick={() => onOpenPiiModal(table.name)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                      >
                        <Edit size={14} />
                        Mark PII Fields
                      </button>
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onPrevious}>
          ← Previous
        </button>
        <button className="btn btn-primary" onClick={onNext}>
          Next: Preview Generated Data →
        </button>
      </div>
    </div>
  );
};

// Helper: select display columns ensuring priority columns (PII, custom errors) are always visible
const getDisplayColumns = (schema, maxCols, priorityNames = []) => {
  const priorityCols = schema.filter(col => priorityNames.includes(col.name));
  const otherCols = schema.filter(col => !priorityNames.includes(col.name));
  const slotsForOthers = Math.max(0, maxCols - priorityCols.length);
  const selectedOthers = otherCols.slice(0, slotsForOthers);
  const selectedNames = new Set([...priorityCols.map(c => c.name), ...selectedOthers.map(c => c.name)]);
  return schema.filter(col => selectedNames.has(col.name));
};

// Step 4: Generated Data Preview with Sub-sections
export const Step4GeneratedDataPreview = ({ tables, selectedTable, onSelectTable, tableGenerationConfig, piiMaskingMode, getCurrentTableData, getEffectivePiiFields, activeSubSection, onSubSectionChange, onNext, onPrevious }) => {
  const enabledTables = tables.filter(t => tableGenerationConfig[t.name]);
  const currentTable = selectedTable || (enabledTables.length > 0 ? enabledTables[0].name : '');
  const tableData = currentTable ? getCurrentTableData(currentTable, false) : null;
  const tableInfo = tables.find(t => t.name === currentTable);

  // Calculate total PII fields (auto-detected only, for reference)
  const autoDetectedPIIFields = tables.reduce((acc, table) => {
    if (table.piiFields && table.piiFields.length > 0) {
      table.piiFields.forEach(field => {
        acc.push({ table: table.name, field, mode: piiMaskingMode[table.name] });
      });
    }
    return acc;
  }, []);

  // Calculate effective PII fields (auto + user-configured)
  const allEffectivePIIFields = getEffectivePiiFields ? tables.reduce((acc, table) => {
    const effectiveFields = getEffectivePiiFields(table.name);
    effectiveFields.forEach(field => {
      const isAutoDetected = table.piiFields && table.piiFields.includes(field);
      acc.push({ table: table.name, field, mode: piiMaskingMode[table.name], isAutoDetected, isUserAdded: !isAutoDetected });
    });
    return acc;
  }, []) : autoDetectedPIIFields;

  // Compute user additions and removals
  const userAddedPII = allEffectivePIIFields.filter(f => f.isUserAdded);
  const userRemovedPII = autoDetectedPIIFields.filter(auto =>
    !allEffectivePIIFields.some(eff => eff.table === auto.table && eff.field === auto.field)
  );

  const subSections = [
    { id: 'data', label: 'Generated Data', icon: Eye },
    { id: 'pii-config', label: 'PII Detection & Masking', icon: Shield },
    { id: 'compliance', label: 'Compliance', icon: AlertCircle },
    { id: 'relationships', label: 'Relationships', icon: LinkIcon }
  ];

  return (
    <div className="step-container">
      {/* Sub-section tabs */}
      <div className="subsection-tabs">
        {subSections.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              className={`subsection-tab ${activeSubSection === section.id ? 'active' : ''}`}
              onClick={() => onSubSectionChange(section.id)}
            >
              <Icon size={16} />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Data Preview Sub-section */}
      {activeSubSection === 'data' && (

        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  🤖
                </div>
                <h2 className="card-title" style={{ marginBottom: 0 }}>AI-Generated Data Preview</h2>
              </div>
              <p className="card-subtitle">
                I've generated {enabledTables.reduce((acc, t) => acc + t.records, 0)} realistic records across {enabledTables.length} tables 
                based on schema analysis, data type constraints, and corporate insurance domain patterns
              </p>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            border: '1px solid var(--primary-color)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              ✨
          </div>

          <div>
            <div style={{ fontWeight: '600', color: 'var(--primary-color)', marginBottom: '8px', fontSize: '14px' }}>
              AI Data Generation Complete
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              I've analyzed your schema constraints (PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE) and generated
              statistically realistic data for the corporate insurance domain. All {allEffectivePIIFields.length} PII fields
              ({autoDetectedPIIFields.length} auto-detected{userAddedPII.length > 0 ? `, ${userAddedPII.length} added by you` : ''}{userRemovedPII.length > 0 ? `, ${userRemovedPII.length} removed by you` : ''})
              have been masked using format-preserving techniques while maintaining referential integrity
              across all tables.
            </div>
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: 'white',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <span>✓ Schema-compliant data</span>
              <span>✓ Realistic business patterns</span>
              <span>✓ {allEffectivePIIFields.length} PII fields masked</span>
              <span>✓ Referential integrity maintained</span>
            </div>
          </div>
        </div>

        <div className="table-selector">
          {enabledTables.map(table => {
            const effectivePii = getEffectivePiiFields ? getEffectivePiiFields(table.name) : (table.piiFields || []);
            return (
              <button
                key={table.name}
                className={`table-selector-btn ${currentTable === table.name ? 'active' : ''}`}
                onClick={() => onSelectTable(table.name)}
              >
                <span className="table-name">
                  {table.name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                </span>
                <span className="table-count">{table.records} records</span>
                {effectivePii.length > 0 && (
                  <span className="pii-badge">🔒 PII</span>
                )}
              </button>
            );
          })}
        </div>

          {tableData && tableInfo && (
            <>
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                border: '1px solid var(--success)',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '20px',
                display: 'flex',
                gap: '12px'
              }}>
                <Shield size={20} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                {(() => {
                  const effectivePii = getEffectivePiiFields ? getEffectivePiiFields(currentTable) : (tableInfo.piiFields || []);
                  const autoPii = tableInfo.piiFields || [];
                  const userAdded = effectivePii.filter(f => !autoPii.includes(f));
                  const userRemoved = autoPii.filter(f => !effectivePii.includes(f));
                  const maskingStrategy = piiMaskingMode[currentTable] === 'masked' ? 'format-preserving tokenization' :
                    piiMaskingMode[currentTable] === 'synthetic' ? 'fully synthetic generation' :
                    'hybrid masking with safe field retention';
                  return (
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--success)', marginBottom: '4px', fontSize: '14px' }}>
                        🔒 PII Masking: {piiMaskingMode[currentTable]?.toUpperCase() || 'NONE'} — {effectivePii.length} field{effectivePii.length !== 1 ? 's' : ''} masked
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {effectivePii.length > 0 ? (
                          <>
                            {autoPii.length > 0 && (
                              <div>AI auto-detected: <strong>{autoPii.filter(f => effectivePii.includes(f)).join(', ') || 'none remaining'}</strong></div>
                            )}
                            {userAdded.length > 0 && (
                              <div style={{ color: 'var(--primary-color)' }}>+ You added: <strong>{userAdded.join(', ')}</strong></div>
                            )}
                            {userRemoved.length > 0 && (
                              <div style={{ color: 'var(--accent-error)' }}>− You removed: <strong>{userRemoved.join(', ')}</strong></div>
                            )}
                            <div style={{ marginTop: '4px' }}>Masked using {maskingStrategy}. All values maintain consistency across related records.</div>
                          </>
                        ) : (
                          'No PII fields configured for this table — data generated based on business constraints only.'
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                {(() => {
                  const piiPriority = getEffectivePiiFields ? getEffectivePiiFields(currentTable) : [];
                  const displayCols = getDisplayColumns(tableInfo.schema, 8, piiPriority);
                  return (
                    <table className="data-table">
                      <thead>
                        <tr>
                          {displayCols.map(col => {
                            const isEffectivePii = piiPriority.includes(col.name);
                            return (
                              <th key={col.name}>
                                {col.name}
                                {isEffectivePii && <span style={{ marginLeft: '4px', fontSize: '10px' }}>🔒</span>}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, idx) => (
                          <tr key={idx}>
                            {displayCols.map(col => {
                              const value = row[col.name];
                              const isEffectivePii = piiPriority.includes(col.name);
                              return (
                                <td key={col.name}>
                                  {isEffectivePii ? (
                                    <span className={`pii-highlight pii-${col.name.includes('ssn') || col.name.includes('tax') ? 'ssn' : col.name.includes('email') ? 'email' : col.name.includes('phone') ? 'phone' : 'dob'}`}>
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
                  );
                })()}
              </div>
            </>
          )}
        </div>
      )}

      {/* PII Detection & Masking Sub-section */}
      {activeSubSection === 'pii-config' && (
        <PIIDetectionSection tables={enabledTables} piiMaskingMode={piiMaskingMode} getEffectivePiiFields={getEffectivePiiFields} />
      )}

      {/* Compliance Sub-section */}
      {activeSubSection === 'compliance' && (
        <ComplianceSection />
      )}

      {/* Relationships Sub-section */}
      {activeSubSection === 'relationships' && (
        <RelationshipsSection />
      )}

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onPrevious}>
          ← Previous
        </button>
        <button className="btn btn-primary" onClick={onNext}>
          Next: Configure Data Errors →
        </button>
      </div>
    </div>
  );
};

// PII Detection Section Component
const PIIDetectionSection = ({ tables, piiMaskingMode, getEffectivePiiFields }) => {
  // Build effective PII list (auto-detected + user-configured)
  const allPIIFields = tables.reduce((acc, table) => {
    const effectiveFields = getEffectivePiiFields ? getEffectivePiiFields(table.name) : (table.piiFields || []);
    const autoFields = table.piiFields || [];
    effectiveFields.forEach(field => {
      const isAutoDetected = autoFields.includes(field);
      acc.push({
        table: table.name,
        field: field,
        mode: piiMaskingMode[table.name],
        source: isAutoDetected ? 'auto' : 'user'
      });
    });
    return acc;
  }, []);

  const autoCount = allPIIFields.filter(f => f.source === 'auto').length;
  const userCount = allPIIFields.filter(f => f.source === 'user').length;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">PII Detection & Masking Configuration</h2>
          <p className="card-subtitle">Auto-detected and user-configured PII fields across all tables</p>
        </div>
      </div>

      <div className="alert alert-success">
        <CheckCircle size={20} />
        <div>
          <strong>✓ PII Configuration:</strong> {allPIIFields.length} PII fields across {tables.length} tables
          ({autoCount} auto-detected{userCount > 0 ? `, ${userCount} added by you` : ''})
        </div>
      </div>

      <div className="pii-legend">
        <div className="pii-legend-item">
          <div className="pii-legend-color" style={{ background: '#3b82f6' }}></div>
          <span><strong>SSN / Tax ID</strong> - Social Security & Tax Identifiers</span>
        </div>
        <div className="pii-legend-item">
          <div className="pii-legend-color" style={{ background: '#10b981' }}></div>
          <span><strong>Email</strong> - Email Addresses</span>
        </div>
        <div className="pii-legend-item">
          <div className="pii-legend-color" style={{ background: '#f59e0b' }}></div>
          <span><strong>Phone</strong> - Phone Numbers</span>
        </div>
        <div className="pii-legend-item">
          <div className="pii-legend-color" style={{ background: '#8b5cf6' }}></div>
          <span><strong>DOB</strong> - Date of Birth</span>
        </div>
      </div>

      <h3 style={{ margin: '30px 0 20px', fontSize: '16px', color: 'var(--text-primary)' }}>
        PII Field Classification
      </h3>

      <table className="data-table">
        <thead>
          <tr>
            <th>Table</th>
            <th>Field</th>
            <th>Source</th>
            <th>Detected Type</th>
            <th>Masking Strategy</th>
            <th>Preview</th>
          </tr>
        </thead>
        <tbody>
          {allPIIFields.map((pii, idx) => {
            const piiType = pii.field.includes('ssn') || pii.field.includes('tax') ? 'SSN/Tax ID' :
                           pii.field.includes('email') ? 'Email' :
                           pii.field.includes('phone') ? 'Phone' :
                           pii.field.includes('dob') || pii.field.includes('birth') ? 'DOB' :
                           'Bank Account';

            const preview = pii.field.includes('ssn') || pii.field.includes('tax') ? 'XXX-XX-6789' :
                           pii.field.includes('email') ? 'j.smith@synthmail.com' :
                           pii.field.includes('phone') ? '(555) 789-0123' :
                           pii.field.includes('dob') || pii.field.includes('birth') ? '1987-03-22' :
                           '****1234';

            return (
              <tr key={idx}>
                <td><strong>{pii.table}</strong></td>
                <td>{pii.field}</td>
                <td>
                  {pii.source === 'auto' ? (
                    <span className="badge badge-info" style={{ fontSize: '10px' }}>Auto-detected</span>
                  ) : (
                    <span className="badge badge-purple" style={{ fontSize: '10px' }}>User-configured</span>
                  )}
                </td>
                <td>
                  <span className={`pii-highlight pii-${pii.field.includes('ssn') || pii.field.includes('tax') ? 'ssn' : pii.field.includes('email') ? 'email' : pii.field.includes('phone') ? 'phone' : 'dob'}`}>
                    {piiType}
                  </span>
                </td>
                <td>
                  <span className="badge badge-purple">
                    {pii.mode === 'masked' ? 'Format-preserving' :
                     pii.mode === 'synthetic' ? 'Fully Synthetic' :
                     pii.mode === 'hybrid' ? 'Hybrid' : 'N/A'}
                  </span>
                </td>
                <td>
                  <span className={`pii-highlight pii-${pii.field.includes('ssn') || pii.field.includes('tax') ? 'ssn' : pii.field.includes('email') ? 'email' : pii.field.includes('phone') ? 'phone' : 'dob'}`}>
                    {preview}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: '30px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-primary)' }}>
          Masking Summary
        </h3>
        <div className="stats-grid">
          <div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '4px' }}>
              {allPIIFields.length}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Total PII Fields</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '4px' }}>
              {autoCount}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Auto-detected</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '4px' }}>
              {userCount}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>User-configured</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '4px' }}>
              100%
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Masking Coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compliance Section Component
const ComplianceSection = () => (
  <div className="card">
    <div className="card-header">
      <div>
        <h2 className="card-title">Compliance Violations & Error Patterns</h2>
        <p className="card-subtitle">Common compliance issues in corporate insurance data</p>
      </div>
    </div>

    <div className="alert alert-warning">
      <AlertCircle size={20} />
      <div>
        <strong>Compliance Monitoring:</strong> These are typical compliance violations found in corporate insurance 
        data that can be introduced for testing data quality and validation systems.
      </div>
    </div>

    <div style={{ display: 'grid', gap: '20px', marginTop: '24px' }}>
      <ComplianceRuleCard
        title="Agent License Validation"
        description="Agents cannot sell policies when their license has expired"
        violation="Expired agent license at policy inception"
        impact="Policies sold after agent license expiry date"
        tables={['policies', 'agent_employee_brokers', 'training_certification']}
        example="Agent license expired: 2023-11-15 | Policy sold: 2024-01-20 (66 days after expiry)"
      />

      <ComplianceRuleCard
        title="Regional Certification Requirements"
        description="Agents must have proper certifications for the region where policy is sold"
        violation="Missing regional certification"
        impact="Policies sold in regions where agent is not certified"
        tables={['policies', 'training_certification', 'region_regulatory_rules']}
        example="Policy region: California | Agent certified: Texas, Nevada only"
      />

      <ComplianceRuleCard
        title="Policy Type Regulatory Compliance"
        description="Policy types must be allowed in the region per regulatory rules"
        violation="Invalid policy type for region"
        impact="Policies with types not permitted in specific regions"
        tables={['policies', 'region_regulatory_rules']}
        example="Policy type: Cyber Insurance | Region: State X (not allowed by state regulations)"
      />

      <ComplianceRuleCard
        title="Underwriting Approval Requirements"
        description="Underwriters must have required certifications for policy approval"
        violation="Underwriting without required credentials"
        impact="Policies approved by underwriters lacking proper credentials"
        tables={['policies', 'training_certification']}
        example="High-risk D&O policy approved by underwriter without specialized D&O certification"
      />
    </div>

    <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '8px', border: '1px solid var(--primary-color)' }}>
      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--primary-color)' }}>
        💡 Testing Best Practices
      </h4>
      <ul style={{ marginLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
        <li>Introduce 2-5% compliance violations for realistic testing scenarios</li>
        <li>Use higher percentages (10-20%) for stress testing validation systems</li>
        <li>Compliance violations help test regulatory reporting and audit trails</li>
        <li>Combine with relationship errors to test cascade validation logic</li>
      </ul>
    </div>
  </div>
);

const ComplianceRuleCard = ({ title, description, violation, impact, tables, example }) => (
  <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
          {title}
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{description}</p>
      </div>
      <span className="badge badge-error">Violation</span>
    </div>

    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '4px' }}>
            VIOLATION TYPE
          </div>
          <div style={{ fontSize: '13px', color: 'var(--accent-error)' }}>{violation}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '4px' }}>
            IMPACT
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{impact}</div>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '4px' }}>
          AFFECTED TABLES
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tables.map(table => (
            <span key={table} className="badge badge-info" style={{ fontSize: '11px' }}>
              {table}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '4px' }}>
          EXAMPLE
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
          {example}
        </div>
      </div>
    </div>
  </div>
);

// Relationships Section Component
const RelationshipsSection = () => (
  <div className="card">
    <div className="card-header">
      <div>
        <h2 className="card-title">Relationship Integrity & Orphaned Records</h2>
        <p className="card-subtitle">Referential integrity violations and broken relationships</p>
      </div>
    </div>

    <div className="alert alert-warning">
      <LinkIcon size={20} />
      <div>
        <strong>Referential Integrity Testing:</strong> These relationship violations help test foreign key 
        constraints, cascade deletes, and data integrity validation logic.
      </div>
    </div>

    <div style={{ display: 'grid', gap: '20px', marginTop: '24px' }}>
      <RelationshipErrorCard
        title="Orphaned Claims / Claims Without Valid Policy ID"
        description="Claims that reference non-existent or deleted policy records"
        tables={['claims', 'policies']}
        foreignKey="policy_id"
        violation="Claim exists but referenced policy_id not found in policies table"
        examples={[
          'CLM-2024-009876: policy_id = "POL-9999-XXXX" (not found)',
          'CLM-2024-012345: policy_id = NULL',
          'CLM-2024-015432: policy_id = "POL-2020-001234" (expired/deleted)'
        ]}
        impact="Cannot determine coverage, premiums, or policyholder for claim processing"
      />

      <RelationshipErrorCard
        title="Payments Without Claims"
        description="Payment records that don't link to any valid claim record"
        tables={['payments', 'claims']}
        foreignKey="claim_id"
        violation="Payment exists but claim_id is NULL or references non-existent claim"
        examples={[
          'PAY-2024-003456: claim_id = NULL (orphaned payment)',
          'PAY-2024-007890: claim_id = "CLM-9999-XXXX" (not found)',
          'PAY-2024-011234: claim_id references deleted claim'
        ]}
        impact="Cannot reconcile payments with claims, breaks settlement tracking"
      />

      <RelationshipErrorCard
        title="Policy Without Valid Client"
        description="Policies that reference non-existent policyholder records"
        tables={['policies', 'policyholders']}
        foreignKey="policyholder_id"
        violation="Policy exists but policyholder_id not found in policyholders table"
        examples={[
          'POL-2024-008765: policyholder_id = "PH-9999" (not found)',
          'POL-2024-009123: policyholder_id = NULL',
          'POL-2024-010456: policyholder_id references deleted company'
        ]}
        impact="Cannot identify who the policy covers, breaks billing and communications"
      />

      <RelationshipErrorCard
        title="Policy Without Valid Agent"
        description="Policies that reference non-existent agent records"
        tables={['policies', 'agent_employee_brokers']}
        foreignKey="agent_id"
        violation="Policy exists but agent_id not found in agent_employee_brokers table"
        examples={[
          'POL-2024-003456: agent_id = "AG-9999" (not found)',
          'POL-2024-007890: agent_id = NULL',
          'POL-2024-012345: agent_id references terminated agent'
        ]}
        impact="Cannot determine commission, servicing agent, or sales attribution"
      />
    </div>

    <div style={{ marginTop: '30px' }}>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
        Relationship Integrity Scorecard
      </h4>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>Relationship</th>
            <th>Tables</th>
            <th>Foreign Key</th>
            <th>Expected Integrity</th>
            <th>Constraint Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Policy → Policyholder</strong></td>
            <td>policies → policyholders</td>
            <td>policyholder_id</td>
            <td><span className="badge badge-success">99%+</span></td>
            <td>FOREIGN KEY REQUIRED</td>
          </tr>
          <tr>
            <td><strong>Policy → Agent</strong></td>
            <td>policies → agent_employee_brokers</td>
            <td>agent_id</td>
            <td><span className="badge badge-success">99%+</span></td>
            <td>FOREIGN KEY REQUIRED</td>
          </tr>
          <tr>
            <td><strong>Claim → Policy</strong></td>
            <td>claims → policies</td>
            <td>policy_id</td>
            <td><span className="badge badge-success">98%+</span></td>
            <td>FOREIGN KEY REQUIRED</td>
          </tr>
          <tr>
            <td><strong>Payment → Policy</strong></td>
            <td>payments → policies</td>
            <td>policy_id</td>
            <td><span className="badge badge-success">99%+</span></td>
            <td>FOREIGN KEY REQUIRED</td>
          </tr>
          <tr>
            <td><strong>Payment → Claim</strong></td>
            <td>payments → claims</td>
            <td>claim_id</td>
            <td><span className="badge badge-warning">95%+</span></td>
            <td>OPTIONAL (premiums vs settlements)</td>
          </tr>
          <tr>
            <td><strong>Agent → Certification</strong></td>
            <td>training_certification → agent_employee_brokers</td>
            <td>agent_id</td>
            <td><span className="badge badge-success">97%+</span></td>
            <td>FOREIGN KEY REQUIRED</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const RelationshipErrorCard = ({ title, description, tables, foreignKey, violation, examples, impact }) => (
  <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
    <div style={{ marginBottom: '12px' }}>
      <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
        {title}
      </h4>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{description}</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '8px' }}>
          AFFECTED TABLES
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {tables.map(table => (
            <span key={table} className="badge badge-info" style={{ fontSize: '11px' }}>
              {table}
            </span>
          ))}
        </div>

        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '8px' }}>
          FOREIGN KEY
        </div>
        <div style={{ fontSize: '13px', color: 'var(--primary-color)', fontFamily: 'monospace' }}>
          {foreignKey}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '8px' }}>
          VIOLATION
        </div>
        <div style={{ fontSize: '13px', color: 'var(--accent-error)', marginBottom: '16px' }}>
          {violation}
        </div>

        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '8px' }}>
          IMPACT
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {impact}
        </div>
      </div>
    </div>

    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '8px' }}>
        EXAMPLES
      </div>
      <div style={{ display: 'grid', gap: '6px' }}>
        {examples.map((example, idx) => (
          <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '6px 8px', background: 'var(--bg-secondary)', borderRadius: '4px', fontFamily: 'monospace' }}>
            └─ {example}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export { PIIDetectionSection, ComplianceSection, RelationshipsSection };