import { getRoleDashboard } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, Package, Shield } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SuperAdminSetupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { setupSuperAdmin, user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    navigate(getRoleDashboard(user.role));
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  if (formData.password.length < 8) {
    setError('Password must be at least 8 characters');
    return;
  }

  setIsLoading(true);

  try {
    await setupSuperAdmin({
      name: `${formData.firstName} ${formData.lastName}`, // combine first + last
      email: formData.email,
      password: formData.password,
    });

    toast({
      title: 'System setup complete',
      description: 'SuperAdmin account created. Redirecting to dashboard...',
    });

    navigate('/superadmin');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Setup failed';
    setError(message);
    toast({
      variant: 'destructive',
      title: 'Setup failed',
      description: message,
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          {/* Back Link */}
          <Link 
            to="/" 
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 ring-1 ring-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">System Setup</span>
          </div>

          {/* Title */}
          <h2 className="mt-8 text-2xl font-bold tracking-tight text-foreground">
            Create SuperAdmin Account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This account will have full system access and can create all other users.
          </p>

          {/* Warning */}
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 px-4 py-3">
            <Shield className="mt-0.5 h-5 w-5 text-warning" />
            <p className="text-sm text-warning">
              This is a one-time setup. Store these credentials securely.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="superadmin@company.com"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="h-11"
              />
            </div>

            <Button type="submit" className="h-11 w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create SuperAdmin Account'
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-dark">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-3xl" />
          
          {/* Card */}
          <div className="relative rounded-2xl border border-border/50 bg-card/80 p-8 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary p-3">
                <Package className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">First-Time Setup</h3>
                <p className="text-sm text-muted-foreground">Configure your system</p>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">SuperAdmin</span> can:
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Create Admin, Manager, Staff users</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Configure system settings</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Access all features</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSetupPage;
