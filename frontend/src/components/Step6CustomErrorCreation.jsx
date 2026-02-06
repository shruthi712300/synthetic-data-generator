import React, { useState } from 'react';
import { PlusCircle, Sparkles, Trash2, Copy, AlertCircle, Brain, Lightbulb, Wand2, RefreshCw, Calculator, Zap, TrendingUp, PieChart, BarChart } from 'lucide-react';

const Step6CustomErrorCreation = ({ 
  errorConfig, 
  onErrorChange, 
  tables,
  onNext, 
  onPrevious 
}) => {
  const [customErrors, setCustomErrors] = useState([]);
  const [activeTab, setActiveTab] = useState('custom');
  const [newError, setNewError] = useState({
    name: '',
    description: '',
    affectedTables: [],
    condition: '',
    percentage: 0,
    severity: 'medium'
  });
  
  // Enhanced AI Suggestions with mathematical explanations
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      id: 'sug1',
      title: 'Premium Payment Delays',
      description: 'Identify policies with premium payments delayed by more than 30 days',
      confidence: '95%',
      affectedTables: ['policies', 'payments'],
      suggestedCondition: "payment_date > effective_date + INTERVAL '30 days'",
      implementation: 'Add payment delay flag to policies table',
      formula: 'Delay_Days = DATEDIFF(payment_date, effective_date)',
      equation: 'D ≥ 30, where D = Delay_Days',
      explanation: 'Payment delay calculated as the difference between payment date and policy effective date. Policies with delay ≥ 30 days are flagged.'
    },
    {
      id: 'sug2',
      title: 'Agent Commission Discrepancies',
      description: 'Detect inconsistencies in agent commission calculations based on premium and coverage amounts',
      confidence: '88%',
      affectedTables: ['agent_employee_brokers', 'policies'],
      suggestedCondition: "ABS(calculated_commission - (premium_amount * commission_rate)) > 100",
      implementation: 'Add commission audit table with validation rules',
      formula: 'Commission_Error = |Actual_Commission - Expected_Commission|',
      equation: 'E > $100, where E = |C_actual - (P × r)|',
      explanation: 'Expected commission calculated as premium (P) × commission rate (r). Discrepancies > $100 indicate calculation errors.'
    },
    {
      id: 'sug3',
      title: 'Policy Renewal Anomalies',
      description: 'Flag policies renewed multiple times within short periods indicating potential fraud',
      confidence: '92%',
      affectedTables: ['policies'],
      suggestedCondition: "renewal_count > 3 AND DATEDIFF(current_renewal, previous_renewal) < 30",
      implementation: 'Add suspicious renewal tracking with time-series analysis',
      formula: 'Renewal_Frequency = Count(Renewals) / Time_Period',
      equation: 'R > 3 AND Δt < 30, where Δt = days between renewals',
      explanation: 'High renewal frequency (R>3) with short intervals (Δt<30 days) may indicate gaming of renewal bonuses.'
    },
    {
      id: 'sug4',
      title: 'Beneficiary Age Validation',
      description: 'Validate beneficiary ages against policy minimum and maximum age requirements',
      confidence: '96%',
      affectedTables: ['beneficiaries', 'policies'],
      suggestedCondition: "EXTRACT(YEAR FROM AGE(date_of_birth)) NOT BETWEEN policy_min_age AND policy_max_age",
      implementation: 'Add age validation rules with policy-specific constraints',
      formula: 'Age = Current_Year - Birth_Year',
      equation: 'Age ∉ [A_min, A_max]',
      explanation: 'Beneficiary age must fall within policy-defined minimum (A_min) and maximum (A_max) age brackets.'
    },
    {
      id: 'sug5',
      title: 'Claim to Premium Ratio Anomaly',
      description: 'Identify policies where claim amounts disproportionately exceed premiums paid',
      confidence: '89%',
      affectedTables: ['policies', 'claims'],
      suggestedCondition: "claim_amount > (premium_amount * 10)",
      implementation: 'Add claim-to-premium ratio monitoring',
      formula: 'Claim_Ratio = Σ(Claims) / Σ(Premiums)',
      equation: 'CR > 10, where CR = Total_Claims / Total_Premiums',
      explanation: 'Ratios > 10 indicate claims exceeding premiums by 10x, suggesting potential over-claiming or under-pricing.'
    },
    {
      id: 'sug6',
      title: 'Geographic Risk Concentration',
      description: 'Detect excessive policy concentration in high-risk geographic regions',
      confidence: '85%',
      affectedTables: ['policies'],
      suggestedCondition: "COUNT(*) OVER (PARTITION BY region) > 50",
      implementation: 'Add geographic risk distribution analysis',
      formula: 'Concentration_Index = Policies_in_Region / Total_Policies',
      equation: 'C_i > 0.25, where C_i = n_region / N_total',
      explanation: 'Regional concentration > 25% of total policies indicates geographic risk concentration requiring reinsurance consideration.'
    }
  ]);

  // Initial state for reset
  const initialNewError = {
    name: '',
    description: '',
    affectedTables: [],
    condition: '',
    percentage: 0,
    severity: 'medium'
  };

  const handleAddCustomError = () => {
    if (!newError.name || !newError.condition) {
      alert('Please provide error name and condition');
      return;
    }

    const errorId = `custom_${Date.now()}`;
    const error = {
      id: errorId,
      name: newError.name,
      description: newError.description,
      affectedTables: newError.affectedTables,
      condition: newError.condition,
      percentage: newError.percentage,
      severity: newError.severity,
      type: 'custom',
      createdAt: new Date().toISOString()
    };

    setCustomErrors([...customErrors, error]);
    
    // Add to errorConfig
    onErrorChange(errorId, newError.percentage);
    
    // Reset form
    setNewError(initialNewError);
  };

  const handleRemoveCustomError = (errorId) => {
    setCustomErrors(customErrors.filter(err => err.id !== errorId));
    // Remove from errorConfig
    onErrorChange(errorId, 0);
  };

  const handleApplyAiSuggestion = (suggestion) => {
    const errorId = `ai_${suggestion.id}_${Date.now()}`;
    
    // Create custom error from AI suggestion
    const customError = {
      id: errorId,
      name: suggestion.title,
      description: suggestion.description,
      affectedTables: suggestion.affectedTables,
      condition: suggestion.suggestedCondition,
      percentage: 0, // Default to 0%
      severity: 'high',
      type: 'ai',
      implementation: suggestion.implementation,
      formula: suggestion.formula,
      equation: suggestion.equation,
      explanation: suggestion.explanation,
      appliedAt: new Date().toISOString()
    };

    setCustomErrors([...customErrors, customError]);
    onErrorChange(errorId, 0);
  };

  const handleTableSelect = (tableName) => {
    const isSelected = newError.affectedTables.includes(tableName);
    if (isSelected) {
      setNewError({
        ...newError,
        affectedTables: newError.affectedTables.filter(name => name !== tableName)
      });
    } else {
      setNewError({
        ...newError,
        affectedTables: [...newError.affectedTables, tableName]
      });
    }
  };

  // Reset all data
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all custom errors and AI suggestions? This action cannot be undone.')) {
      // Reset all custom errors in errorConfig
      customErrors.forEach(error => {
        onErrorChange(error.id, 0);
      });
      
      // Clear local state
      setCustomErrors([]);
      setNewError(initialNewError);
      setActiveTab('custom');
      
      // Show confirmation
      alert('All custom errors and AI suggestions have been reset successfully!');
    }
  };

  return (
    <div className="step-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Custom Error Creation & AI Suggestions</h2>
            <p className="card-subtitle">Create custom error rules and get AI-powered error suggestions</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Reset Button */}
            <button
              onClick={handleReset}
              style={{
                background: '#f8f9fa',
                color: '#dc3545',
                border: '1px solid #dc3545',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dc3545';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.color = '#dc3545';
              }}
              title="Reset all custom errors and AI suggestions"
            >
              <RefreshCw size={16} />
              Reset All
            </button>
            <Brain size={20} color="#667eea" />
            <Wand2 size={20} color="#764ba2" />
          </div>
        </div>

        {/* Stats Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              {customErrors.length}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              Total Errors
            </div>
          </div>
          <div style={{
            background: '#f0f9ff',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0369a1' }}>
              {customErrors.filter(err => err.type === 'custom').length}
            </div>
            <div style={{ fontSize: '12px', color: '#0369a1' }}>
              Custom Rules
            </div>
          </div>
          <div style={{
            background: '#f0fdf4',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#15803d' }}>
              {customErrors.filter(err => err.type === 'ai').length}
            </div>
            <div style={{ fontSize: '12px', color: '#15803d' }}>
              AI Suggestions
            </div>
          </div>
          <div style={{
            background: '#fef3c7',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #fcd34d'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#92400e' }}>
              {customErrors.filter(err => err.severity === 'critical').length}
            </div>
            <div style={{ fontSize: '12px', color: '#92400e' }}>
              Critical Errors
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation" style={{ marginBottom: '24px' }}>
          <button 
            className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <PlusCircle size={16} />
            Custom Error Creation
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <Sparkles size={16} />
            AI-Driven Suggestions
          </button>
        </div>

        {/* Custom Error Creation Tab */}
        {activeTab === 'custom' && (
          <div>
            <div className="alert alert-info">
              <Lightbulb size={20} />
              <div>
                <strong>Create Custom Error Rules</strong> - Define specific error conditions for your synthetic data generation. 
                All created rules persist until you click the Reset button.
              </div>
            </div>

            {/* Custom Error Form */}
            <div className="card" style={{ marginBottom: '24px', background: '#f8fafc' }}>
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calculator size={18} />
                  Create New Error Rule
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Error Name *
                    </label>
                    <input
                      type="text"
                      value={newError.name}
                      onChange={(e) => setNewError({...newError, name: e.target.value})}
                      placeholder="e.g., Premium Payment Delay"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Severity Level
                    </label>
                    <select
                      value={newError.severity}
                      onChange={(e) => setNewError({...newError, severity: e.target.value})}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    >
                      <option value="low">Low - Minor data quality issue</option>
                      <option value="medium">Medium - Moderate impact</option>
                      <option value="high">High - Significant impact</option>
                      <option value="critical">Critical - Business-critical error</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Description
                  </label>
                  <textarea
                    value={newError.description}
                    onChange={(e) => setNewError({...newError, description: e.target.value})}
                    placeholder="Describe the error condition, business impact, and detection method..."
                    rows="3"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Affected Tables
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tables.map(table => (
                      <button
                        key={table.name}
                        type="button"
                        onClick={() => handleTableSelect(table.name)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          background: newError.affectedTables.includes(table.name) ? '#667eea' : 'white',
                          color: newError.affectedTables.includes(table.name) ? 'white' : '#374151',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!newError.affectedTables.includes(table.name)) {
                            e.currentTarget.style.borderColor = '#667eea';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!newError.affectedTables.includes(table.name)) {
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }
                        }}
                      >
                        {table.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Error Condition (SQL-like) *
                  </label>
                  <textarea
                    value={newError.condition}
                    onChange={(e) => setNewError({...newError, condition: e.target.value})}
                    placeholder="e.g., effective_date > expiry_date OR premium_amount <= 0"
                    rows="3"
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: '6px', 
                      border: '1px solid #d1d5db',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      backgroundColor: '#f9fafb'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Affected Records: <span style={{ color: '#667eea', fontWeight: '700' }}>{newError.percentage}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newError.percentage}
                    onChange={(e) => setNewError({...newError, percentage: parseInt(e.target.value)})}
                    style={{ width: '100%', height: '6px', borderRadius: '3px', background: '#e5e7eb' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                <button
                  onClick={handleAddCustomError}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    margin: '0 auto',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(102, 126, 234, 0.2)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <PlusCircle size={18} />
                  Add Custom Error Rule
                </button>
              </div>
            </div>

            {/* Custom Errors List */}
            {customErrors.filter(err => err.type === 'custom').length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart size={18} />
                  Custom Error Rules ({customErrors.filter(err => err.type === 'custom').length})
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {customErrors.filter(err => err.type === 'custom').map(error => (
                    <div key={error.id} className="error-rule-card" style={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '700', fontSize: '15px', color: '#1f2937' }}>{error.name}</span>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              background: error.severity === 'critical' ? '#fef2f2' : 
                                        error.severity === 'high' ? '#fffbeb' :
                                        error.severity === 'medium' ? '#eff6ff' : '#f0fdf4',
                              color: error.severity === 'critical' ? '#dc2626' : 
                                    error.severity === 'high' ? '#d97706' :
                                    error.severity === 'medium' ? '#2563eb' : '#059669'
                            }}>
                              {error.severity}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                            {error.description}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            fontFamily: 'monospace', 
                            background: '#f9fafb', 
                            padding: '12px', 
                            borderRadius: '8px',
                            borderLeft: '4px solid #667eea'
                          }}>
                            {error.condition}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveCustomError(error.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                          title="Remove this error rule"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        paddingTop: '12px',
                        borderTop: '1px solid #f3f4f6',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        <div>
                          <strong>Affected Tables:</strong> {error.affectedTables.join(', ')}
                        </div>
                        <div>
                          <strong>Records Affected:</strong> <span style={{ color: '#667eea', fontWeight: '600' }}>{error.percentage}%</span>
                        </div>
                        <div>
                          <strong>Created:</strong> {new Date(error.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Suggestions Tab */}
        {activeTab === 'ai' && (
          <div>
            <div className="alert alert-success" style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <Sparkles size={20} color="#059669" />
              <div>
                <strong style={{ fontSize: '14px' }}>AI-Powered Error Suggestions</strong> 
                <div style={{ fontSize: '13px', marginTop: '4px' }}>
                  Smart error detection based on your schema patterns, mathematical modeling, and industry best practices.
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {aiSuggestions.map(suggestion => {
                const isApplied = customErrors.some(err => err.type === 'ai' && err.name === suggestion.title);
                
                return (
                  <div key={suggestion.id} className="ai-suggestion-card" style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '8px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Brain size={18} color="white" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: '700', fontSize: '15px', color: '#1f2937' }}>{suggestion.title}</span>
                              <span style={{
                                padding: '2px 8px',
                                background: '#dbeafe',
                                color: '#1e40af',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: '600'
                              }}>
                                {suggestion.confidence} confidence
                              </span>
                              {isApplied && (
                                <span style={{
                                  padding: '2px 8px',
                                  background: '#d1fae5',
                                  color: '#065f46',
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  fontWeight: '600'
                                }}>
                                  <CheckCircle size={10} style={{ marginRight: '4px' }} />
                                  Applied
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                              {suggestion.description}
                            </div>
                          </div>
                        </div>
                        
                        {/* Mathematical Information Grid */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(2, 1fr)', 
                          gap: '16px',
                          marginBottom: '16px'
                        }}>
                          <div style={{
                            background: '#f0f9ff',
                            padding: '12px',
                            borderRadius: '8px',
                            borderLeft: '4px solid #3b82f6'
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e40af', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calculator size={12} />
                              Mathematical Formula
                            </div>
                            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#1e40af' }}>
                              {suggestion.formula}
                            </div>
                          </div>
                          
                          <div style={{
                            background: '#fef3c7',
                            padding: '12px',
                            borderRadius: '8px',
                            borderLeft: '4px solid #d97706'
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#92400e', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <TrendingUp size={12} />
                              Error Condition
                            </div>
                            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#92400e' }}>
                              {suggestion.equation}
                            </div>
                          </div>
                          
                          <div style={{
                            background: '#f0fdf4',
                            padding: '12px',
                            borderRadius: '8px',
                            borderLeft: '4px solid #10b981'
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#065f46', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <PieChart size={12} />
                              Implementation
                            </div>
                            <div style={{ fontSize: '12px', color: '#065f46' }}>
                              {suggestion.implementation}
                            </div>
                          </div>
                          
                          <div style={{
                            background: '#f5f3ff',
                            padding: '12px',
                            borderRadius: '8px',
                            borderLeft: '4px solid #8b5cf6'
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Zap size={12} />
                              Explanation
                            </div>
                            <div style={{ fontSize: '12px', color: '#7c3aed' }}>
                              {suggestion.explanation}
                            </div>
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '500', color: '#4b5563', marginBottom: '8px' }}>
                            <strong>Affected Tables:</strong>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {suggestion.affectedTables.map(table => (
                              <span key={table} style={{ 
                                padding: '6px 12px', 
                                background: '#e5e7eb', 
                                borderRadius: '6px', 
                                fontSize: '11px',
                                fontWeight: '500',
                                color: '#374151'
                              }}>
                                {table}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '500', color: '#4b5563', marginBottom: '8px' }}>
                            <strong>SQL Condition:</strong>
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            fontFamily: 'monospace', 
                            background: '#1f2937', 
                            color: '#e5e7eb',
                            padding: '12px', 
                            borderRadius: '8px',
                            wordBreak: 'break-all'
                          }}>
                            {suggestion.suggestedCondition}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleApplyAiSuggestion(suggestion)}
                        disabled={isApplied}
                        style={{
                          padding: '10px 20px',
                          background: isApplied ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: isApplied ? 'not-allowed' : 'pointer',
                          opacity: isApplied ? 0.7 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease',
                          boxShadow: isApplied ? 'none' : '0 2px 4px rgba(102, 126, 234, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isApplied) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isApplied) {
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                        title={isApplied ? 'This suggestion has already been applied' : 'Add this AI suggestion as a custom error rule'}
                      >
                        <Copy size={14} />
                        {isApplied ? '✓ Applied Successfully' : 'Apply AI Suggestion'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Applied AI Errors */}
            {customErrors.filter(err => err.type === 'ai').length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#8b5cf6" />
                  Applied AI Suggestions ({customErrors.filter(err => err.type === 'ai').length})
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {customErrors.filter(err => err.type === 'ai').map(error => (
                    <div key={error.id} className="error-rule-card" style={{
                      background: 'white',
                      border: '2px solid #8b5cf6',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <Brain size={18} color="#8b5cf6" />
                            <span style={{ fontWeight: '700', fontSize: '15px', color: '#7c3aed' }}>{error.name}</span>
                            <span style={{
                              padding: '4px 10px',
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              AI Powered
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                            {error.description}
                          </div>
                          
                          {error.formula && (
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(2, 1fr)', 
                              gap: '12px',
                              marginBottom: '12px'
                            }}>
                              <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c3aed', marginBottom: '4px' }}>
                                  Mathematical Model
                                </div>
                                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#7c3aed' }}>
                                  {error.formula}
                                </div>
                              </div>
                              <div style={{ background: '#f0f9ff', padding: '10px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: '#0369a1', marginBottom: '4px' }}>
                                  Explanation
                                </div>
                                <div style={{ fontSize: '12px', color: '#0369a1' }}>
                                  {error.explanation}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {error.implementation && (
                            <div style={{ 
                              fontSize: '12px', 
                              background: '#f0f9ff', 
                              padding: '10px', 
                              borderRadius: '6px',
                              marginTop: '8px'
                            }}>
                              <strong style={{ color: '#0369a1' }}>Implementation:</strong> {error.implementation}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveCustomError(error.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                          title="Remove this AI suggestion"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        paddingTop: '12px',
                        borderTop: '1px solid #f3f4f6',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        <div>
                          <strong>Affected Tables:</strong> {error.affectedTables.join(', ')}
                        </div>
                        <div>
                          <strong>Records Affected:</strong> <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{errorConfig[error.id] || 0}%</span>
                        </div>
                        <div>
                          <strong>Applied:</strong> {new Date(error.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="step-actions" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button className="btn btn-secondary" onClick={onPrevious} style={{
          padding: '10px 24px',
          background: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ← Previous
        </button>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {customErrors.length > 0 && `(${customErrors.length} error rules configured)`}
        </div>
        <button className="btn btn-primary" onClick={onNext} style={{
          padding: '10px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          Next: Destination Preview & Save →
        </button>
      </div>
    </div>
  );
};

export default Step6CustomErrorCreation;