import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Home, Database, Box, ChevronRight, User, LogOut } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import './App.css';
import SyntheticDataDashboard from './components/SyntheticDataDashboard';
import LegacyUI from './LegacyUI';

const Layout = ({ children, showBackToHome = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

const RedirectToIndex = () => {
  window.location.href = '/index';
  return null;
};

  return (
    <div className="app-container">
      <div className="main-content no-sidebar">
        <header className="top-header">
          <div className="header-left">
            {showBackToHome && (
              <button className="back-button" onClick={() => window.location.href = '/index'}>
                ← Back to Home
              </button>
            )}
          </div>
          <div className="header-right">
            <div className="user-info">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt="profile"
                  style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8 }}
                />
              ) : (
                <User size={20} />
              )}
              <span>{user?.name || 'User'}</span>
              <button
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  marginLeft: 12,
                  cursor: 'pointer',
                  color: '#666'
                }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <Layout>
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
    </Layout>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const { loading } = useAuth();
  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={<LegacyUI page="login.html" />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/index" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/index"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/connectors"
        element={
          <ProtectedRoute>
            <LegacyUI page="connectors.html" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/connection-status"
        element={
          <ProtectedRoute>
            <LegacyUI page="connection-status.html" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/available-destination"
        element={
          <ProtectedRoute>
            <LegacyUI page="available-destination.html" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/index"
        element={
          <ProtectedRoute>
            <LegacyUI page="index.html" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/synthetic-data"
        element={
          <ProtectedRoute>
            <Layout showBackToHome={true}>
              <SyntheticDataDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<LegacyUI />} />
    </Routes>
  );
};

export default App;