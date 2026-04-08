import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './auth/Login';
import './Landing.css';

const Landing = () => {
  const [activeLogin, setActiveLogin] = useState(null);
  const navigate = useNavigate();

  if (activeLogin) {
    return <Login preSelectedRole={activeLogin} />;
  }

  return (
    <div className="landing-container">
      {/* Header with branding */}
      <header className="landing-header">
        <div className="logo">
          <span className="logo-icon">📋</span>
          <h1>EMAR</h1>
          <p>Electronic Medical Records</p>
        </div>
      </header>

      {/* Main content */}
      <main className="landing-main">
        <h2 className="landing-title">Welcome to EMAR</h2>
        <p className="landing-subtitle">Secure access to your medical records</p>

        {/* Login options */}
        <div className="login-options">
          {/* Patient Login */}
          <div
            className="login-card patient-card"
            onClick={() => setActiveLogin('patient')}
          >
            <div className="card-icon">👤</div>
            <h3>Patient Login</h3>
            <p>Access your medical records and health information</p>
            <button className="card-button patient-button">
              Login as Patient
            </button>
          </div>

          {/* Doctor Login */}
          <div
            className="login-card doctor-card"
            onClick={() => setActiveLogin('doctor')}
          >
            <div className="card-icon">👨‍⚕️</div>
            <h3>Doctor Login</h3>
            <p>Review patient records and manage approvals</p>
            <button className="card-button doctor-button">
              Login as Doctor
            </button>
          </div>
        </div>

        {/* Secret portals section */}
        <div className="secret-portals">
          <p className="secret-text">Other Access Points:</p>
          <div className="secret-buttons">
            <button
              className="secret-button"
              onClick={() => navigate('/staff-login-8X92pQ')}
              title="Hospital Staff Portal"
            >
              🏥 Staff
            </button>
            <button
              className="secret-button"
              onClick={() => navigate('/admin-login-7K4jL9')}
              title="Admin Portal"
            >
              ⚙️ Admin
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2026 EMAR System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
