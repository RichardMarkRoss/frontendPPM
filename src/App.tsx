import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { BalanceProvider } from "./context/BalanceContext";
import { LoanProvider } from "./context/LoanContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navtop from "./layouts/Navtop";
import Dashboard from "./pages/Dashboard";
import Loans from "./pages/Loans";
import Transactions from "./pages/Transactions";
import Repayments from "./pages/Repayments";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import { Skeleton } from "./components/ui/skeleton";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <BalanceProvider>
        <LoanProvider>
          <Router>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <AuthWrapper />
            </ThemeProvider>
          </Router>
        </LoanProvider>
      </BalanceProvider>
    </AuthProvider>
  );
}

// Handles authentication-based routes
function AuthWrapper() {
	const { isAuthenticated } = useAuth();
  
	if (isAuthenticated === null) {
	  return (
		<div className="p-6 max-w-4xl mx-auto">
		  <Skeleton className="h-6 w-32 mb-4" />
		  <Skeleton className="h-[300px] w-full" />
		</div>
	  );
	}
  
	return (
	  <>
		{isAuthenticated && <Navtop />}
		<Routes>
		  <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
		  {!isAuthenticated && <Route path="/login" element={<Login />} />}
		  {!isAuthenticated && <Route path="/register" element={<Registration />} />}
		  {isAuthenticated && <Route path="/loans" element={<Loans />} />}
		  {isAuthenticated && <Route path="/transactions" element={<Transactions />} />}
		  {isAuthenticated && <Route path="/repayments" element={<Repayments />} />}
		  {isAuthenticated && <Route path="/users" element={<Users />} />}
		  {isAuthenticated && <Route path="/profile" element={<Profile />} />}
		  <Route path="*" element={<Navigate to="/" />} />
		</Routes>
	  </>
	);
}
  

export default App;
