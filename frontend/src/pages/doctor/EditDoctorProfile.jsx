import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { getUser, getRole } from '../../utils/auth';
import { api } from '../../services/api';

const EditDoctorProfile = () => {
  const navigate = useNavigate();
  const userFromStorage = getUser();
  const userRole = getRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    licenseId: '',
    age: '',
    dob: '',
    specialization: '',
    hospitalName: '',
    profileImage: null
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔐 Validate that the logged-in user is actually a doctor
  if (!userFromStorage || !userRole || userRole !== 'doctor') {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '12px', padding: '40px',
          textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>Access Denied</h2>
          <p style={{ color: '#666', margin: '0 0 24px 0' }}>
            You must log in as a doctor to access this page
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('emar_user');
              localStorage.removeItem('emar_token');
              navigate('/login');
            }}
            style={{
              backgroundColor: '#1A237E', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 24px', fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Fetch doctor profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const doctorId = userFromStorage?._id || userFromStorage?.id;
        if (!doctorId) return;

        const data = await api.get('/doctors/me');
        if (data?.doctor) {
          setProfile({
            name: data.doctor.name || '',
            email: data.doctor.email || '',
            phone: data.doctor.phone || '',
            licenseId: data.doctor.licenseId || '',
            age: data.doctor.age || '',
            dob: data.doctor.dob || '',
            specialization: data.doctor.specialization || '',
            hospitalName: data.doctor.hospitalName || '',
            profileImage: data.doctor.profileImage || null
          });

          // Set image preview
          if (data.doctor.profileImage) {
            setImagePreview(data.doctor.profileImage);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setMessage('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userFromStorage]);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setImagePreview(base64String);
      setProfile({ ...profile, profileImage: base64String });
      setMessage('');
    };
    reader.readAsDataURL(file);
  };

  // Handle profile update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const doctorId = userFromStorage?._id || userFromStorage?.id;
      if (!doctorId) {
        setMessage('❌ Doctor ID not found');
        return;
      }

      const updateData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        age: profile.age,
        dob: profile.dob,
        specialization: profile.specialization,
        hospitalName: profile.hospitalName
      };

      // Only include image if it has changed
      if (profile.profileImage) {
        updateData.profileImage = profile.profileImage;
      }

      const response = await api.put('/doctors/profile', updateData);

      if (response?.doctor) {
        setMessage('✅ Profile updated successfully!');
        // Update localStorage with new profile
        localStorage.setItem('emar_user', JSON.stringify(response.doctor));
        setTimeout(() => {
          navigate('/doctor/overview');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage('❌ Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DoctorLayout activePage="Edit Profile">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', color: '#666' }}>Loading...</div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout activePage="Edit Profile">
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {/* Header */}
        <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
          <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 8px 0' }}>
            Edit Profile
          </h1>
          <p style={{ color: '#666', fontSize: isMobile ? '13px' : '15px', margin: 0 }}>
            Update your personal and professional information
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div style={{
            padding: '12px 16px', marginBottom: '20px',
            borderRadius: '8px', fontSize: '14px', fontWeight: '500',
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSaveProfile} style={{
          backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '20px' : '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>

          {/* Profile Image Section */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1A237E' }}>
              Profile Picture
            </h2>
            <div style={{
              display: 'flex', gap: isMobile ? '16px' : '24px', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row'
            }}>
              {/* Image Preview */}
              <div style={{
                width: '120px', height: '120px', borderRadius: '12px',
                backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center',
                justifyContent: 'center', overflow: 'hidden', border: '2px solid #e0e0e0',
                flexShrink: 0
              }}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    fontSize: '48px', fontWeight: 'bold', color: '#ccc'
                  }}>
                    {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'inline-block', padding: '12px 24px',
                  backgroundColor: '#1A237E', color: 'white', borderRadius: '8px',
                  cursor: 'pointer', fontWeight: '600', marginBottom: '12px'
                }}>
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <p style={{ color: '#666', fontSize: '13px', margin: '0' }}>
                  Recommended: Square image, max 5MB
                </p>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setProfile({ ...profile, profileImage: null });
                    }}
                    style={{
                      display: 'block', marginTop: '8px', padding: '8px 12px',
                      backgroundColor: '#f0f0f0', border: 'none', borderRadius: '6px',
                      cursor: 'pointer', color: '#d32f2f', fontWeight: '500', fontSize: '13px'
                    }}
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1A237E' }}>
              Personal Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* License ID (Read Only) */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                  License ID
                </label>
                <input
                  type="text"
                  value={profile.licenseId}
                  disabled
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
                    backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed'
                  }}
                />
                <p style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                  (Cannot be changed)
                </p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1A237E' }}>
              Professional Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              {/* Specialization */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                  Specialization
                </label>
                <input
                  type="text"
                  value={profile.specialization}
                  onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                  }}
                  placeholder="e.g., Cardiologist, Neurologist"
                  required
                />
              </div>

              {/* Hospital Name */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={profile.hospitalName}
                  onChange={(e) => setProfile({ ...profile, hospitalName: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                  }}
                  placeholder="e.g., Apollo Hospital"
                  required
                />
              </div>
            </div>
          </div>

          {/* Healthcare Information */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1A237E' }}>
              Healthcare Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              {/* Date of Birth */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profile.dob}
                  onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Age */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                  Age
                </label>
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setProfile({ ...profile, age: value ? parseInt(value) : '' });
                  }}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/doctor/overview')}
              style={{
                padding: '10px 24px', backgroundColor: '#f0f0f0',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: '600', color: '#333', fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 24px', backgroundColor: '#1A237E',
                border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
                color: 'white', fontWeight: '600', fontSize: '14px',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DoctorLayout>
  );
};

export default EditDoctorProfile;
