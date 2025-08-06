import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSEO } from '@/hooks/useSEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, ArrowLeft } from 'lucide-react';
import { ROUTES, USER_ROLES, UserRole } from '@/lib/constants';
import { validateEmail, validatePassword, validateName, isRateLimited } from '@/utils/security';

const Signup = () => {
  useSEO('signup');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user, signup } = useAuth();

  if (user) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (isRateLimited(`signup_${email}`, 3, 600000)) {
      setError('Too many signup attempts. Please try again in 10 minutes.');
      return;
    }
    
    // Input validation
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      setError(nameValidation.error || 'Invalid name');
      return;
    }
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email');
      return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Invalid password');
      return;
    }
    
    if (!role) {
      setError('Please select a role');
      return;
    }
    
    // Restrict admin role creation in production
    if (role === USER_ROLES.ADMIN && process.env.NODE_ENV === 'production') {
      setError('Admin accounts cannot be created through signup. Please contact support.');
      return;
    }
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const result = await signup(email, password, name, role as UserRole);
      if (result.needsConfirmation) {
        setSuccess('Account created! Please check your email to confirm your account before signing in.');
      }
    } catch (err: any) {
      if (err.message?.includes('rate limit')) {
        setError('Too many attempts. Please wait a moment before trying again.');
      } else if (err.message?.includes('already registered')) {
        setError('An account with this email already exists.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
            <CardTitle className="text-2xl font-bold">Join AptCircle</CardTitle>
            <CardDescription>
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={USER_ROLES.TENANT}>Tenant</SelectItem>
                    <SelectItem value={USER_ROLES.OWNER}>Property Owner</SelectItem>
                    <SelectItem value={USER_ROLES.VENDOR}>Service Provider</SelectItem>
                    {process.env.NODE_ENV === 'development' && (
                      <SelectItem value={USER_ROLES.ADMIN}>Administrator (Dev Only)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to={ROUTES.LOGIN} 
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;