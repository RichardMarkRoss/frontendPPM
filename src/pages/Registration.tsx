import {useState} from "react";
import {Input} from "../components/ui/input";
import {Button} from "../components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle
} from "../components/ui/card";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

const Registration = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const {register} = useAuth();
	const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        await register(name, email, password, passwordConfirmation);
        console.log("Registration successful");
        navigate("/");
        window.location.reload();
    } catch (err: any) {
        console.error("Registration Error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Registration failed");
    } finally {
        setLoading(false);
    }
};

	return (
		<div className="min-h-screen flex items-center justify-center">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-center">Create an Account</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleRegister}
						className="space-y-4">
						{
						error && <p className="text-sm text-red-600 text-center">
							{error}</p>
					}
						<Input type="text" placeholder="Full Name"
							value={name}
							onChange={
								(e) => setName(e.target.value)
							}
							required/>
						<Input type="email" placeholder="Email"
							value={email}
							onChange={
								(e) => setEmail(e.target.value)
							}
							required/>
						<Input type="password" placeholder="Password"
							value={password}
							onChange={
								(e) => setPassword(e.target.value)
							}
							required/>
						<Input type="password" placeholder="Confirm Password"
							value={passwordConfirmation}
							onChange={
								(e) => setPasswordConfirmation(e.target.value)
							}
							required/>
						<Button type="submit" className="w-full"
							disabled={loading}>
							{
							loading ? "Creating Account..." : "Register"
						}</Button>
					</form>
				</CardContent>
				<CardFooter className="justify-center">
					<Link to="/login">
						<Button variant="link" className="text-sm">Sign In</Button>
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Registration;
