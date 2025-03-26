import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { useBalance } from "../context/BalanceContext";
import { useLoan } from "../context/LoanContext";
import { api } from "../api/axios";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Transaction {
  id: number;
  debit_card_id: number;
  amount: string;
  type: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const { balance, fetchBalance } = useBalance();
  const { loans, fetchLoans } = useLoan();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [userRes, transactionRes] = await Promise.all([
        api.get<{ user: User }>("/me"),
        api.get<Transaction[]>("/transactions"),
      ]);
      setUser(userRes.data.user);
      setTransactions(transactionRes.data.slice(0, 5)); // show recent 5 transactions
      await fetchBalance();
      await fetchLoans();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !user) {
    return (
      <div className="p-6 space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-4">
        {/* User Info */}
        <Card>
          <CardHeader className="flex items-center space-y-2">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
            </Avatar>
            <CardTitle>Welcome back, {user.name}!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">{user.email}</p>
          </CardContent>
        </Card>

        {/* Account Balance */}
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
              R {balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length ? (
              <ul className="space-y-2">
                {transactions.map((tx) => (
                  <li key={tx.id} className="flex justify-between">
                    <div>
                      <span className="capitalize">{tx.type}</span>
                      <Badge className="ml-2">{tx.status}</Badge>
                    </div>
                    <span>
                      R {parseFloat(tx.amount).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No transactions available.</p>
            )}
          </CardContent>
        </Card>

        {/* Loans Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Loans Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loans.length ? (
              <ul className="space-y-2">
                {loans.map((loan) => (
                  <li key={loan.id} className="flex justify-between">
                    <span>Loan #{loan.id}</span>
                    <span className="text-orange-500">
                      R {parseFloat(loan.remaining_balance).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No active loans.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
