import { Link, useLocation } from "react-router-dom";
import { Headphones, User } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "@/context/ThemeContext";
import ProfileModal from "../myComponents/ProfileModal";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

type NavItem = {
  path: string;
  label: string;
};

const Header = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const navItems: NavItem[] = [
    { path: "/transfer", label: "Transfer" },
    { path: "/history", label: "History" },
    { path: "/api", label: "API" },
    ...(isAdmin ? [{ path: "/dashboard", label: "Dash" }] : []),
  ];

  const [showProfileModal, setShowProfileModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSupportClick = () => {
    window.open("https://t.me/Criptpay", "_blank");
  };

  const isActive = (path: string) => {
    if (path === "/transfer") {
      return (
        location.pathname === "/transfer" ||
        location.pathname.startsWith("/status")
      );
    }
    return location.pathname === path;
  };

  const handleActionClick = () => {
    setShowProfileModal(true);
  };

  return (
    <header className="w-full pt-2 md:pt-5 pb-1 lg:pt-7 px-1 top-0 z-50 bg-white text-black dark:bg-[#0A0A0A] dark:text-white transition-colors duration-300">
      <div className="flex items-center justify-between px-4 py-2 max-w-[550px] mx-auto">
        <Link
          to="/transfer"
          className="flex items-center gap-1 transition-all duration-300"
        >
          <img
            src="/Criptpay-Favicon.png"
            alt="Criptpay Logo"
            className="h-12 w-12"
          />
        </Link>

        <nav className="hidden md:flex justify-between max-w-sm w-[250px] items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 border-gray-200/80 border w-full text-center py-2 rounded-lg font-medium transition-all duration-200 relative 
                ${
                  isActive(item.path)
                    ? "bg-[#b1f128] text-black shadow-lg"
                    : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-gray-300"
                }
              `}
            >
              {item.label}
              {item.path === "/api" && (
                <span className="absolute -top-1 -right-1 bg-[#b1f128] text-black text-[9px] px-1 py-0.5 rounded-md font-bold uppercase">
                  NEW
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center ml-1 gap-1.5 ">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full w-10 h-10 border border-gray-200 dark:border-gray-700"
            onClick={handleSupportClick}
            title="Contact Support"
          >
            <Headphones className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="My Account"
            onClick={handleActionClick}
            className="text-gray-600 cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full w-10 h-10 border border-gray-200 dark:border-gray-700"
          >
            <User className="h-6 w-6" />
          </Button>

          <button
            onClick={toggleTheme}
            title="toggle mode"
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white cursor-pointer border border-gray-200 dark:border-gray-700"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
        </div>

        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      </div>
    </header>
  );
};

export default Header;
