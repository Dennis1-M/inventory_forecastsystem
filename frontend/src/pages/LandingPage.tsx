import { getRoleDashboard } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { ArrowRight, BarChart3, Loader2, Package, Shield, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [superAdminExists, setSuperAdminExists] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated && user) {
      navigate(getRoleDashboard(user.role));
      return;
    }

    // Check if SuperAdmin exists
    const checkSuperAdmin = async () => {
      setIsChecking(true);
      const exists = await authService.checkSuperAdminExists();
      setSuperAdminExists(exists);
      setIsChecking(false);
    };

    checkSuperAdmin();
  }, [isAuthenticated, user, navigate]);

  const handleGetStarted = () => {
    if (superAdminExists) {
      navigate('/login');
    } else {
      navigate('/setup');
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Initializing system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(199_89%_48%/0.15),transparent_50%)]" />
        
        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div className="mb-8 flex items-center justify-center rounded-2xl bg-primary/10 p-4 ring-1 ring-primary/20">
              <Package className="h-12 w-12 text-primary" />
            </div>

            {/* Title */}
            <h1 className="animate-fade-in text-4xl font-bold tracking-tight sm:text-6xl">
              <span className="text-gradient">Inventory</span>
              <span className="text-foreground"> Management</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-2xl animate-fade-in text-lg leading-8 text-muted-foreground" style={{ animationDelay: '0.1s' }}>
              A comprehensive inventory management system with ML-powered alerts, 
              role-based access control, and real-time analytics.
            </p>

            {/* CTA Button */}
            <div className="mt-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="group relative h-12 px-8 text-base font-medium"
              >
                {superAdminExists ? 'Login to Dashboard' : 'Setup System'}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Status Badge */}
            <div className="mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {superAdminExists ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm text-success ring-1 ring-success/20">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  System Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-warning/10 px-4 py-2 text-sm text-warning ring-1 ring-warning/20">
                  <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                  First-Time Setup Required
                </span>
              )}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Shield}
              title="Role-Based Access"
              description="SuperAdmin, Admin, Manager, and Staff roles with granular permissions"
              delay="0.4s"
            />
            <FeatureCard
              icon={BarChart3}
              title="ML-Powered Alerts"
              description="Predictive analytics for stock levels, expiry dates, and demand forecasting"
              delay="0.5s"
            />
            <FeatureCard
              icon={Users}
              title="Team Management"
              description="Complete user management with task assignment and activity tracking"
              delay="0.6s"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: string;
}

const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <div 
    className="animate-slide-up rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card"
    style={{ animationDelay: delay }}
  >
    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
  </div>
);

export default LandingPage;
