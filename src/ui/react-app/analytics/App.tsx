import React, { useState, useEffect } from 'react';

export default function AnalyticsApp() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#0f0f0f',
      color: '#e0e0e0',
      minHeight: '100vh'
    }}>
      <header style={{
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #2a2a2a'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#fff' }}>
          📈 Analytics
        </h1>
        <p style={{ color: '#888' }}>Revenue and sales insights</p>
      </header>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          Loading...
        </div>
      ) : (
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Analytics</h2>
          <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>Revenue and sales insights</p>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Get Started
          </button>
        </div>
      )}
    </div>
  );
}
