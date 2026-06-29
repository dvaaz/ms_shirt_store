import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const TestAuthProvider = ({ children }) => {
  // Força o usuário a sempre aparecer como logado
  const [user, setUser] = useState({ id: 1, name: "teste123", role: "admin" });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = async (email, password) => {
    // Simula sucesso de login instantaneamente
    setUser({ id: "teste123", name: "Mock User", role: "user" });
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
