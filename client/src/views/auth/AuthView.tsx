import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Shield,
  CheckCircle,
  AlertTriangle,
  User
} from "lucide-react";
import { UserModel } from "../../models/UserModel";

interface AuthViewProps {
  mode?: 'login' | 'signup' | 'forgot-password';
  onModeChange?: (mode: 'login' | 'signup' | 'forgot-password') => void;
  onAuthSuccess?: (user: UserModel) => void;
  showTestAccounts?: boolean;
}

export function AuthView({ 
  mode = 'login',
  onModeChange,
  onAuthSuccess,
  showTestAccounts = true
}: AuthViewProps) {
  // State management
  const [currentMode, setCurrentMode] = useState(mode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle mode changes
  const handleModeChange = (newMode: 'login' | 'signup' | 'forgot-password') => {
    setCurrentMode(newMode);
    setError(null);
    setSuccess(null);
    onModeChange?.(newMode);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Validate form data
  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.email) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Email format is invalid');
    }

    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (currentMode === 'signup') {
      if (!formData.firstName) {
        errors.push('First name is required');
      }
      if (!formData.lastName) {
        errors.push('Last name is required');
      }
      if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
      }
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (currentMode === 'login') {
        // Simulate login API call
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const result = await response.json();
        
        if (response.ok) {
          setSuccess('Login successful');
          // Create user model and notify parent
          const user = new UserModel(result.user);
          onAuthSuccess?.(user);
        } else {
          setError(result.message || 'Login failed');
        }
      } else if (currentMode === 'signup') {
        // Simulate signup API call
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName
          })
        });

        const result = await response.json();
        
        if (response.ok) {
          setSuccess('Account created successfully. Please log in.');
          setCurrentMode('login');
        } else {
          setError(result.message || 'Signup failed');
        }
      } else if (currentMode === 'forgot-password') {
        // Simulate forgot password API call
        setSuccess('Password reset instructions have been sent to your email.');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Test account login - Use environment-based test credentials for demo functionality
  const handleTestLogin = async (testEmail: string) => {
    setLoading(true);
    
    // Security: Use environment variable for test passwords with production safety
    // Fail fast in production if test password env var is not set
    const testPassword = import.meta.env.VITE_TEST_PASSWORD || 
      (import.meta.env.PROD ? (() => { throw new Error('VITE_TEST_PASSWORD required in production'); })() : 'test2024');
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword // Use consistent test password for demo functionality
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setSuccess('Test login successful');
        const user = new UserModel(result.user);
        onAuthSuccess?.(user);
      } else {
        setError(result.message || 'Test login failed');
      }
    } catch (err) {
      setError('Test login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-400 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400">WhoopsPay</h1>
          <p className="text-gray-400 mt-2">
            {currentMode === 'login' && 'Welcome back to your financial dashboard'}
            {currentMode === 'signup' && 'Create your secure payment account'}
            {currentMode === 'forgot-password' && 'Reset your account password'}
          </p>
        </div>

        {/* Test Accounts */}
        {showTestAccounts && currentMode === 'login' && (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400 text-sm">Quick Test Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => handleTestLogin('james.chen@example.com')}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Login as User (James)
              </Button>
              <Button
                onClick={() => handleTestLogin('maria.rodriguez@example.com')}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Login as Admin (Maria)
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Auth Form */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-yellow-400">
              {currentMode === 'login' && 'Sign In'}
              {currentMode === 'signup' && 'Create Account'}
              {currentMode === 'forgot-password' && 'Reset Password'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name fields for signup */}
              {currentMode === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      First Name
                    </label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white pl-10"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              {currentMode !== 'forgot-password' && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white pl-10 pr-10"
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-0 bg-transparent hover:bg-transparent"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Confirm password for signup */}
              {currentMode === 'signup' && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white pl-10"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-400/50 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              {/* Success display */}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-400/50 rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">{success}</span>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {currentMode === 'login' && <LogIn className="w-4 h-4 mr-2" />}
                    {currentMode === 'signup' && <UserPlus className="w-4 h-4 mr-2" />}
                    {currentMode === 'forgot-password' && <Mail className="w-4 h-4 mr-2" />}
                    
                    {currentMode === 'login' && 'Sign In'}
                    {currentMode === 'signup' && 'Create Account'}
                    {currentMode === 'forgot-password' && 'Send Reset Link'}
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Mode switching */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4 text-center">
            {currentMode === 'login' && (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={() => handleModeChange('signup')}
                    className="text-yellow-400 hover:text-yellow-300 font-medium"
                  >
                    Sign up here
                  </button>
                </p>
                <p className="text-gray-400 text-sm">
                  Forgot your password?{' '}
                  <button
                    onClick={() => handleModeChange('forgot-password')}
                    className="text-yellow-400 hover:text-yellow-300 font-medium"
                  >
                    Reset it here
                  </button>
                </p>
              </div>
            )}

            {currentMode === 'signup' && (
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => handleModeChange('login')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  Sign in here
                </button>
              </p>
            )}

            {currentMode === 'forgot-password' && (
              <p className="text-gray-400 text-sm">
                Remember your password?{' '}
                <button
                  onClick={() => handleModeChange('login')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  Sign in here
                </button>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Security notice */}
        <div className="text-center text-xs text-gray-500">
          <p>Your data is protected with enterprise-grade security</p>
          <p className="mt-1">By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}