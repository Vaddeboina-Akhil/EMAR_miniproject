import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTPEmail, generateOTP } from '../../utils/emailService';
import { setUser } from '../../utils/auth';
import { api } from '../../services/api';

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState('patient');
  const [displayRole, setDisplayRole] = useState('patient');
  const [animState, setAnimState] = useState('idle');
  const [slideDir, setSlideDir] = useState('left');
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);   // base64
  const [imagePreview, setImagePreview] = useState(null);   // preview URL
  const navigate = useNavigate();

  const roleColors = {
    patient: { panel: '#1E4D35', button: '#2ECC71' },
    doctor:  { panel: '#1A237E', button: '#2979FF' },
  };
  const color = roleColors[selectedRole];

  // ── Slide animation ──────────────────────────────────────────
  const handleRoleChange = (newRole) => {
    if (newRole === selectedRole || animState !== 'idle') return;
    const dir = newRole === 'doctor' ? 'left' : 'right';
    setSlideDir(dir);
    setAnimState('exit');
    setSelectedRole(newRole);
    setFormData({});
    setProfileImage(null);
    setImagePreview(null);
    setTimeout(() => {
      setDisplayRole(newRole);
      setAnimState('enter');
      setTimeout(() => setAnimState('idle'), 350);
    }, 300);
  };

  const getAnimStyle = () => {
    if (animState === 'exit')
      return { animation: `slideOut${slideDir === 'left' ? 'Left' : 'Right'} 0.3s ease forwards` };
    if (animState === 'enter')
      return { animation: `slideIn${slideDir === 'left' ? 'Right' : 'Left'} 0.35s ease forwards` };
    return {};
  };

  // ── Image handler ─────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);   // base64
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ── Fields ────────────────────────────────────────────────────
  const patientFields = [
    { key: 'name',            label: 'Full Name',        type: 'text',     placeholder: 'Enter your full name' },
    { key: 'dob',             label: 'Date of Birth',    type: 'date' },
    { key: 'aadhaarId',       label: 'Aadhaar ID',       type: 'text',     placeholder: '1234-5678-1234' },
    { key: 'email',           label: 'Email Address',    type: 'email',    placeholder: 'your@email.com' },
    { key: 'phone',           label: 'Phone Number',     type: 'tel',      placeholder: '9876543210' },
    { key: 'bloodGroup',      label: 'Blood Group',      type: 'select',   options: ['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
    { key: 'allergies',       label: 'Allergies',        type: 'text',     placeholder: 'e.g. Penicillin, Nuts (comma separated)' },
    { key: 'guardianContact', label: 'Guardian Contact', type: 'tel',      placeholder: '9876543210' },
    { key: 'password',        label: 'Password',         type: 'password', placeholder: '••••••••' },
    { key: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
  ];

  const doctorFields = [
    { key: 'name',           label: 'Full Name',       type: 'text',     placeholder: 'Dr. Full Name' },
    { key: 'dob',            label: 'Date of Birth',   type: 'date' },
    { key: 'licenseId',      label: 'License ID',      type: 'text',     placeholder: 'MED123456' },
    { key: 'specialization', label: 'Specialization',  type: 'select',   options: ['General Medicine','Cardiologist','Gynecologist','Orthopedic','Neurologist','Pediatrician','Dermatologist','Other'] },
    { key: 'hospitalName',   label: 'Hospital Name',   type: 'text',     placeholder: 'Yashoda Hospital' },
    { key: 'email',          label: 'Email Address',   type: 'email',    placeholder: 'doctor@email.com' },
    { key: 'phone',          label: 'Phone Number',    type: 'tel',      placeholder: '9876543210' },
    { key: 'password',       label: 'Password',        type: 'password', placeholder: '••••••••' },
    { key: 'confirmPassword',label: 'Confirm Password',type: 'password', placeholder: '••••••••' },
  ];

  const fields = selectedRole === 'patient' ? patientFields : doctorFields;

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ── Signup / OTP ──────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.email)    return alert('Email is required');
    if (!formData.password) return alert('Password is required');
    if (formData.password !== formData.confirmPassword) return alert('Passwords do not match!');
    if (formData.password.length < 6) return alert('Password must be at least 6 characters!');
    const otp = generateOTP();
    try {
      await sendOTPEmail(formData.email, formData.name, otp);
      setOtpSent(otp);
      setStep(2);
      alert('OTP sent to your email!');
    } catch (error) {
      alert('Error sending OTP. Please try again.');
      console.error(error);
    }
  };

  const handleVerify = async () => {
    if (otpInput !== otpSent) { alert('Invalid OTP. Please try again.'); return; }
    try {
      if (selectedRole === 'patient') {
        const result = await api.post('/auth/patient/register', {
          name: formData.name, dob: formData.dob, aadhaarId: formData.aadhaarId,
          email: formData.email, phone: formData.phone, password: formData.password,
          bloodGroup: formData.bloodGroup, allergies: formData.allergies,
          guardianContact: formData.guardianContact,
          profileImage: profileImage || null   // ✅ send base64
        });
        if (result.token) {
          localStorage.setItem('emar_token', result.token);
          setUser(result.user);
          navigate('/patient/dashboard');
        } else { alert(result.message || 'Signup failed'); }
        return;
      }
      const result = await api.post('/auth/doctor/register', {
        name: formData.name, dob: formData.dob, licenseId: formData.licenseId,
        specialization: formData.specialization, hospitalName: formData.hospitalName,
        email: formData.email, phone: formData.phone, password: formData.password,
        profileImage: profileImage || null     // ✅ send base64
      });
      if (result.token) {
        localStorage.setItem('emar_token', result.token);
        setUser(result.user);
        navigate('/doctor/overview');
      } else { alert(result.message || 'Signup failed'); }
    } catch (error) { alert(error.message || 'Signup failed'); }
  };

  const roleTabs = [
    { key: 'patient', icon: '👤', label: 'Patient' },
    { key: 'doctor',  icon: '🏥', label: 'Doctor'  },
  ];

  const inputStyle = {
    width: '100%', padding: '14px 22px', borderRadius: '50px',
    backgroundColor: 'rgba(255,255,255,0.18)', border: 'none',
    color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
  };

  const selectStyle = {
    ...inputStyle,
    backgroundColor: color.panel,
    border: '1.5px solid rgba(255,255,255,0.4)',
    cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>{`
        @keyframes slideOutLeft  { from{opacity:1;transform:translateX(0)}   to{opacity:0;transform:translateX(-70px)} }
        @keyframes slideOutRight { from{opacity:1;transform:translateX(0)}   to{opacity:0;transform:translateX(70px)}  }
        @keyframes slideInRight  { from{opacity:0;transform:translateX(70px)} to{opacity:1;transform:translateX(0)}    }
        @keyframes slideInLeft   { from{opacity:0;transform:translateX(-70px)}to{opacity:1;transform:translateX(0)}    }
        input::placeholder { color: rgba(255,255,255,0.55) !important; }
        select option { background: ${color.panel}; color: white; }
        @media (max-width: 768px) {
          .auth-left  { display: none !important; }
          .auth-right { margin-left:0 !important; width:100% !important; padding:40px 24px !important; }
        }
      `}</style>

      {/* ── LEFT SIDE ── */}
      <div className="auth-left" style={{
        position: 'fixed', left: 0, top: 0,
        width: '45%', height: '100vh',
        backgroundColor: '#F0F4F8', overflow: 'hidden', zIndex: 1
      }}>
        {/* Logo */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, ...getAnimStyle() }}>
          <img
            src={displayRole === 'patient' ? '/images/logo-green.png' : '/images/logo-blue.png'}
            alt="EMAR" style={{ height: '25px', objectFit: 'contain' }}
          />
        </div>

        {/* White blob */}
        <svg viewBox="0 0 500 700" preserveAspectRatio="none" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1
        }}>
          <path d="M0,0 L350,0 Q500,150 480,350 Q460,550 350,700 L0,700 Z" fill="white" />
        </svg>

        {/* Illustration */}
        <div style={{
          position: 'absolute', zIndex: 2,
          top: '50%', left: '35%', transform: 'translate(-50%, -50%)',
          textAlign: 'center', width: '280px',
          ...getAnimStyle()
        }}>
          <img
            src={displayRole === 'patient' ? '/images/patient-illustration.png' : '/images/doctor-illustration.png'}
            alt="illustration" style={{ width: '150%', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* ── RIGHT SIDE ── */}
      <div className="auth-right" style={{
        marginLeft: '45%', width: '55%', height: '100vh', overflowY: 'auto',
        backgroundColor: color.panel, padding: '48px 60px', boxSizing: 'border-box',
        transition: 'background-color 0.4s',
        display: 'flex', flexDirection: 'column',
        justifyContent: step === 2 ? 'center' : 'flex-start',
      }}>
        <h1 style={{
          fontSize: '48px', fontWeight: '900', color: 'white',
          marginBottom: '24px', marginTop: '20px'
        }}>
          {step === 1 ? 'Signup as' : 'Verify Your Email'}
        </h1>

        {step === 1 ? (
          <>
            {/* Role Tabs */}
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50px',
              padding: '4px', display: 'flex', marginBottom: '28px', width: 'fit-content'
            }}>
              {roleTabs.map(tab => (
                <div key={tab.key} onClick={() => handleRoleChange(tab.key)} style={{
                  backgroundColor: selectedRole === tab.key ? 'white' : 'transparent',
                  color: selectedRole === tab.key ? color.panel : 'white',
                  padding: '10px 22px', borderRadius: '50px',
                  fontWeight: selectedRole === tab.key ? 'bold' : 'normal',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: '8px', fontSize: '15px', transition: 'all 0.25s'
                }}>
                  {tab.icon} {tab.label}
                </div>
              ))}
            </div>

            {/* ── Profile Image Upload ── */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Preview circle */}
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '2px dashed rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '28px' }}>👤</span>
                )}
              </div>

              {/* Upload button */}
              <div>
                <label htmlFor="profileImageInput" style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '1.5px solid rgba(255,255,255,0.5)',
                  borderRadius: '50px', padding: '10px 20px',
                  color: 'white', fontSize: '14px', fontWeight: 'bold',
                  cursor: 'pointer', display: 'inline-block'
                }}>
                  📷 Upload Profile Photo
                </label>
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <div style={{
                  fontSize: '12px', color: 'rgba(255,255,255,0.55)',
                  marginTop: '6px'
                }}>
                  Optional · Max 2MB · JPG/PNG
                </div>
                {imagePreview && (
                  <div
                    onClick={() => { setProfileImage(null); setImagePreview(null); }}
                    style={{
                      fontSize: '12px', color: 'rgba(255,100,100,0.9)',
                      marginTop: '4px', cursor: 'pointer', textDecoration: 'underline'
                    }}
                  >
                    Remove photo
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} style={{
              display: 'flex', flexDirection: 'column',
              gap: '14px', paddingBottom: '40px'
            }}>
              {fields.map(field => (
                <div key={field.key}>
                  <label style={{
                    color: 'white', fontWeight: 'bold',
                    fontSize: '14px', marginBottom: '6px', display: 'block'
                  }}>
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select name={field.key} onChange={handleFormChange} style={selectStyle} required>
                      <option value="" style={{ background: color.panel, color: 'white' }}>
                        Select {field.label}
                      </option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt} style={{ background: color.panel, color: 'white' }}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={field.key} type={field.type}
                      placeholder={field.placeholder}
                      onChange={handleFormChange}
                      style={inputStyle} required
                    />
                  )}
                </div>
              ))}

              <button type="submit" style={{
                marginTop: '12px', height: '56px', borderRadius: '50px',
                backgroundColor: color.button, border: 'none',
                color: 'white', fontSize: '20px', fontWeight: '700',
                cursor: 'pointer', transition: 'background-color 0.4s ease'
              }}>
                Signup Securely
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: 'white', fontSize: '15px' }}>
              Enter the 6-digit OTP sent to <strong>{formData.email}</strong>
            </p>
            <input
              type="text" maxLength={6} value={otpInput}
              onChange={e => setOtpInput(e.target.value)}
              style={{ ...inputStyle, fontSize: '28px', letterSpacing: '8px', textAlign: 'center' }}
              placeholder="------"
            />
            <button onClick={handleVerify} style={{
              height: '56px', borderRadius: '50px',
              backgroundColor: color.button, border: 'none',
              color: 'white', fontSize: '20px', fontWeight: '700', cursor: 'pointer'
            }}>
              Verify & Create Account
            </button>
            <p
              style={{ color: 'white', textAlign: 'center', fontSize: '14px', cursor: 'pointer' }}
              onClick={() => { setStep(1); setOtpSent(''); setOtpInput(''); }}
            >
              Resend OTP
            </p>
          </div>
        )}

        <p style={{
          color: 'white', textAlign: 'center',
          marginTop: '20px', fontSize: '14px', paddingBottom: '20px'
        }}>
          Already have an account?{' '}
          <span onClick={() => navigate('/')}
            style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;