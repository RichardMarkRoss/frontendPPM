import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/axios";

interface RoleContextType {
  role: string;
  permissions: string[];
  fetchUserRole: () => void;
}

const RoleContext = createContext<RoleContextType>({
  role: "",
  permissions: [],
  fetchUserRole: () => {},
});

export const useRole = () => useContext(RoleContext);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);

  const fetchUserRole = async () => {
    try {
      const res = await api.get("/me");
      setRole(res.data.user.role.name);
      setPermissions(res.data.user.role.permissions.map((perm: any) => perm.name));
    } catch (error) {
      console.error("Error fetching role:", error);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  return (
    <RoleContext.Provider value={{ role, permissions, fetchUserRole }}>
      {children}
    </RoleContext.Provider>
  );
};
