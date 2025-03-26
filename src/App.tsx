import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, setAuthToken} from "./api/axios";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Dashboard";
import { ThemeProvider } from "./components/theme-provider";
import { BalanceProvider } from "./context/BalanceContext";
import Navtop from "./layouts/Navtop";
import Loans from "./pages/Loans";
import Transactions from "./pages/Transactions";
import Repayments from "./pages/Repayments";
import Users from "./pages/Users";
function App() {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	useEffect(() => {
		const token = localStorage.getItem("token");
		setAuthToken(token);
		if (token) {
			api.get("/me")
			.then(() => setIsAuthenticated(true))
			.catch(() => {
				setIsAuthenticated(false);
			});
		} else {
			setIsAuthenticated(false);
		}
	}, []);

	if (isAuthenticated === null) {
		return (
		<div className="h-screen flex justify-center items-center">
			
		</div>
		);
	}
    return (
		<BalanceProvider>
			<Router>
				<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				{isAuthenticated ? <Navtop/>: null}
					<Routes>
						<Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
						{!isAuthenticated && <Route path="/login" element={<Login />} />}
						{!isAuthenticated && <Route path="/register" element={<Registration />} />}
						{isAuthenticated && <Route path="/loans" element={<Loans/>} />}
						{isAuthenticated && <Route path="/transactions" element={<Transactions/>} />}
						{isAuthenticated && <Route path="/repayments" element={<Repayments/>} />}
						{isAuthenticated && <Route path="/users" element={<Users/>} />}
						<Route path="*" element={<Navigate to="/" />} />
					</Routes>
				</ThemeProvider>
	  		</Router>
		</BalanceProvider>
    );
}

export default App;