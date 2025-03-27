import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ user: User }>("/me");
      setUser(res.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Skeleton className="h-[250px] w-[350px]" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen px-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="flex flex-col items-center justify-center">
          <Avatar className="w-32 h-32 text-4xl">
            <AvatarFallback>
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-xl">{user.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> #{user.id}</p>
          <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
