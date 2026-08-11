"use client";

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
import { Mail, Lock, LucideEye, LucideEyeOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin, isLoading, isGoogleLoading } = useAuthStore();

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  // const handleGoogleLogin = () => {
  //   googleLogin();
  // };

  return (
    <div className="min-h-screen bg-[rgba(255,255,255,0.85)] dark:bg-[#0A0A0A] transition-colors duration-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div>
          <div className="bg-red-700 w-full flex" />
            <Link to="/" className="flex gap-1 justify-start text-center mb-6">
              <ArrowLeft />
              <p>Back</p>
            </Link>
          </div>
        <motion.div
          className="sm:mx-auto sm:w-full sm:max-w-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link to="/" className="text-center">
            <img
              src="/Criptpay-Favicon.png"
              alt="Criptpay Logo"
              className="w-15 h-15 mx-auto mb-8"
            />
            {/* <p className="text-gray-600 mt-5">Login to your account</p> */}
          </Link>
        </motion.div>

        <motion.div
          className=" mt-2 sm:mx-auto sm:w-full sm:max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="shadow-lg bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(40,40,40,0.4)] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-500">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-500">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
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
                  {/* <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div> */}
                </div>

                <Button
                  type="submit"
                  className="w-full text-black bg-[#b1f128] hover:bg-[#b1f128]/80 cursor-pointer"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {/* <div className="mt-3 text-center text-sm">
                <span className="text-gray-600 dark:text-gray-500">or</span>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full gap-3 mt-2 bg-[#b1f128] text-black cursor-pointer py-2.5 rounded-[10px] flex justify-center items-center"
                >
                  <img
                    src="/pngwing.com.png"
                    alt="google"
                    className="w-6 h-6"
                  />
                  <p className="text-black text-sm font-normal">
                    
                    {isGoogleLoading ? ( <Loader2 className="animate-spin"/>): ("Login with Google")}
                  </p>
                </button>
              </div> */}

              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600 dark:text-gray-500">
                  Don&apos;t have an account?{" "}
                </span>
                <Link
                  to="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
