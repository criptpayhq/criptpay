import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import {
  ArrowBigRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
  User,
  Edit,
  X,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useBankStore } from "@/stores/bank-store";
import { Card, CardContent } from "../ui/card";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import ProfileSelectBank from "./ProfileSelectBank";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Bank {
  code: string;
  name: string;
  icon: string;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, logout, checkAuth } = useAuthStore();
  const {
    savedBank,
    fetchBankDetails,
    saveOrUpdateBank,
    deleteBankDetails,
    isLoading: bankLoading,
  } = useBankStore();

  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [isValidatingAccount, setIsValidatingAccount] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Password states
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch banks and saved bank details on mount
  useEffect(() => {
    if (isOpen) {
      fetchBankDetails();

      setLoadingBanks(true);
      const fetchBanks = async () => {
        try {
          const response = await api.get("/banks");
          const mappedBanks = response.data.map((b: any) => ({
            code: b.code,
            name: b.name,
            icon: b.icon || "",
          }));
          setBanks(mappedBanks);
        } catch (error) {
          console.error("Failed to fetch banks", error);
          toast.error("Failed to fetch banks");
        } finally {
          setLoadingBanks(false);
        }
      };
      fetchBanks();
    }
  }, [isOpen, fetchBankDetails]);

  // Populate fields when savedBank is available
  useEffect(() => {
    if (savedBank && banks.length > 0) {
      const bank = banks.find((b) => b.code === savedBank.bankCode);
      if (bank) {
        setSelectedBank(bank);
      }
      setAccountNumber(savedBank.accountNumber);
      setAccountName(savedBank.accountName);
      setIsEditing(false);
    } else {
      // No saved bank, enable editing mode
      setIsEditing(true);
    }
  }, [savedBank, banks]);

  // Validate account number
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank && isEditing) {
      setIsValidatingAccount(true);
      const validate = async () => {
        try {
          const response = await api.post("/validate-account", {
            bankCode: selectedBank.code,
            accountNumber,
          });
          setAccountName(response.data.accountName);
          toast.success("Account validated");
        } catch (error) {
          console.error("Invalid account", error);
          toast.error("Invalid account");
          setAccountName("");
        } finally {
          setIsValidatingAccount(false);
        }
      };
      validate();
    } else if (accountNumber.length !== 10 && isEditing) {
      setAccountName("");
    }
  }, [accountNumber, selectedBank, isEditing]);

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteBankDetails();
    setSelectedBank(null);
    setAccountNumber("");
    setAccountName("");
    setIsEditing(true);
    setShowDeleteConfirm(false);
    setIsDeleting(false);
  };

  const handleCancelEdit = () => {
    if (savedBank && banks.length > 0) {
      // Restore saved values
      const bank = banks.find((b) => b.code === savedBank.bankCode);
      if (bank) {
        setSelectedBank(bank);
      }
      setAccountNumber(savedBank.accountNumber);
      setAccountName(savedBank.accountName);
      setIsEditing(false);
    } else {
      // If no saved bank, just clear fields
      setSelectedBank(null);
      setAccountNumber("");
      setAccountName("");
    }
  };

  const handleSave = async () => {
    if (!selectedBank || !accountNumber || !accountName) {
      toast.error("Please fill all bank details");
      return;
    }

    if (accountNumber.length !== 10) {
      toast.error("Account number must be 10 digits");
      return;
    }

    setIsSaving(true);
    const success = await saveOrUpdateBank({
      bankName: selectedBank.name,
      bankCode: selectedBank.code,
      accountNumber,
      accountName,
    });

    if (success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const canSave =
    selectedBank && accountNumber.length === 10 && accountName && isEditing;

  // const handlePasswordOpen = () => {
  //   setPasswordOpen(!passwordOpen);
  // };

  // const handleSavePassword = async () => {
  //   if (!newPassword || newPassword.length < 6) {
  //     toast.error("Password must be at least 6 characters long");
  //     return;
  //   }

  //   if (newPassword !== confirmPassword) {
  //     toast.error("Passwords do not match");
  //     return;
  //   }

  //   setIsSavingPassword(true);
  //   try {
  //     const response = await api.post("/users/add-password", {
  //       password: newPassword,
  //     });

  //     if (response.data.success) {
  //       toast.success("Password added successfully!");
  //       setNewPassword("");
  //       setConfirmPassword("");
  //       setPasswordOpen(false);
  //       // Refresh user data
  //       await checkAuth();
  //       // Close sections but keep modal open or close it? User might want to see it's done.
  //       // Let's just reset the form
  //       setNewPassword("");
  //       setConfirmPassword("");
  //       // setPasswordOpen(false); // Optional: keep open to show "Password added" state
  //     }
  //   } catch (error: any) {
  //     toast.error(error.response?.data?.message || "Failed to add password");
  //   } finally {
  //     setIsSavingPassword(false);
  //   }
  // };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl dark:bg-[#0A0A0A] max-h-[90vh] overflow-hidden flex flex-col border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Your Profile</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1 mt-2 mx-auto items-center w-full">
          <div className="text-gray-600 flex items-center justify-center cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full w-10 h-10 border border-gray-200 dark:border-gray-700">
            <User className="h-6 w-6" />
          </div>
          <h1 className="text-xl md:2xl font-bold dark:text-gray-50 text-gray-900">
            {user?.nickName ?? user?.nickName?.split(" ")[0] ?? "User"}
          </h1>
          <p>{user?.email}</p>

          <Card
            className="bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(40,40,40,0.4)] 
  shadow-xl text-black dark:text-white 
  border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] 
  hover:shadow-md transition-shadow w-full mt-5"
          >
            <CardContent className="">
              {/* TOP ROW */}
              <div className="flex gap-3 flex-row sm:items-center sm:justify-between">
                {/* Summary */}
                <h3>Bank Details</h3>

                {/* Toggle Button */}
                <button
                  onClick={handleOpen}
                  className="self-center sm:self-auto px-2 py-1 rounded-md bg-black/5 
        dark:bg-white/10 text-xs sm:text-sm flex items-center gap-1 cursor-pointer"
                >
                  {open ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* DETAILS */}
              {open && (
                <div className="flex flex-col w-full gap-2 border-t pt-3 mt-3 text-black dark:text-white">
                  {bankLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="w-full">
                        {loadingBanks ? (
                          <div className="flex items-center gap-1 rounded-2xl w-full border p-2 justify-center">
                            <Loader2 className="animate-spin" /> Loading banks
                          </div>
                        ) : (
                          <ProfileSelectBank
                            banks={banks}
                            selectedBank={selectedBank}
                            onBankChange={setSelectedBank}
                            disabled={!isEditing}
                          />
                        )}
                      </div>

                      <Input
                        placeholder="Enter account number"
                        value={accountNumber}
                        onChange={(e) =>
                          setAccountNumber(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        disabled={!isEditing}
                        className="w-full h-12 border dark:text-white text-black hover:border-success/50 focus:border-success transition-colors rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed"
                      />

                      {isValidatingAccount && isEditing && (
                        <div className="flex w-full items-center gap-2 mt-1 text-sm text-primary">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Validating account...
                        </div>
                      )}

                      {accountName && (
                        <div className="bg-success/10 text-black dark:text-white w-full mt-2 rounded-2xl border border-success/20 p-3">
                          <div className="text-sm text-success font-medium">
                            ✓ Account Name: {accountName}
                          </div>
                        </div>
                      )}

                      <div className="flex w-full justify-end gap-2 mt-2">
                        {isEditing ? (
                          <>
                            {savedBank && (
                              <Button
                                variant="outline"
                                className="w-max"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            )}
                            <Button
                              className="text-black bg-[#b1f128] w-max hover:bg-[#d4ff5c]"
                              onClick={handleSave}
                              disabled={!canSave || isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  {savedBank ? "Update" : "Save"}
                                </>
                              )}
                            </Button>
                          </>
                        ) : showDeleteConfirm ? (
                          <>
                            <span className="text-sm text-muted-foreground self-center mr-auto">
                              Delete saved bank details?
                            </span>
                            <Button
                              variant="outline"
                              className="w-max"
                              onClick={() => setShowDeleteConfirm(false)}
                              disabled={isDeleting}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              className="w-max"
                              onClick={handleDelete}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Confirm Delete
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              className="w-max text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              onClick={() => setShowDeleteConfirm(true)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                            <Button
                              variant="outline"
                              className="w-max"
                              onClick={handleEdit}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Section */}
          {/* <Card
            className="bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(40,40,40,0.4)] 
  shadow-xl text-black dark:text-white 
  border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)] 
  hover:shadow-md transition-shadow w-full mt-3"
          >
            <CardContent className="">
              <div className="flex gap-3 flex-row sm:items-center sm:justify-between">
                <h3>Password</h3>
                <button
                  onClick={handlePasswordOpen}
                  className="self-center sm:self-auto px-2 py-1 rounded-md bg-black/5 
        dark:bg-white/10 text-xs sm:text-sm flex items-center gap-1 cursor-pointer"
                >
                  {passwordOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {passwordOpen && (
                <div className="flex flex-col w-full gap-3 border-t pt-3 mt-3 text-black dark:text-white">
                  {user?.hasPassword ? (
                    <div className="bg-success/10 text-black dark:text-white w-full rounded-2xl border border-success/20 p-3">
                      <div className="text-sm text-success font-medium">
                        ✓ Password added
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Password not yet added. Add a password to enable email/password login.
                      </p>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full h-12 border dark:text-white text-black hover:border-success/50 focus:border-success transition-colors rounded-2xl pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full h-12 border dark:text-white text-black hover:border-success/50 focus:border-success transition-colors rounded-2xl pr-10"
                        />
                      </div>
                      <div className="flex w-full justify-end gap-2">
                        <Button
                          className="text-black bg-[#b1f128] w-max hover:bg-[#d4ff5c]"
                          onClick={handleSavePassword}
                          disabled={isSavingPassword || !newPassword || !confirmPassword}
                        >
                          {isSavingPassword ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Password
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card> */}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end dark:bg-[#0A0A0A] pt-6 border-t mb-1">
          <div className="flex">
            <Button className="border-red-500" onClick={logout}>
              LogOut <ArrowBigRight />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
