import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);


  // ==========================================
  // RECUPERAR SESIÓN
  // ==========================================

  useEffect(() => {

    const storedToken =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');

    const storedUser =
      localStorage.getItem('usuario') ||
      sessionStorage.getItem('usuario');


    if (storedToken && storedUser) {

      try {

        setToken(storedToken);
        setUsuario(JSON.parse(storedUser));

      } catch (error) {

        console.error(
          'Error al recuperar la sesión:',
          error
        );

        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');

      }

    }

    setLoading(false);

  }, []);


  // ==========================================
  // LOGIN
  // ==========================================

  const login = (token, usuario, remember = false) => {

    const storage = remember
      ? localStorage
      : sessionStorage;


    storage.setItem(
      'token',
      token
    );


    storage.setItem(
      'usuario',
      JSON.stringify(usuario)
    );


    setToken(token);
    setUsuario(usuario);

  };


  // ==========================================
  // ACTUALIZAR USUARIO
  // ==========================================

  const actualizarUsuario = (usuarioActualizado) => {

    const storage = localStorage.getItem('token')
      ? localStorage
      : sessionStorage;


    storage.setItem(
      'usuario',
      JSON.stringify(usuarioActualizado)
    );


    setUsuario(usuarioActualizado);

  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');

    setToken(null);
    setUsuario(null);

  };


  // ==========================================
  // AUTENTICACIÓN
  // ==========================================

  const isAuthenticated = !!token;


  // ==========================================
  // PROVIDER
  // ==========================================

  return (

    <AuthContext.Provider
      value={{
        usuario,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        actualizarUsuario,
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


// ==========================================
// HOOK
// ==========================================

export function useAuth() {

  return useContext(AuthContext);

}