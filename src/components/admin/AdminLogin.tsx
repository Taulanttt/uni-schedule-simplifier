// AdminLogin.tsx
import React, { useState } from "react";
import { Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // p.sh. POST /auth/login me { email, password }
      const res = await axiosInstance.post("/auth/login", {
        email: username,
        password: password,
      });

      // Ruajmë token në localStorage
      const { token, user } = res.data;
      localStorage.setItem("token", token);

      toast({
        title: "Hyrja u realizua me sukses",
        description: `Mirë se erdhe, ${user.name}`,
      });

      // Tani mund të lëvizim te /admin
      navigate("/admin");
    } catch (error) {
      console.error("Gabim gjatë hyrjes:", error);
      toast({
        title: "Hyrja dështoi",
        description: "Të dhënat e futura janë të pasakta. Provoni përsëri.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Hyrja si Admin</h1>
          <p className="mt-2 text-sm text-gray-500">
            Kyçuni për të hyrë në panelin administrativ
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Email-i</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe@example.com"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Fjalëkalimi</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="fjalëkalimi"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Duke u kyçur..." : "Kyçu"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
