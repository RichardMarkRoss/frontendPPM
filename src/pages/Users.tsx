import { useEffect, useState } from "react";
import { api } from "../api/axios";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useAuth } from "../context/AuthContext";

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<{ id: number; name: string; email: string; role?: { id: number; name: string } }[]>([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchRoles();
      await fetchUsers();
      setLoading(false);
    };
    fetchData();
  }, []);

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      const res = await api.get("/roles");
      console.log("Roles API Response:", res.data);
      setRoles(Array.isArray(res.data) ? res.data : []);
      if (!selectedRole && res.data.length > 0) {
        setSelectedRole(res.data[0].id.toString());
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setRoles([]);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      console.log("Users API Response:", res.data);
      if (res.data && Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else {
        console.warn("Unexpected API response format:", res.data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    }
  };

  // Handle Create User
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !selectedRole) {
      setError("All fields are required!");
      return;
    }

    setError("");
    setSubmitLoading(true);

    try {
      await api.post("/users", {
        ...newUser,
        password_confirmation: newUser.password, // Required for Laravel
        role_id: Number(selectedRole),
      });

      setOpen(false);
      setNewUser({ name: "", email: "", password: "" });
      setSelectedRole(roles[0]?.id.toString() || "");
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || "User creation failed.");
      console.error("Failed to create user:", error.response?.data || error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Role Change
  const handleRoleChange = async (userId: number, newRoleId: string) => {
    try {
      await api.put(`/users/${userId}/role`, { role_id: Number(newRoleId) });
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
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
          <CardTitle>Users</CardTitle>
          {user?.role?.name === "Admin" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>+ New User</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                  {/* Role Selection */}
                  <Select onValueChange={(value) => setSelectedRole(value)} value={selectedRole}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateUser} disabled={submitLoading}>
                    {submitLoading ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>

        {error && <p className="text-sm text-red-600 px-6">{error}</p>}

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 1 ? (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Select onValueChange={(value) => handleRoleChange(u.id, value)} value={u.role?.id?.toString() || ""}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={u.role?.name || "No Role"} />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" onClick={() => handleDeleteUser(u.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center text-gray-500">No users found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
