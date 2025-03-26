import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useBalance } from "../context/BalanceContext";
import { useLoan } from "../context/LoanContext";
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
}

const navigation = [
  { name: "Dashboard", to: "/" },
  { name: "Transactions", to: "/transactions" },
  { name: "Loans", to: "/loans" },
  { name: "Repayments", to: "/repayments" },
];

const Navtop = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [showLoan, setShowLoan] = useState(true);

  const { balance, fetchBalance } = useBalance();
  const { loans, fetchLoans } = useLoan();

  const totalLoanBalance = loans.reduce(
    (total, loan) => total + parseFloat(loan.remaining_balance),0
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  const fetchUserData = async () => {
    try {
      const res = await api.get<{ user: User }>("/me");
      setUser(res.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchBalance();
    fetchLoans();
  }, []);

  const balanceColor = balance > 0 ? "text-green-500" : balance < 0 ? "text-red-500" : "text-gray-200";
  const loanColor = totalLoanBalance > 0 ? "text-orange-500" : totalLoanBalance < 0 ? "text-yellow-500" : "text-green-200";

  return (
    <nav className="bg-background border-b shadow-sm py-3 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <Link to="/" className="text-lg font-bold">
          FrontendPPM
        </Link>
        <div className="hidden sm:flex space-x-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Balance Display */}
        <div className="flex items-center gap-2">
          <span className={`font-medium ${balanceColor}`}>
            {showBalance ? `R ${balance.toFixed(2)}` : "R ••••••"}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* Loan Display */}
        <div className="flex items-center gap-2">
          <span className={`font-medium ${loanColor}`}>
            {showLoan ? `R ${totalLoanBalance.toFixed(2)}` : "R ••••••"}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowLoan(!showLoan)}
          >
            {showLoan ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarFallback>
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/users">Your Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navtop;
