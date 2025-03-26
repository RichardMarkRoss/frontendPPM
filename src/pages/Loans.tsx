import { useEffect, useState } from "react";
import { api } from "../api/axios";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "../components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import { useBalance } from "../context/BalanceContext";
import { useLoan } from "../context/LoanContext";

const Loans = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ amount: "", term: "3" });
  const [submitLoading, setSubmitLoading] = useState(false);

  const { loans, fetchLoans } = useLoan();
  const { fetchBalance } = useBalance();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchLoans();
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCreateLoan = async () => {
    setSubmitLoading(true);
    setError("");

    try {
      await api.post("/loans", {
        amount: Number(formData.amount),
        term: Number(formData.term),
      });

      setOpen(false);
      setFormData({ amount: "", term: "3" });
      await fetchLoans();
      await fetchBalance();
    } catch (err) {
      setError("Loan creation failed.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Loans</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>+ New Loan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Loan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Loan Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
                <select
                  className="w-full border border-input bg-background py-2 px-3 rounded-md"
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                >
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                </select>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateLoan} disabled={submitLoading}>
                  {submitLoading ? "Creating..." : "Create Loan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        {error && <p className="text-sm text-red-600 px-6">{error}</p>}

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Remaining Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.id}</TableCell>
                  <TableCell>R {parseFloat(loan.amount).toFixed(2)}</TableCell>
                  <TableCell>{loan.term} months</TableCell>
                  <TableCell>R {parseFloat(loan.remaining_balance).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={loan.status === "active" ? "default" : "secondary"}>
                      {loan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(loan.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Loans;
