import React, { createContext, useState, useEffect, useContext } from "react";
import { api } from "../api/axios";

interface Loan {
  id: number;
  amount: string;
  term: number;
  remaining_balance: string;
  status: string;
  created_at: string;
}

interface LoanContextType {
  loans: Loan[];
  fetchLoans: () => void;
}

const LoanContext = createContext<LoanContextType>({
  loans: [],
  fetchLoans: () => {},
});

export const useLoan = () => useContext(LoanContext);

export const LoanProvider = ({ children }: { children: React.ReactNode }) => {
  const [loans, setLoans] = useState<Loan[]>([]);

  const fetchLoans = async () => {
    try {
      const res = await api.get<Loan[]>("/loans");
      setLoans(res.data);
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  return (
    <LoanContext.Provider value={{ loans, fetchLoans }}>
      {children}
    </LoanContext.Provider>
  );
};
