import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants';

/**
 * Component that automatically redirects authenticated users to their role-specific dashboard
 */
export const RoleRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      let dashboardRoute: string;
      
      switch (user.role) {
        case 'admin':
          dashboardRoute = ROUTES.ADMIN;
          break;
        case 'owner':
          dashboardRoute = ROUTES.OWNER;
          break;
        case 'vendor':
          dashboardRoute = ROUTES.VENDOR;
          break;
        case 'tenant':
          dashboardRoute = ROUTES.TENANT;
          break;
        default:
          dashboardRoute = ROUTES.HOME;
      }
      
      if (dashboardRoute !== ROUTES.HOME) {
        navigate(dashboardRoute, { replace: true });
      }
    }
  }, [user, navigate]);

  return null; // This component doesn't render anything
};