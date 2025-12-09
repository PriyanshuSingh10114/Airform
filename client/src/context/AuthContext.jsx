import { createContext, useState, useEffect } from "react";
export const AuthContext = createContext();
export default function AuthProvider({ children }) {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);

  const login = (id) => {
    setUserId(id);
    localStorage.setItem("userId", id);
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
