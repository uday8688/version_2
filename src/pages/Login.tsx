import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSEO } from '@/hooks/useSEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, ArrowLeft, Users } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { createSampleUsers } from '@/utils/createSampleUsers';
import { validateEmail, isRateLimited } from '@/utils/security';

const Login = () => {
  useSEO('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, login } = useAuth();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || ROUTES.HOME;

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Rate limiting check
    if (isRateLimited(`login_${email}`, 5, 900000)) {
      setError('Too many login attempts. Please try again in 15 minutes.');
      return;
    }
    
    // Input validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSampleUsers = async () => {
    // Only allow in development environment
    if (process.env.NODE_ENV !== 'development') {
      setError("Sample user creation is only available in development mode");
      return;
    }
    
    try {
      setError('Creating sample users...');
      await createSampleUsers();
      setError('Sample users created successfully! You can now login.');
    } catch (err) {
      setError('Failed to create sample users. Please try again.');
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center mb-8">
          <Link to={ROUTES.HOME} className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your AptCircle account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  to={ROUTES.SIGNUP} 
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleCreateSampleUsers}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Create Sample Users (Dev Only)
                </Button>
                
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground mb-2">Test Accounts (Password: test123):</p>
                  <div className="text-xs space-y-1">
                    <div>• <strong>Admin:</strong> admin@aptcircle.com</div>
                    <div>• <strong>Owner:</strong> owner@aptcircle.com</div>
                    <div>• <strong>Tenant:</strong> tenant@aptcircle.com</div>
                    <div>• <strong>Vendor:</strong> vendor@aptcircle.com</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;