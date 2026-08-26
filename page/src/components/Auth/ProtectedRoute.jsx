import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children, requiredRole }) {
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
          Verificando sesión...
        </p>
      </div>
    );
  }

  // No está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Está autenticado pero no tiene el rol necesario
  if (
    requiredRole !== undefined &&
    Number(usuario?.rol_id) !== Number(requiredRole)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}