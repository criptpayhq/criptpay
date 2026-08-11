import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useAuthStore } from "../stores/auth-store";

import Header from "@/components/myComponents/Header";
import TransferForm from "@/components/myComponents/TransferForm";

const Transfer = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { setTokensFromURL } = useAuthStore();

  // Handle OAuth callback tokens from URL
  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      setTokensFromURL(accessToken, refreshToken);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, setTokensFromURL]);

  const getLinkClass = (path: string) => {
    const isActive =
      location.pathname === path ||
      (path === "/" && location.pathname.startsWith("transfer/status"));

    return cn(
      "flex-1 text-center px-4 py-2 rounded-md font-semibold transition-colors duration-200 text-sm",
      isActive
        ? "bg-white text-black dark:bg-white dark:text-black shadow-sm"
        : "bg-transparent text-black dark:text-foreground hover:text-foreground dark:hover:text-black",
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
      <Header />

      <div className="container mx-auto px-4 py-4">
        <div className="max-w-xs mx-auto mb-5 md:hidden lg:hidden">
          <div className="bg-[#b1f128] p-1 rounded-lg flex items-center gap-1">
            <NavLink to="/transfer" className={getLinkClass("/transfer")}>
              Transfer
            </NavLink>
            <NavLink to="/history" className={getLinkClass("/history")}>
              History
            </NavLink>
            <NavLink to="/api" className={getLinkClass("/api")}>
              API
            </NavLink>
          </div>
        </div>

        <div className="w-full text-center flex justify-center items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white flex text-center mb-5">
            Effortless Crypto Withdrawals <br className="hidden md:flex" /> to
            Your Local Bank
          </h1>
        </div>

        <TransferForm />
      </div>
    </div>
  );
};

export default Transfer;
