import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: User info, 2: Emergency contacts
  
  // User information form fields
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  // Emergency contacts form fields
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: '', phone: '', relationship: '' },
    { name: '', phone: '', relationship: '' }
  ]);
  
  // Handle user info input change
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };
  
  // Handle emergency contact input change
  const handleEmergencyContactChange = (index, e) => {
    const { name, value } = e.target;
    const updatedContacts = [...emergencyContacts];
    updatedContacts[index] = { ...updatedContacts[index], [name]: value };
    setEmergencyContacts(updatedContacts);
  };
  
  // Handle next/back steps in form
  const handleNextStep = (e) => {
    e.preventDefault();
    
    // Validate user info before proceeding
    if (step === 1) {
      // Check if all required fields are filled
      const { firstName, lastName, email, phone, password, confirmPassword } = userInfo;
      if (!firstName || !lastName || !email || !phone || !password) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Check if passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      // Check for valid email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      // Clear any errors and proceed to next step
      setError('');
      setStep(2);
    }
  };
  
  const handlePreviousStep = () => {
    setStep(1);
  };
  
  // Submit the registration form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate emergency contacts
      if (emergencyContacts[0].name === '' || emergencyContacts[0].phone === '') {
        setError('Please add at least one emergency contact');
        setLoading(false);
        return;
      }
      
      // For this demo, we'll just simulate a registration
      // In a real app, you would send this to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store user info in localStorage (for demo purposes only)
      // In a real app, this would come from the server after registration
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        phone: userInfo.phone,
        emergencyContacts
      }));
      
      // Show success and redirect to login
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <div className="logo">
            <i className="fas fa-map-marker-alt"></i>
            <span>She-Secure</span>
          </div>
          <h2>Create Your Account</h2>
          <p>Join our community for safer navigation</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="steps-indicator">
          <div className={`step ${step === 1 ? 'active' : 'completed'}`}>
            <div className="step-number">1</div>
            <div className="step-label">Your Information</div>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step === 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Emergency Contacts</div>
          </div>
        </div>
        
        {step === 1 ? (
          <form onSubmit={handleNextStep} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName"
                  value={userInfo.firstName}
                  onChange={handleUserInfoChange}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName"
                  value={userInfo.lastName}
                  onChange={handleUserInfoChange}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={userInfo.email}
                onChange={handleUserInfoChange}
                placeholder="Enter your email address"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone"
                value={userInfo.phone}
                onChange={handleUserInfoChange}
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                value={userInfo.password}
                onChange={handleUserInfoChange}
                placeholder="Create a password"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword"
                value={userInfo.confirmPassword}
                onChange={handleUserInfoChange}
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <button type="submit" className="btn-primary">
              Continue to Emergency Contacts
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="register-form">
            <p className="section-info">
              Please provide at least one emergency contact that can be notified in case of an emergency.
            </p>
            
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="emergency-contact">
                <h3>Emergency Contact {index + 1}</h3>
                
                <div className="form-group">
                  <label htmlFor={`contact${index}Name`}>Full Name</label>
                  <input 
                    type="text" 
                    id={`contact${index}Name`} 
                    name="name"
                    value={contact.name}
                    onChange={(e) => handleEmergencyContactChange(index, e)}
                    placeholder="Enter contact's full name"
                    required={index === 0}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`contact${index}Phone`}>Phone Number</label>
                  <input 
                    type="tel" 
                    id={`contact${index}Phone`} 
                    name="phone"
                    value={contact.phone}
                    onChange={(e) => handleEmergencyContactChange(index, e)}
                    placeholder="Enter contact's phone number"
                    required={index === 0}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`contact${index}Relationship`}>Relationship</label>
                  <select 
                    id={`contact${index}Relationship`} 
                    name="relationship"
                    value={contact.relationship}
                    onChange={(e) => handleEmergencyContactChange(index, e)}
                    required={index === 0}
                  >
                    <option value="">Select relationship</option>
                    <option value="Family">Family</option>
                    <option value="Friend">Friend</option>
                    <option value="Partner">Partner</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            ))}
            
            <div className="form-buttons">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={handlePreviousStep}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}
        
        <div className="login-link">
          <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register; 