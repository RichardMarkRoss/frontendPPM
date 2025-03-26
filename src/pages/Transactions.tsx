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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { useBalance } from "../context/BalanceContext";

interface Transaction {
  id: number;
  debit_card_id: number;
  amount: string;
  type: "deposit" | "withdrawal" | "purchase";
  status: string;
  created_at: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [debitCards, setDebitCards] = useState([]);
  const [formData, setFormData] = useState({ debit_card_id: "", amount: "", type: "purchase" });
  const [submitLoading, setSubmitLoading] = useState(false);
  const { fetchBalance } = useBalance();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get<Transaction[]>("/transactions");
      setTransactions(res.data);
    } catch (err) {
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    api.get("/debit-cards")
      .then(res => setDebitCards(res.data))
      .catch(err => console.error('Error fetching cards:', err));
  }, []);
  
  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      await api.post("/transactions", {
        debit_card_id: Number(formData.debit_card_id),
        amount: Number(formData.amount),
        type: formData.type,
      });
      setOpen(false);
      setFormData({ debit_card_id: "", amount: "", type: "purchase" });
      fetchTransactions();
      fetchBalance();
    } catch (err) {
      setError("Transaction failed.");
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
          <CardTitle>Transactions</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>+ New Transaction</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
              <Select
                  value={formData.debit_card_id}
                  onValueChange={(value) => setFormData({ ...formData, debit_card_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={"-- Choose Card --"} />
                  </SelectTrigger>
                  <SelectContent>
                    {debitCards.map(card => (
                      <SelectItem key={card.id} value={String(card.id)}>
                        {`Card ending in ${card.card_number.slice(-4)} - Balance: R${parseFloat(card.balance).toFixed(2)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
                <select
                  className="w-full border border-input bg-background py-2 px-3 rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="purchase">Purchase</option>
                </select>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={submitLoading}>
                  {submitLoading ? "Creating..." : "Create"}
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
                <TableHead>Debit Card ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{transaction.debit_card_id}</TableCell>
                  <TableCell>R{parseFloat(transaction.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.type === "deposit"
                          ? "default"
                          : transaction.type === "withdrawal"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.status}</TableCell>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
