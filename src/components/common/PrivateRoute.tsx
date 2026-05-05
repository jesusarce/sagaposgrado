import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../hooks/auth/useAuth";
import { ROUTES } from "../../constants/routes.constants";

export default function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.SIGN_IN} replace />;
  }

  return <Outlet />;
}
