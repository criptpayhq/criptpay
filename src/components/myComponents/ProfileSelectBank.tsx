import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Input } from "../ui/input";

interface Bank {
  code: string;
  name: string;
  icon: string;
}

interface ProfileSelectBankProps {
  banks: Bank[];
  selectedBank: Bank | null;
  onBankChange: (bank: Bank) => void;
  disabled?: boolean;
}

export default function ProfileSelectBank({
  banks,
  selectedBank,
  onBankChange,
  disabled = false,
}: ProfileSelectBankProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBankSelect = (bank: Bank) => {
    onBankChange(bank);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-12 px-4 flex items-center justify-between gap-2 
          bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 
          rounded-2xl transition-colors
          ${
            !disabled
              ? "hover:border-success/50 focus:border-success cursor-pointer"
              : "opacity-60 cursor-not-allowed"
          }
        `}
      >
        {selectedBank ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedBank.icon && (
              <img
                src={selectedBank.icon}
                alt={selectedBank.name}
                className="w-6 h-6 rounded-full flex-shrink-0"
              />
            )}
            <span className="truncate text-sm">{selectedBank.name}</span>
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Select bank
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg max-h-[300px] overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search banks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-[240px]">
            {filteredBanks.length > 0 ? (
              filteredBanks.map((bank) => (
                <button
                  key={bank.code}
                  onClick={() => handleBankSelect(bank)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-left"
                >
                  {bank.icon && (
                    <img
                      src={bank.icon}
                      alt={bank.name}
                      className="w-6 h-6 rounded-full flex-shrink-0"
                    />
                  )}
                  <span className="flex-1 text-sm truncate">{bank.name}</span>
                  {selectedBank?.code === bank.code && (
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                No banks found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
