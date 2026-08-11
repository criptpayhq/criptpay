//import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Currency {
  symbol: string;
  name: string;
  icon: string;
  network?: string;
}

interface CurrencySelectProps {
  currencies: Currency[];
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const CurrencySelect = ({
  currencies,
  selectedCurrency,
  onCurrencyChange,
}: CurrencySelectProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center rounded-3xl border border-gray-600 bg-transparent text-black dark:text-white gap-2 min-w-[120px] justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {selectedCurrency.icon}
            </div>
            <span className="font-medium text-black dark:text-white">
              {selectedCurrency.symbol}
            </span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card border border-border shadow-lg">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.symbol}
            onClick={() => onCurrencyChange(currency)}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {currency.icon}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-black dark:text-white">
                {currency.symbol}
              </span>
              <span className="text-sm text-muted-foreground">
                {currency.name}
              </span>
              {currency.network && (
                <span className="text-xs text-muted-foreground">
                  {currency.network}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelect;
