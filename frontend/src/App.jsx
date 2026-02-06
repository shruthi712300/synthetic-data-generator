import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, Database, Box, ChevronRight, Menu, User } from 'lucide-react';
import './App.css';
import SyntheticDataDashboard from './components/SyntheticDataDashboard';
import LegacyUI from './LegacyUI';

const Layout = ({ children, showBackToHome = false }) => {
  const navigate = useNavigate();
  
  return (
    <div className="app-container">
      {/* No sidebar - just main content */}
      <div className="main-content no-sidebar">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            {showBackToHome && (
              <button className="back-button" onClick={() => navigate('/home')}>
                ← Back to Home
              </button>
            )}
          </div>
          <div className="header-right">
            <div className="user-info">
              <User size={20} />
              <span>Admin</span>
            </div>
          </div>
        </header>
        
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

// New component for Step Indicator
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Source & Destination' },
    { id: 2, label: 'Database Selection' },
    { id: 3, label: 'Detected Schema' },
    { id: 4, label: 'Configure Generation' },
    { id: 5, label: 'Preview Errors' },
    { id: 6, label: 'Preview' }
  ];
  
  return (
    <div className="step-indicator-container">
      <div className="step-indicator">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`step-item ${currentStep === step.id ? 'current' : currentStep > step.id ? 'active' : ''}`}>
              <div className="step-circle">{step.id}</div>
              <div className="step-label">{step.label}</div>
            </div>
            {index < steps.length - 1 && <div className="step-line"></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// New component for Database Selection
const DatabaseSelection = () => {
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  
  const sourceDatabases = [
    { id: 1, name: 'Production Insurance DB', status: 'CONNECTED', type: 'ORACLE' },
    { id: 2, name: 'Production Policies & Claims DB', status: 'CONNECTED', type: 'ORACLE' },
    { id: 3, name: 'Production Policy Master DB', status: 'CONNECTED', type: 'PostgreSQL Server' },
  ];
  
  const destinationDatabases = [
    { id: 1, name: 'Development Insurance DB', status: 'READY', type: 'ORACLE' },
    { id: 2, name: 'QA Policies & Claims DB', status: 'READY', type: 'ORACLE' },
    { id: 3, name: 'Development Policy Master DB', status: 'READY', type: 'PostgreSQL Server' },
  ];
  
  return (
    <div className="database-selection-container">
      <h2>Source & Destination Database Selection</h2>
      <p className="section-subtitle">Select source (Production) and destination (Dev/QA) databases</p>
      
      <div className="database-grid">
        <div className="database-column">
          <h3>Source Database (Production)</h3>
          <div className="database-cards">
            {sourceDatabases.map(db => (
              <div 
                key={db.id} 
                className={`database-card ${selectedSource === db.id ? 'selected' : ''}`}
                onClick={() => setSelectedSource(db.id)}
              >
                <div className="database-name">{db.name}</div>
                <div className="database-status connected">{db.status}</div>
                <div className="database-type">{db.type}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="database-column">
          <h3>Destination Database (Dev/QA)</h3>
          <div className="database-cards">
            {destinationDatabases.map(db => (
              <div 
                key={db.id} 
                className={`database-card ${selectedDestination === db.id ? 'selected' : ''}`}
                onClick={() => setSelectedDestination(db.id)}
              >
                <div className="database-name">{db.name}</div>
                <div className="database-status ready">{db.status}</div>
                <div className="database-type">{db.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="step-actions">
        <button className="btn btn-secondary">Previous</button>
        <button className="btn btn-primary">Next</button>
      </div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="app-container">
      <div className="main-content no-sidebar">
        <header className="top-header">
          <div className="header-left">
            {/* No back button on home page */}
          </div>
          <div className="header-right">
            <div className="user-info">
              <User size={20} />
              <span>Admin</span>
            </div>
          </div>
        </header>
        
        <main className="content-area">
          <div className="welcome-section">
            <div className="welcome-header">
              <span className="wave-emoji">👋</span>
              <h1>Welcome to Your AI-Driven Data Engineering Workspace with Synthetic Data Generator</h1>
            </div>
            
            <p className="welcome-description">
              A smarter way to build, transform, and deliver data pipelines — fast, intelligent, and code-optional. 
              Let GenAI and an <strong>Synthetic Data Generator</strong> Framework automate the heavy lifting while you focus on insights.
            </p>
            
            <button className="cta-button" onClick={() => navigate('/synthetic-data')}>
              Get Started Now <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <Database size={32} />
              </div>
              <h3>Add Your Diverse Data Sources</h3>
              <p>Connect to files, databases, APIs, and apps seamlessly.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                <ChevronRight size={32} />
              </div>
              <h3>Connect Your Destination</h3>
              <p>Define where your data will land (e.g., Snowflake, BigQuery).</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                <Box size={32} />
              </div>
              <h3>Universal Data Integration</h3>
              <p>Streamlined ingestion for structured & unstructured sources.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      {/* Start with login page */}
      <Route path="/" element={<LegacyUI page="login.html" />} />
      <Route path="/login" element={<LegacyUI page="login.html" />} />
      
      {/* After login, go to home/dashboard */}
      <Route path="/home" element={<LegacyUI page="index.html" />} />
      <Route path="/index" element={<LegacyUI page="index.html" />} />
      <Route path="/connectors" element={<LegacyUI page="connectors.html" />} />
      <Route path="/connection-status" element={<LegacyUI page="connection-status.html" />} />
      <Route path="/available-destination" element={<LegacyUI page="available-destination.html" />} />
      
      {/* React Synthetic Data Dashboard */}
      <Route path="/synthetic-data" element={
        <Layout showBackToHome={true}>
          <SyntheticDataDashboard />
        </Layout>
      } />
      
      {/* Add a catch-all route for legacy navigation */}
      <Route path="*" element={<LegacyUI />} />
    </Routes>
  );
}; 

export default App;