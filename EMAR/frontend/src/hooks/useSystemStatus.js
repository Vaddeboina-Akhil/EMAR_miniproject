import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Hook to check if system is frozen
 * Used globally to show lock message to users
 */
export const useSystemStatus = () => {
  const [isFrozen, setIsFrozen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemStatus();
    // Check every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await api.get('/admin/system/status');
      setIsFrozen(response.isFrozen);
      setReason(response.reason);
    } catch (err) {
      // If endpoint fails, assume system is not frozen (fail-safe)
      setIsFrozen(false);
    } finally {
      setLoading(false);
    }
  };

  return { isFrozen, reason, loading };
};

/**
 * Component to show system lock banner
 */
export const SystemLockBanner = () => {
  const { isFrozen, reason } = useSystemStatus();

  if (!isFrozen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#B71C1C',
      color: 'white',
      padding: '16px',
      textAlign: 'center',
      zIndex: 10000,
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    }}>
      <span style={{ fontSize: '20px' }}>🔒</span>
      <div>
        <div>System temporarily locked due to security issue</div>
        <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
          {reason || 'Please contact administrator'}
        </div>
      </div>
    </div>
  );
};

export default useSystemStatus;
