import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPasswordTips, setShowPasswordTips] = useState(false);
  const [oauthLoading, setOauthLoading] = useState({
    google: false,
    github: false,
    microsoft: false
  });
  const [activeSection, setActiveSection] = useState('oauth'); // oauth, email

  const { register, loginWithGoogle, loginWithGitHub, loginWithMicrosoft, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
    
    // Check password strength in real-time
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  }, [error]);

  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength('');
      return;
    }

    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength++;
    else feedback.push('at least 8 characters');

    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('one uppercase letter');

    if (/[a-z]/.test(password)) strength++;
    else feedback.push('one lowercase letter');

    if (/[0-9]/.test(password)) strength++;
    else feedback.push('one number');

    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push('one special character');

    const strengthLabels = {
      0: 'Very Weak',
      1: 'Weak',
      2: 'Fair',
      3: 'Good',
      4: 'Strong',
      5: 'Very Strong'
    };

    setPasswordStrength({
      level: strength,
      label: strengthLabels[strength] || 'Very Weak',
      feedback: feedback
    });
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword, company } = formData;

    if (!name || !email || !password || !confirmPassword || !company) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (passwordStrength.level < 3) {
      setError('Please choose a stronger password');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setOauthLoading(prev => ({ ...prev, google: true }));
      setError('');
      
      const result = await loginWithGoogle();
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Google authentication failed. Please try again.');
      }
    } catch (err) {
      setError('Failed to authenticate with Google. Please try again.');
      console.error('Google OAuth error:', err);
    } finally {
      setOauthLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleGitHubLogin = async () => {
    try {
      setOauthLoading(prev => ({ ...prev, github: true }));
      setError('');
      
      const result = await loginWithGitHub();
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'GitHub authentication failed. Please try again.');
      }
    } catch (err) {
      setError('Failed to authenticate with GitHub. Please try again.');
      console.error('GitHub OAuth error:', err);
    } finally {
      setOauthLoading(prev => ({ ...prev, github: false }));
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setOauthLoading(prev => ({ ...prev, microsoft: true }));
      setError('');
      
      const result = await loginWithMicrosoft();
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Microsoft authentication failed. Please try again.');
      }
    } catch (err) {
      setError('Failed to authenticate with Microsoft. Please try again.');
      console.error('Microsoft OAuth error:', err);
    } finally {
      setOauthLoading(prev => ({ ...prev, microsoft: false }));
    }
  };

  const PasswordTipsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Password Requirements</h3>
            <button
              onClick={() => setShowPasswordTips(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">At least 8 characters</h4>
                <p className="text-gray-600 text-sm">Longer passwords are more secure</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Uppercase and lowercase letters</h4>
                <p className="text-gray-600 text-sm">Mix of capital and small letters</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Numbers and special characters</h4>
                <p className="text-gray-600 text-sm">Include digits and symbols like !@#$%</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowPasswordTips(false)}
            className="w-full mt-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );

  const OAuthSection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Get started in seconds</h3>
        <p className="text-gray-600">Choose your preferred sign up method</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={oauthLoading.google}
          className="flex items-center justify-center p-4 border border-gray-300 rounded-xl bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
        >
          {oauthLoading.google ? (
            <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <div className="w-6 h-6 mr-3 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <span className="font-medium">Google</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleGitHubLogin}
          disabled={oauthLoading.github}
          className="flex items-center justify-center p-4 border border-gray-800 rounded-xl bg-gray-900 text-white hover:bg-gray-800 hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
        >
          {oauthLoading.github ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <div className="w-6 h-6 mr-3 flex items-center justify-center">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12 22 6.48 17.52 2 12 2z"/>
                </svg>
              </div>
              <span className="font-medium">GitHub</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleMicrosoftLogin}
          disabled={oauthLoading.microsoft}
          className="flex items-center justify-center p-4 border border-gray-300 rounded-xl bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group col-span-2"
        >
          {oauthLoading.microsoft ? (
            <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <div className="w-6 h-6 mr-3 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#f25022" d="M1 1h10v10H1V1z"/>
                  <path fill="#00a4ef" d="M13 1h10v10H13V1z"/>
                  <path fill="#7fba00" d="M1 13h10v10H1V13z"/>
                  <path fill="#ffb900" d="M13 13h10v10H13V13z"/>
                </svg>
              </div>
              <span className="font-medium">Microsoft</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => setActiveSection('email')}
          className="text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          Continue with email instead
        </button>
      </div>
    </div>
  );

  const EmailSection = () => (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Create your account</h3>
        <p className="text-gray-600">Fill in your details to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              disabled={loading}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Company Field */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <input
              id="company"
              name="company"
              type="text"
              required
              disabled={loading}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Enter your company name"
              value={formData.company}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={loading}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <button
              type="button"
              onClick={() => setShowPasswordTips(true)}
              className="text-xs text-green-600 hover:text-green-500 transition-colors"
            >
              Password Tips
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              disabled={loading}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              disabled={loading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Password strength:</span>
                <span className={`font-medium ${
                  passwordStrength.level >= 4 ? 'text-green-600' :
                  passwordStrength.level >= 3 ? 'text-yellow-600' :
                  passwordStrength.level >= 2 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordStrength.level >= 4 ? 'bg-green-500' :
                    passwordStrength.level >= 3 ? 'bg-yellow-500' :
                    passwordStrength.level >= 2 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(passwordStrength.level / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              disabled={loading}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              disabled={loading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start space-x-3">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            disabled={loading}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1 disabled:opacity-50"
          />
          <label htmlFor="terms" className="block text-sm text-gray-700">
            I agree to the{' '}
            <a href="#" className="text-green-600 hover:text-green-500 font-medium">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-green-600 hover:text-green-500 font-medium">Privacy Policy</a>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </>
          ) : (
            'Start Free Trial'
          )}
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setActiveSection('oauth')}
          className="text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          Use OAuth instead
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex">
        {/* Left Side - Benefits & Features */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-green-600 lg:to-teal-700 lg:p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 55%),
                              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0%, transparent 55%)`
            }}></div>
          </div>
          
          <div className="max-w-lg text-white relative z-10">
            {/* Logo */}
            <div className="flex items-center mb-12">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mr-4 border border-white/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">AnalyticsPro</h1>
                <p className="text-green-100 text-sm">Enterprise Business Intelligence</p>
              </div>
            </div>

            {/* Main Heading */}
            <div className="mb-12">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-green-100 text-sm font-medium mb-6">
                🚀 Start Your Free Trial
              </div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Transform Your Business With <span className="text-amber-300">Data Insights</span>
              </h2>
              <p className="text-green-100 text-lg mb-8 leading-relaxed">
                Join thousands of forward-thinking businesses making smarter decisions with our powerful analytics platform.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-6 mb-12">
              <div className="flex items-center group">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200 border border-white/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Instant Setup</h3>
                  <p className="text-green-100 text-sm">Get started in minutes with guided onboarding</p>
                </div>
              </div>

              <div className="flex items-center group">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200 border border-white/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Enterprise Security</h3>
                  <p className="text-green-100 text-sm">Bank-level encryption and compliance</p>
                </div>
              </div>

              <div className="flex items-center group">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200 border border-white/30">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Team Collaboration</h3>
                  <p className="text-green-100 text-sm">Share insights across your organization</p>
                </div>
              </div>
            </div>

            {/* OAuth Benefits */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 className="font-semibold mb-3">Multiple Sign Up Options</h4>
              <p className="text-green-100 text-sm mb-4">
                Choose between quick OAuth registration or traditional email sign up.
              </p>
              <div className="flex space-x-4 justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </div>
                  <span className="text-green-100 text-xs">OAuth</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-green-100 text-xs">Email</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AnalyticsPro</h1>
                <p className="text-gray-600 text-sm">Enterprise Business Intelligence</p>
              </div>
            </div>

            {/* Form Header */}
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
              <p className="mt-2 text-gray-600">Start your 14-day free trial. No credit card required.</p>
              
              {/* Security Notice */}
              <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center text-sm text-green-700">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Your data is secured with enterprise-grade encryption</span>
                </div>
              </div>
            </div>

            {/* Registration Form Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 p-8 backdrop-blur-sm bg-white/95">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="text-red-700 text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Section Management */}
              {activeSection === 'oauth' ? <OAuthSection /> : <EmailSection />}

              {/* Divider */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </div>

                {/* Login Link */}
                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center w-full py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign in to your account
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                © 2024 AnalyticsPro. All rights reserved.
                <br />
                <a href="#" className="text-green-600 hover:text-green-500 transition-colors">Terms</a>{' '}
                &{' '}
                <a href="#" className="text-green-600 hover:text-green-500 transition-colors">Privacy</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Tips Modal */}
      {showPasswordTips && <PasswordTipsModal />}
    </>
  );
};

export default Register;