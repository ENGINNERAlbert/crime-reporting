import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [rank, setRank] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const pageStyle = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '20px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '40px 30px',
    borderRadius: '20px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '460px',
    textAlign: 'center',
    zIndex: 2,
    backdropFilter: 'blur(6px)',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!role) {
      setError('Role is required');
      return;
    }

    try {
      const cleanedRole = role.trim().toLowerCase().replace(' ', '_');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: cleanedRole,
          rank: cleanedRole === 'law_enforcement' ? rank : null,
          details: cleanedRole === 'law_enforcement' ? details : null,
        }),
      });

      if (response.ok) {
        setSuccessMessage('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2>Register</h2>
        <p>Fill in your details to create an account</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /><br />
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /><br />
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select a Role</option>
            <option value="Citizen">Citizen</option>
            <option value="Law Enforcement">Law Enforcement</option>
          </select><br />

          {role === 'Law Enforcement' && (
            <>
              <select value={rank} onChange={(e) => setRank(e.target.value)}>
                <option value="">Select Rank (Optional)</option>
                <option value="Officer">Officer</option>
                <option value="Sergeant">Sergeant</option>
                <option value="Inspector">Inspector</option>
                <option value="Captain">Captain</option>
                <option value="Chief">Chief</option>
              </select><br />
              <textarea
                placeholder="Additional Details (Optional)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows="4"
              />
            </>
          )}
          <br />
          <button type="submit">Register</button>
        </form>
        <p>Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
};

export default Register;
