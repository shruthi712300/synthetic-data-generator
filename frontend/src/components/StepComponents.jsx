import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, Info, Eye, Shield, Link as LinkIcon } from 'lucide-react';

// Step 3: Data Generation Controls
export const Step3DataGenerationControls = ({ tables, tableGenerationConfig, piiMaskingMode, onTableConfigChange, onPiiModeChange, onNext, onPrevious }) => {
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
            {tables.map(table => (
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
                      {table.piiFields && table.piiFields.length > 0 && (
                        <span className="badge badge-purple">
                          {table.piiFields.length} PII Fields
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {table.description} • {table.records} records • {table.columns} columns
                    </div>
                  </div>
                </div>

                {tableGenerationConfig[table.name] && table.piiFields && table.piiFields.length > 0 && (
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
                          checked={piiMaskingMode[table.name] === 'masked'}
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

                    <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '12px' }}>
                      <strong>PII Fields:</strong> {table.piiFields.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            ))}
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

// Step 4: Generated Data Preview with Sub-sections
export const Step4GeneratedDataPreview = ({ tables, selectedTable, onSelectTable, tableGenerationConfig, piiMaskingMode, getCurrentTableData, activeSubSection, onSubSectionChange, onNext, onPrevious }) => {
  const enabledTables = tables.filter(t => tableGenerationConfig[t.name]);
  const currentTable = selectedTable || (enabledTables.length > 0 ? enabledTables[0].name : '');
  const tableData = currentTable ? getCurrentTableData(currentTable, false) : null;
  const tableInfo = tables.find(t => t.name === currentTable);

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
              <h2 className="card-title">Generated Data Preview</h2>
              <p className="card-subtitle">
                Preview synthetic data for enabled tables with PII masking applied
              </p>
            </div>
          </div>

          <div className="table-selector">
            {enabledTables.map(table => (
              <button
                key={table.name}
                className={`table-selector-btn ${currentTable === table.name ? 'active' : ''}`}
                onClick={() => onSelectTable(table.name)}
              >
                <span className="table-name">
                  {table.name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                </span>
                <span className="table-count">{table.records} records</span>
                {table.piiFields && table.piiFields.length > 0 && (
                  <span className="pii-badge">🔒 PII</span>
                )}
              </button>
            ))}
          </div>

          {tableData && tableInfo && (
            <>
              <div className="alert alert-info" style={{ marginTop: '20px' }}>
                <Shield size={20} />
                <div>
                  <strong>Masking Mode: {piiMaskingMode[currentTable]?.toUpperCase() || 'NONE'}</strong>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>
                    {tableInfo.piiFields && tableInfo.piiFields.length > 0 
                      ? `${tableInfo.piiFields.length} PII fields masked: ${tableInfo.piiFields.join(', ')}`
                      : 'No PII fields in this table'
                    }
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {tableInfo.schema.slice(0, 8).map(col => (
                        <th key={col.name}>
                          {col.name}
                          {col.pii && <span style={{ marginLeft: '4px', fontSize: '10px' }}>🔒</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, idx) => (
                      <tr key={idx}>
                        {tableInfo.schema.slice(0, 8).map(col => {
                          const value = row[col.name];
                          const isPII = col.pii;
                          
                          return (
                            <td key={col.name}>
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
      )}

      {/* PII Detection & Masking Sub-section */}
      {activeSubSection === 'pii-config' && (
        <PIIDetectionSection tables={enabledTables} piiMaskingMode={piiMaskingMode} />
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
const PIIDetectionSection = ({ tables, piiMaskingMode }) => {
  const allPIIFields = tables.reduce((acc, table) => {
    if (table.piiFields && table.piiFields.length > 0) {
      table.piiFields.forEach(field => {
        acc.push({
          table: table.name,
          field: field,
          mode: piiMaskingMode[table.name]
        });
      });
    }
    return acc;
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">PII Detection & Masking Configuration</h2>
          <p className="card-subtitle">Automatically detected PII fields across all tables</p>
        </div>
      </div>

      <div className="alert alert-success">
        <CheckCircle size={20} />
        <div>
          <strong>✓ Auto-Detection Complete:</strong> {allPIIFields.length} PII fields detected across {tables.length} tables
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
              {allPIIFields.length}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Successfully Masked</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '4px' }}>
              100%
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Masking Coverage</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '4px' }}>
              100%
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Consistency Rate</div>
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
