import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../hooks/auth/useAuth";
import { ROUTES } from "../../constants/routes.constants";

export default function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-[#0f172a]">
          <img
              src="/images/logo_emi/emi_icono.png"
              className="h-20 w-auto animate-pulse "
           alt="logo_emi" />

          <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
            Cargando...
          </p>
          {/*<div className="mt-5 w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />*/}
        </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.SIGN_IN} replace />;
  }

  return <Outlet />;
}