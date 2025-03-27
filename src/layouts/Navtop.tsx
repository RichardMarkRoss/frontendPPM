import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useBalance } from "../context/BalanceContext";
import { useLoan } from "../context/LoanContext";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import { ModeToggle } from "../components/mode-toggle";
import { Button } from "../components/ui/button";
import { api } from "../api/axios";
import { Eye, EyeOff } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: { name: string }; // Added role object
}

const Navtop = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [showLoan, setShowLoan] = useState(true);

  const { balance, fetchBalance } = useBalance();
  const { loans, fetchLoans } = useLoan();

  const totalLoanBalance = loans.reduce(
    (total, loan) => total + parseFloat(loan.remaining_balance),
    0
  );

  useEffect(() => {
    fetchBalance();
    fetchLoans();
  }, []);

  const balanceColor = balance > 0 ? "text-green-500" : balance < 0 ? "text-red-500" : "text-gray-200";
  const loanColor = totalLoanBalance > 0 ? "text-orange-500" : totalLoanBalance < 0 ? "text-yellow-500" : "text-green-200";

  // Admin and Manager can see User Management
  const isAdmin = user?.role?.name === "Admin";
  const isManager = user?.role?.name === "Manager";

  return (
    <nav className="bg-background border-b shadow-sm py-3 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <Link to="/" className="text-lg font-bold">
          PPM Dashboard
        </Link>
        <div className="hidden sm:flex space-x-4">
          <NavLink to="/" className={({ isActive }) => (isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-primary")}>
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => (isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-primary")}>
            Transactions
          </NavLink>
          <NavLink to="/loans" className={({ isActive }) => (isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-primary")}>
            Loans
          </NavLink>
          <NavLink to="/repayments" className={({ isActive }) => (isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-primary")}>
            Repayments
          </NavLink>

          {/* Admin & Manager Can See User Management */}
          {(isAdmin || isManager) && (
            <NavLink to="/users" className={({ isActive }) => (isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-primary")}>
              User Management
            </NavLink>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Balance Display */}
        <div className="flex items-center gap-2">
          <span className={`font-medium ${balanceColor}`}>
            {showBalance ? `R ${balance.toFixed(2)}` : "R ••••••"}
          </span>
          <Button variant="outline" size="icon" onClick={() => setShowBalance(!showBalance)}>
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* Loan Display */}
        <div className="flex items-center gap-2">
          <span className={`font-medium ${loanColor}`}>
            {showLoan ? `R ${totalLoanBalance.toFixed(2)}` : "R ••••••"}
          </span>
          <Button variant="outline" size="icon" onClick={() => setShowLoan(!showLoan)}>
            {showLoan ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        <ModeToggle />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarFallback>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/profile">Your Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navtop;
