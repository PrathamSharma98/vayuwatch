import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Phone, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Wind,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'signup' | 'otp-login' | 'forgot-password';

const Login = () => {
  const navigate = useNavigate();
  const { 
    login, 
    loginWithOtp, 
    signup, 
    sendOtp, 
    verifyOtp, 
    resetPassword,
    currentOtp,
    isAuthenticated 
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // OTP countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digits.slice(0, 10);
  };

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const { otp: generatedOtp, expiresAt } = sendOtp('+91' + phone);
    setOtpSent(true);
    setCountdown(60);
    setIsLoading(false);

    toast({
      title: '📱 Demo OTP Sent',
      description: `Your OTP is: ${generatedOtp} (visible for demo)`,
    });
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    const isValid = verifyOtp('+91' + phone, otp);
    if (isValid) {
      setOtpVerified(true);
      setError('');
      toast({
        title: '✓ OTP Verified',
        description: 'Please set your password to continue',
      });
    } else {
      setError('Invalid or expired OTP. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const success = await login('+91' + phone, password);
        if (success) {
          toast({ title: '✓ Welcome back!', description: 'Login successful' });
          navigate('/');
        } else {
          setError('Invalid phone number or password');
        }
      } else if (mode === 'signup') {
        if (!otpVerified) {
          setError('Please verify your phone number first');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        const success = await signup('+91' + phone, password, name);
        if (success) {
          toast({ title: '✓ Account Created!', description: 'Welcome to VayuWatch' });
          navigate('/');
        } else {
          setError('Phone number already registered');
        }
      } else if (mode === 'otp-login') {
        const success = await loginWithOtp('+91' + phone, otp);
        if (success) {
          toast({ title: '✓ Welcome!', description: 'Login successful' });
          navigate('/');
        } else {
          setError('Invalid or expired OTP');
        }
      } else if (mode === 'forgot-password') {
        if (!otpVerified) {
          setError('Please verify your phone number first');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        const success = resetPassword('+91' + phone, password);
        if (success) {
          toast({ title: '✓ Password Reset', description: 'You can now login with your new password' });
          setMode('login');
          setOtpSent(false);
          setOtpVerified(false);
          setOtp('');
          setPassword('');
          setConfirmPassword('');
        } else {
          setError('Account not found');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setCountdown(0);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Subtle glow effect */}
      <div className="fixed inset-0 bg-gradient-glow pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-2.5 rounded-lg bg-gradient-to-br from-primary to-primary/60 glow-primary"
          >
            <Wind className="w-6 h-6 text-primary-foreground" />
          </motion.div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground tracking-tight">
              VayuWatch
            </h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">
              India Air Quality Monitor
            </p>
          </div>
        </Link>

        {/* Demo Mode Banner */}
        <div className="mb-5 py-2 px-3 rounded-md bg-info/10 border border-info/20 flex items-center gap-2">
          <Smartphone className="w-3.5 h-3.5 text-info" />
          <p className="text-xs text-info">
            Demo Mode - OTP visible on screen
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-lg">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setMode('login'); resetForm(); }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'login' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('signup'); resetForm(); }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'signup' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-muted-foreground text-sm">
                  🇮🇳 +91
                </div>
                <div className="flex-1 relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="pl-10"
                    disabled={otpVerified}
                  />
                </div>
              </div>
            </div>

            {/* Signup: Name Field */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* OTP Section for Signup/Forgot Password/OTP Login */}
            {(mode === 'signup' || mode === 'forgot-password' || mode === 'otp-login') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  OTP Verification
                </label>
                
                {!otpSent ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={handleSendOTP}
                    disabled={isLoading || phone.length !== 10}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Smartphone className="w-4 h-4 mr-2" />
                    )}
                    Send OTP
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {/* Display Demo OTP */}
                    {currentOtp && currentOtp.phone === '+91' + phone && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 rounded-lg bg-success/10 border border-success/30 text-center"
                      >
                        <p className="text-xs text-success/70 mb-1">Demo OTP (visible for testing)</p>
                        <p className="text-2xl font-mono font-bold text-success tracking-widest">
                          {currentOtp.otp}
                        </p>
                      </motion.div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center tracking-widest font-mono"
                        maxLength={6}
                        disabled={otpVerified}
                      />
                      {!otpVerified && mode !== 'otp-login' && (
                        <Button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={otp.length !== 6}
                        >
                          Verify
                        </Button>
                      )}
                    </div>

                    {otpVerified ? (
                      <div className="flex items-center gap-2 text-success text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Phone verified successfully
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {countdown > 0 ? `Resend in ${countdown}s` : 'Didn\'t receive?'}
                        </span>
                        {countdown === 0 && (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            className="text-primary hover:underline"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Password Field */}
            {(mode === 'login' || ((mode === 'signup' || mode === 'forgot-password') && otpVerified)) && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {mode === 'forgot-password' ? 'New Password' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password for Signup/Reset */}
            {((mode === 'signup' || mode === 'forgot-password') && otpVerified) && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || (mode === 'signup' && !otpVerified)}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {mode === 'login' ? 'Login' : 
               mode === 'signup' ? 'Create Account' :
               mode === 'otp-login' ? 'Login with OTP' :
               'Reset Password'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Additional Options */}
          <div className="mt-6 pt-4 border-t border-border/50 space-y-3">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => { setMode('otp-login'); resetForm(); }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Login with OTP instead
                </button>
                <button
                  onClick={() => { setMode('forgot-password'); resetForm(); }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot Password?
                </button>
              </>
            )}

            {mode === 'otp-login' && (
              <button
                onClick={() => { setMode('login'); resetForm(); }}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Login with password instead
              </button>
            )}

            {mode === 'forgot-password' && (
              <button
                onClick={() => { setMode('login'); resetForm(); }}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to Login
              </button>
            )}
          </div>
        </div>

        {/* Skip for Demo */}
        <div className="mt-6 text-center">
          <Link 
            to="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Skip login and explore as guest →
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
