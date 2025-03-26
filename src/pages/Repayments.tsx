import { useState, useEffect } from "react";
import { api } from "../api/axios";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useLoan } from "../context/LoanContext";

const Repayments = () => {
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { loans, fetchLoans } = useLoan();

  useEffect(() => {
    fetchLoans();
  }, []);

  const unpaidLoans = loans.filter((loan) => loan.status !== "paid");

  const handleRepayment = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post(`/loans/${selectedLoanId}/repayments`, {
        amount: parseFloat(amount),
      });

      setMessage(res.data.message);
      setAmount("");
      setSelectedLoanId("");
      await fetchLoans();
    } catch (err: any) {
      setError(err.response?.data?.message || "Repayment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Make a Repayment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && <p className="text-green-500">{message}</p>}
          {error && <p className="text-red-500">{error}</p>}

          <select
            value={selectedLoanId}
            onChange={(e) => setSelectedLoanId(e.target.value)}
            className="w-full border border-input bg-background py-2 px-3 rounded-md"
            required
          >
            <option value="">Select Loan ID</option>
            {unpaidLoans.length > 0 ? (
              unpaidLoans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  Loan #{loan.id} - Remaining: R {parseFloat(loan.remaining_balance).toFixed(2)}
                </option>
              ))
            ) : (
              <option disabled>No unpaid loans available</option>
            )}
          </select>

          <Input
            placeholder="Amount to repay"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleRepayment}
            disabled={loading || !selectedLoanId || !amount}
          >
            {loading ? "Processing..." : "Repay Loan"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Repayments;
