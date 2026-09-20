import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children, requiredRole, allowedRoles }) {
  const {
    usuario,
    isAuthenticated,
    loading,
  } = useAuth();

  // Mientras recuperamos la sesión
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07100b] text-white">
        <p className="text-sm text-white/40">
          Verifying session...
        </p>
      </div>
    );
  }

  // No está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Está autenticado pero no tiene el rol necesario
  const roles = allowedRoles || (requiredRole !== undefined ? [requiredRole] : null);
  if (roles && !roles.map(Number).includes(Number(usuario?.rol_id))) {
    return <Navigate to="/" replace />;
  }

  return children;
}