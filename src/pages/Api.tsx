import Header from "@/components/myComponents/Header";
import BusinessTab from "@/components/myComponents/BusinessTab";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const API = () => {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    // Added type for 'path'
    const isActive = location.pathname === path;
    return cn(
      "flex-1 text-center px-4 py-2 rounded-md font-semibold transition-colors duration-200 text-sm",
      isActive
        ? "bg-white text-black dark:bg-white dark:text-black shadow-sm"
        : "bg-transparent text-foreground dark:text-foreground hover:text-foreground dark:hover:text-black",
    );
  };
  return (
    <div className="min-h-screen bg-[rgba(255,255,255,0.85)] dark:bg-[#0A0A0A] transition-colors duration-300">
      <Header />
      <div className="max-w-xs mx-auto mb-3 mt-4 md:hidden lg:hidden">
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
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <BusinessTab />
        </div>
      </div>
    </div>
  );
};

export default API;
