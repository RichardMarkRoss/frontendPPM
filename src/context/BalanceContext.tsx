import React, { createContext, useState, useEffect, useContext } from "react";
import { api } from "../api/axios";

interface BalanceContextType {
  balance: number;
  fetchBalance: () => void;
}

const BalanceContext = createContext<BalanceContextType>({
  balance: 0,
  fetchBalance: () => {},
});

export const useBalance = () => useContext(BalanceContext);

export const BalanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [balance, setBalance] = useState(0);

  const fetchBalance = async () => {
    try {
      const res = await api.get("/debit-cards");
      if (res.data.length > 0) {
        setBalance(parseFloat(res.data[0].balance));
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <BalanceContext.Provider value={{ balance, fetchBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};
