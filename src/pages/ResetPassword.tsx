import { useState } from "react";
import { useAuthStore } from "../stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, LucideEye, LucideEyeOff } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { resetPassword, isLoading } = useAuthStore();

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return; // Add a toast error here if you use toast
    }
    try {
      await resetPassword(token!, password);
      navigate("/");
    } catch (error) {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-[rgba(255,255,255,0.85)] dark:bg-[#0A0A0A] transition-colors duration-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center"
        >
          <img
            src="/Criptpay-Favicon.png"
            alt="Criptpay Logo"
            className="w-15 h-15 mx-auto"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="shadow-lg bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(40,40,40,0.4)] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                Reset Password
              </CardTitle>
              <CardDescription className="text-center">
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-500">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                    {showPassword ? (
                      <LucideEye
                        className="absolute right-3 top-1 cursor-pointer h-4 w-4 mt-2 z-50"
                        onClick={togglePassword}
                      />
                    ) : (
                      <LucideEyeOff
                        className="absolute right-3 top-1 cursor-pointer h-4 w-4 mt-2 z-50"
                        onClick={togglePassword}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-500">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full text-black bg-[#b1f128] hover:bg-[#b1f128]/80 cursor-pointer"
                  disabled={isLoading || password !== confirmPassword}
                  size="lg"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
