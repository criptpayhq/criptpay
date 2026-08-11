import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface Bank {
  code: string;
  name: string;
  icon: string;
}

interface BankSelectProps {
  banks: Bank[];
  selectedBank: Bank | null;
  onBankChange: (bank: Bank) => void;
}

const SelectBank = ({ banks, selectedBank, onBankChange }: BankSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBankSelect = (bank: Bank) => {
    onBankChange(bank);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          // variant="outline"
          className="w-full flex justify-between overflow-hidden items-center bg-transparent text-left h-12 rounded-l-2xl rounded-r-none hover:border-success/50 focus:border-success transition-colors"
        >
          <span
            className={
              selectedBank
                ? "text-black dark:text-white"
                : "text-black dark:text-white"
            }
          >
            {selectedBank ? selectedBank.name : "Choose bank"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose a bank</DialogTitle>
          <DialogDescription>
            Select a bank to proceed with transfer.
          </DialogDescription>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search banks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-border/50 focus:border-success overflow-hidden"
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filteredBanks.length > 0 ? (
            filteredBanks.map((bank) => (
              <Button
                key={bank.code}
                variant="ghost"
                className="w-full justify-start mb-2 text-left p-3 hover:bg-success/5 focus:bg-success/5 transition-colors scroll-mx-0"
                onClick={() => handleBankSelect(bank)}
              >
                {bank.icon ? (
                  <img
                    src={bank.icon}
                    alt={bank.name}
                    className="w-5 h-5 mr-2 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 mr-2 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {bank.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-foreground font-medium">
                    {bank.name}
                  </span>
                  {/* <span className="text-xs text-muted-foreground">
                    Code: {bank.code}
                  </span> */}
                </div>
              </Button>
            ))
          ) : (
            <div className="p-3 text-center text-muted-foreground">
              No banks found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectBank;
