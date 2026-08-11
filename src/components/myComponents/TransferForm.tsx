import { useState, useEffect, useMemo } from "react";
import {
  ArrowUpDown,
  Loader2,
  Copy,
  Check,
  QrCode,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import SelectBank from "./SelectBank";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { useBankStore } from "@/stores/bank-store";
import { useAuthStore } from "@/stores/auth-store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProfileModal from "./ProfileModal";
import { useReferenceDataStore } from "@/stores/reference-data-store";

interface Currency {
  id?: string;
  symbol: string;
  name: string;
  icon: string;
  network?: string;
  network_icon?: string;
  address?: string;
}

interface Bank {
  code: string;
  name: string;
  icon: string;
}

interface Network {
  name: string;
  description: string;
  icon?: string;
}

const TransferForm = () => {
  const navigate = useNavigate();
  const [sendCurrency, setSendCurrency] = useState<Currency>({
    id: "base:usdc",
    symbol: "USDC",
    name: "USD Coin",
    network: "Base",
    network_icon:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png",
    address: "",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  });
  const [receiveCurrency, setReceiveCurrency] = useState<Currency>({
    symbol: "NGN",
    name: "Nigerian Naira",
    icon: "https://upload.wikimedia.org/wikipedia/commons/5/52/Flag_orb_Nigeria.svg",
  });
  const [sendAmount, setSendAmount] = useState<string>("");
  const [receiveAmount, setReceiveAmount] = useState<string>("0.00");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [isValidatingAccount, setIsValidatingAccount] = useState(false);
  const [isCreatingTransfer, setIsCreatingTransfer] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [fiatModalOpen, setFiatModalOpen] = useState(false);
  const [tokenSearch, setTokenSearch] = useState("");
  const [fiatSearch, setFiatSearch] = useState("");
  const [networkSearch, setNetworkSearch] = useState("");
  // const [networks, setNetworks] = useState<Network[]>([]);
  // const [tokens, setTokens] = useState<Currency[]>([]);
  // const [fiatList, setFiatList] = useState<Currency[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("All");

  // const [loadingNetworks, setLoadingNetworks] = useState(false);
  // const [loadingTokens, setLoadingTokens] = useState(false);
  // const [loadingFiat, setLoadingFiat] = useState(false);

  // const [banks, setBanks] = useState<Bank[]>([]);
  // const [loadingBanks, setLoadingBanks] = useState(false);

  const { savedBank, fetchBankDetails } = useBankStore();
  const [isUsingAutoFill, setIsUsingAutoFill] = useState(false);
  const [hasAutoFilledOnce, setHasAutoFilledOnce] = useState(false);

  const {
  banks,
  tokens,
  networks,
  fiatList,
  loadingBanks,
  loadingTokens: loadingNetworks, // same fetch populates both; reuse one loading flag
  loadingFiat,
  fetchBanks,
  fetchTokens,
  fetchFiat,
} = useReferenceDataStore();
const loadingTokens = loadingNetworks; // keep both names used in JSX working

  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const { user } = useAuthStore();
  const [showPasswordNotification, setShowPasswordNotification] =
    useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dynamicFee, setDynamicFee] = useState<number>(0);

  useEffect(() => {
    const dismissed = localStorage.getItem("password_notification_dismissed");
    if (user?.authProvider === "google" && !user?.hasPassword && !dismissed) {
      setShowPasswordNotification(true);
    }
  }, [user]);

  const dismissPasswordNotification = () => {
    setShowPasswordNotification(false);
    localStorage.setItem("password_notification_dismissed", "true");
  };

  useEffect(() => {
    const fetchLiveRate = async () => {
      setIsLoadingRate(true);
      try {
        const response = await api.post("/rate");
        if (response.data.success && response.data.rate)
          setLiveRate(response.data.rate);
      } catch (error: any) {
        console.error("Failed to fetch live rate:", error);
      } finally {
        setIsLoadingRate(false);
      }
    };
    fetchLiveRate();

    const fetchFee = async () => {
      try {
        const response = await api.get("/settings/developer-fee");
        if (response.data.success) setDynamicFee(response.data.fee);
      } catch (error) {
        console.error("Failed to fetch developer fee:", error);
      }
    };
    fetchFee();

    const interval = setInterval(fetchLiveRate, 200000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchBankDetails();
  }, [fetchBankDetails, user]);

  useEffect(() => {
    if (!user) return;
    const savedPayload = localStorage.getItem("landing_transfer");
    if (!savedPayload) return;
    try {
      const payload = JSON.parse(savedPayload);
      if (payload.sendCurrency) setSendCurrency(payload.sendCurrency);
      if (payload.receiveCurrency) setReceiveCurrency(payload.receiveCurrency);
      if (payload.sendAmount) setSendAmount(payload.sendAmount);
      if (payload.receiveAmount) setReceiveAmount(payload.receiveAmount);
      if (payload.selectedBank) setSelectedBank(payload.selectedBank);
      if (payload.accountNumber) setAccountNumber(payload.accountNumber);
      if (payload.accountName) setAccountName(payload.accountName);
      if (payload.beneficiaryId) setBeneficiaryId(payload.beneficiaryId);
      localStorage.removeItem("landing_transfer");
      toast.success("Conversion details restored. Continue your transfer.");
    } catch (error) {
      console.error("Failed to restore saved conversion details:", error);
    }
  }, [user]);

  useEffect(() => {
    if (savedBank && banks.length > 0 && !isUsingAutoFill) {
      const bank = banks.find((b) => b.code === savedBank.bankCode);
      if (bank) {
        setSelectedBank(bank);
        setAccountNumber(savedBank.accountNumber ?? "");
        setAccountName(savedBank.accountName ?? "");
        setIsUsingAutoFill(true);
        setHasAutoFilledOnce(true);
      }
    }
  }, [savedBank, banks, hasAutoFilledOnce]);

  const handleClearBankDetails = () => {
    setSelectedBank(null);
    setAccountNumber("");
    setAccountName("");
    setIsUsingAutoFill(false);
    toast.success("Bank details cleared. Enter manually.");
  };

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  useEffect(() => {
    if (tokenModalOpen) fetchTokens();
  }, [tokenModalOpen, fetchTokens]);

  useEffect(() => {
    if (fiatModalOpen) fetchFiat();
  }, [fiatModalOpen, fetchFiat]);

  useEffect(() => {
    if (networks.length > 0 && selectedNetwork === "All") {
      const baseNetwork = networks.find((n) => n.name.toLowerCase() === "base");
      setSelectedNetwork(baseNetwork ? baseNetwork.name : networks[0].name);
    }
  }, [networks, selectedNetwork]);

  const filteredNetworks = networks.filter((n) =>
    n.name.toLowerCase().includes(networkSearch.toLowerCase()),
  );
  const filteredTokens = tokens.filter((token) => {
    const matchesSearch =
      token.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      token.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      token.address?.toLowerCase().includes(tokenSearch.toLowerCase());
    return matchesSearch && token.network === selectedNetwork;
  });
  const filteredFiat = fiatList.filter(
    (c) =>
      c.name.toLowerCase().includes(fiatSearch.toLowerCase()) ||
      c.symbol.toLowerCase().includes(fiatSearch.toLowerCase()),
  );

  useEffect(() => {
    if (!sendAmount || sendAmount === "0") {
      setReceiveAmount("0.00");
      return;
    }
    const convertCurrency = async () => {
      setIsConverting(true);
      try {
        const assetId = sendCurrency.id || sendCurrency.symbol;
        const response = await api.post("/quote/offramp", {
          amount: parseFloat(sendAmount),
          currency: receiveCurrency.symbol || "NGN",
          asset: assetId,
          is_exact_output: false,
        });
        const data = response.data?.quote;
        if (data && data.output_amount) {
          setReceiveAmount(Number(data.output_amount).toFixed(2));
        } else {
          setReceiveAmount("0.00");
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.details ||
            error.response?.data?.message ||
            "Failed to fetch conversion quote",
        );
        setReceiveAmount("0.00");
      } finally {
        setIsConverting(false);
      }
    };
    const timer = setTimeout(convertCurrency, 500);
    return () => clearTimeout(timer);
  }, [sendAmount, sendCurrency, receiveCurrency]);

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      let isCancelled = false;
      setIsValidatingAccount(true);

      const validate = async () => {
        try {
          const response = await api.post("/validate-account", {
            bankCode: selectedBank.code,
            accountNumber,
          });

          if (isCancelled) return; // number changed/erased while request was in flight

          setAccountName(response.data.accountName);
          setBeneficiaryId(response.data.beneficiaryId);
          toast.success("Account validated");
        } catch (error) {
          if (isCancelled) return;

          console.error("Invalid account", error);
          toast.error("Invalid account");
          setAccountName("");
          setBeneficiaryId("");
        } finally {
          if (!isCancelled) setIsValidatingAccount(false);
        }
      };

      validate();

      return () => {
        isCancelled = true;
      };
    } else {
      setAccountName("");
      setBeneficiaryId("");
    }
  }, [accountNumber, selectedBank]);

  // useEffect(() => {
  //   if (accountNumber.length === 10 && selectedBank) {
  //     setIsValidatingAccount(true);
  //     const validate = async () => {
  //       try {
  //         const response = await api.post("/validate-account", {
  //           bankCode: selectedBank.code,
  //           accountNumber,
  //         });
  //         setAccountName(response.data.accountName);
  //         setBeneficiaryId(response.data.beneficiaryId);
  //         toast.success("Account validated");
  //       } catch (error) {
  //         console.error("Invalid account", error);
  //         toast.error("Invalid account");
  //         setAccountName("");
  //         setBeneficiaryId("");
  //       } finally {
  //         setIsValidatingAccount(false);
  //       }
  //     };
  //     validate();
  //   } else {
  //     setAccountName("");
  //     setBeneficiaryId("");
  //   }
  // }, [accountNumber, selectedBank]);

  const handleCreateTransfer = async () => {
    if (!sendAmount || !selectedBank || !accountNumber || !accountName) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!user) {
      try {
        const payload = {
          sendCurrency,
          receiveCurrency,
          sendAmount,
          receiveAmount,
          selectedBank,
          accountNumber,
          accountName,
          beneficiaryId,
        };
        localStorage.setItem("landing_transfer", JSON.stringify(payload));
        toast.success("Please sign in to continue. Your conversion was saved.");
        navigate("/login");
        return;
      } catch (err) {
        console.error("Failed to persist transfer before login:", err);
      }
    }
    setIsCreatingTransfer(true);
    try {
      const response = await api.post(
        "/create-transfer",
        {
          amount: parseFloat(sendAmount),
          receiveAmount: parseFloat(receiveAmount),
          fromCurrency: sendCurrency.symbol,
          toCurrency: receiveCurrency.symbol,
          network: sendCurrency.network,
          assetId: sendCurrency.id,
          bankCode: selectedBank.code,
          bankName: selectedBank.name,
          accountNumber,
          accountName,
          beneficiaryId,
        },
        { withCredentials: true },
      );
      const data = response.data?.data || response.data;
      const address = data?.address || data?.wallet_address || "";
      const id = data?.id || data?.transactionId || "";
      if (!address) throw new Error("No wallet address returned from backend");
      setWalletAddress(address);
      setTransactionId(id);
      toast.success("Transfer address created! Send crypto to the address.");
    } catch (error: any) {
      console.error("Create transfer failed:", error);
      toast.error(
        error.response?.data?.details ||
          error.response?.data?.message ||
          "Failed to create transfer",
      );
    } finally {
      setIsCreatingTransfer(false);
    }
  };

  const handleSent = () => navigate(`/status/${transactionId}`);

  const progress = useMemo(() => {
    let steps = 0;
    if (sendAmount && parseFloat(sendAmount) > 0) steps++;
    if (selectedBank) steps++;
    if (accountNumber && accountNumber.length === 10) steps++;
    if (accountName && accountName.length > 0) steps++;
    return steps;
  }, [sendAmount, selectedBank, accountNumber, accountName]);

  const getButtonText = () => {
    if (isCreatingTransfer) return "Creating transfer...";
    if (isValidatingAccount) return "Validating account...";
    if (progress === 0) return "Make Conversion";
    if (progress === 1) return "Choose Bank";
    if (progress === 2) return "Enter Account Number";
    if (progress === 3)
      return accountName ? "Make Conversion" : "Validating account...";
    if (progress === 4) return "Make Conversion";
    return "Make Conversion";
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isButtonActive =
    (progress === 4 || (progress === 3 && accountName)) && !isCreatingTransfer;

  /* Token selector pill button */
  const pillBtn = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    // background: "#2a2a2a",
    // border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "999px",
    padding: "6px 10px 6px 7px",
    cursor: "pointer",
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  };

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto" }}>
      {/* Password Notification */}
      {showPasswordNotification && (
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mb-3">
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">
              Secure your account! Add a password to enable email login.{" "}
              <button
                onClick={() => {
                  setShowProfileModal(true);
                  dismissPasswordNotification();
                }}
                className="font-medium underline hover:text-blue-600 cursor-pointer"
              >
                Add password now
              </button>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissPasswordNotification}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* ══════ MAIN CARD ══════ */}
      <div
        style={{
          background: "#1c1c1c",
          borderRadius: "18px",
          padding: "20px 18px 18px",
          border: "1px solid rgba(255,255,255,0.07)",
          // boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        }}
      >
        {/* Rate Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <div>
            <p style={{ fontSize: "12px", color: "#fff", marginBottom: "3px" }}>
              Our Rate
            </p>
            <p
              style={{
                fontSize: "19px",
                fontWeight: 800,
                color: "#b1f128",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {isLoadingRate
                ? "Loading..."
                : liveRate
                  ? `1 ${sendCurrency.symbol} = ${Number(liveRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${receiveCurrency.symbol}`
                  : "--"}
            </p>
          </div>
          {/* Overlapping icons */}
          <div
            style={{ display: "flex", alignItems: "center", marginTop: "2px" }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                overflow: "hidden",
                background: "#333",
                border: "2.5px solid #1c1c1c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 2,
              }}
            >
              {sendCurrency.icon ? (
                <img
                  src={sendCurrency.icon}
                  alt={sendCurrency.symbol}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span
                  style={{ fontSize: "12px", color: "#fff", fontWeight: 700 }}
                >
                  {sendCurrency.symbol.charAt(0)}
                </span>
              )}
            </div>
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                overflow: "hidden",
                background: "#333",
                border: "2.5px solid #1c1c1c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "-12px",
                position: "relative",
                zIndex: 1,
              }}
            >
              {receiveCurrency.icon ? (
                <img
                  src={receiveCurrency.icon}
                  alt={receiveCurrency.symbol}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span
                  style={{ fontSize: "12px", color: "#fff", fontWeight: 700 }}
                >
                  {receiveCurrency.symbol.charAt(0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Spend + Arrow + Receive stacked block ── */}
        <div style={{ position: "relative" }}>
          {/* YOU SPEND card */}
          <div
            style={{
              background: "#0d0d0d",
              borderRadius: "12px 12px",
              padding: "16px 16px 16px",
              border: "1px solid rgba(255,255,255,0.07)",
              borderBottom: "none",
              marginBottom: "10px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#fff",
                margin: 0,
                paddingTop: "2px",
              }}
            >
              You Spend
            </p>

            {/* Top row: label left, network+selector right */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              {/* Amount input */}
              <input
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => {
                  const { value } = e.target;
                  if (/^\d*\.?\d*$/.test(value)) setSendAmount(value);
                }}
                style={{
                  width: "100%",
                  fontSize: "34px",
                  fontWeight: 700,
                  color: sendAmount ? "#fff" : "#444",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  letterSpacing: "-0.02em",
                  padding: 0,
                  marginTop: "6px",
                  lineHeight: 1,
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "4px",
                }}
              >
                {sendCurrency.network && (
                  <p style={{ fontSize: "10px", color: "#555", margin: 0 }}>
                    {sendCurrency.symbol} on {sendCurrency.network}
                  </p>
                )}
                {/* Token Selector */}
                <Dialog open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
                  <DialogTrigger asChild>
                    <button style={pillBtn}>
                      {sendCurrency.icon && (
                        <img
                          src={sendCurrency.icon}
                          alt={sendCurrency.symbol}
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      {sendCurrency.symbol}
                      <ChevronDown size={13} style={{ color: "#888" }} />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-[94%] max-w-[1024px] sm:max-w-[60vw] max-h-[90vh] p-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                      <DialogTitle className="text-2xl">
                        Choose a token
                      </DialogTitle>
                      <DialogDescription>
                        Select a token to proceed with transfer.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col sm:flex-row h-[calc(85vh-120px)]">
                      <div className="sm:hidden border-b">
                        <button
                          onClick={() =>
                            setNetworkSearch(
                              networkSearch === "_toggle_" ? "" : "_toggle_",
                            )
                          }
                          className="flex justify-between items-center w-full px-4 py-3 text-base font-medium border-b bg-background"
                        >
                          <div className="flex items-center gap-2">
                            {networks.find((n) => n.name === selectedNetwork)
                              ?.icon ? (
                              <img
                                src={
                                  networks.find(
                                    (n) => n.name === selectedNetwork,
                                  )?.icon || ""
                                }
                                alt={selectedNetwork}
                                className="w-5 h-5 rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
                            )}
                            <span>{selectedNetwork}</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${networkSearch === "_toggle_" ? "rotate-180" : ""}`}
                          />
                        </button>
                        {networkSearch === "_toggle_" && (
                          <div className="max-h-[250px] overflow-y-auto p-2 space-y-1 border-t">
                            {networks.map((network, index) => (
                              <button
                                key={index}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${selectedNetwork === network.name ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                                onClick={() => {
                                  setSelectedNetwork(network.name);
                                  setNetworkSearch("");
                                }}
                              >
                                {network.icon ? (
                                  <img
                                    src={network.icon}
                                    alt={network.name}
                                    className="w-6 h-6 rounded-full"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
                                )}
                                <span className="font-medium">
                                  {network.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="hidden sm:block w-1/3 border-r p-4 overflow-y-auto">
                        <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">
                          Choose network
                        </h3>
                        <Input
                          placeholder="Search networks"
                          className="mb-3"
                          value={
                            networkSearch === "_toggle_" ? "" : networkSearch
                          }
                          onChange={(e) => setNetworkSearch(e.target.value)}
                        />
                        {loadingNetworks ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {filteredNetworks.map((network, index) => (
                              <button
                                key={index}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedNetwork === network.name ? "bg-gray-600 dark:bg-gray-200 text-primary-foreground" : "hover:bg-muted"}`}
                                onClick={() => setSelectedNetwork(network.name)}
                              >
                                <div className="flex items-center">
                                  {network.icon ? (
                                    <img
                                      src={network.icon}
                                      alt={network.name}
                                      className="w-6 h-6 mr-3 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 mr-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                                  )}
                                  <div>
                                    <div className="font-medium">
                                      {network.name}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {network.description}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4 overflow-y-auto">
                        <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase sm:block hidden">
                          Choose token
                        </h3>
                        <Input
                          placeholder="Search by name, symbol or address"
                          value={tokenSearch}
                          onChange={(e) => setTokenSearch(e.target.value)}
                          className="mb-4"
                        />
                        {loadingTokens ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        ) : filteredTokens.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No tokens found
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {filteredTokens.map((token, index) => (
                              <button
                                key={index}
                                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left border ${sendCurrency.symbol === token.symbol ? "border-primary bg-primary/10" : "border-transparent hover:border-primary/20"}`}
                                onClick={() => {
                                  setSendCurrency(token);
                                  setTokenModalOpen(false);
                                  setTokenSearch("");
                                  setNetworkSearch("");
                                  setSelectedNetwork(
                                    token.network || selectedNetwork,
                                  );
                                }}
                              >
                                {token.icon ? (
                                  <img
                                    src={token.icon}
                                    alt={token.symbol}
                                    className="w-10 h-10 rounded-full"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                    <span className="font-bold text-sm">
                                      {token.symbol.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold truncate">
                                    {token.symbol}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {token.name}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* YOU'LL RECEIVE card */}
          <div
            style={{
              background: "#0d0d0d",
              borderRadius: "12px 12px",
              padding: "16px 16px 16px",
              marginTop: "16px",
              border: "1px solid rgba(255,255,255,0.07)",
              borderTop: "none",
            }}
          >
            <p style={{ fontSize: "12px", color: "#fff", margin: 0 }}>
              You'll Receive
            </p>
            {/* Top row: label left, selector right */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              {/* Receive amount */}
              <p
                style={{
                  fontSize: "34px",
                  marginTop: "10px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: Number(receiveAmount) === 0 ? "#444" : "#fff",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {Number(receiveAmount) === 0
                  ? "0.00"
                  : Number(receiveAmount).toLocaleString(undefined, {
                      minimumFractionDigits:
                        Number(receiveAmount) < 1000 ? 2 : 0,
                      maximumFractionDigits: 2,
                    })}
              </p>
              {/* Fiat Selector */}
              <Dialog open={fiatModalOpen} onOpenChange={setFiatModalOpen}>
                <DialogTrigger asChild>
                  <button style={pillBtn}>
                    {receiveCurrency.icon && (
                      <img
                        src={receiveCurrency.icon}
                        alt={receiveCurrency.symbol}
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    {receiveCurrency.symbol}
                    <ChevronDown size={13} style={{ color: "#888" }} />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Choose a currency</DialogTitle>
                    <DialogDescription>
                      Select to proceed with transfer.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="Search by name or code"
                    value={fiatSearch}
                    onChange={(e) => setFiatSearch(e.target.value)}
                    className="mb-2"
                  />
                  {loadingFiat ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <div className="space-y-1">
                      {filteredFiat.map((currency, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setReceiveCurrency(currency);
                            setFiatModalOpen(false);
                          }}
                        >
                          {currency.icon ? (
                            <img
                              src={currency.icon}
                              alt={currency.symbol}
                              className="w-5 h-5 mr-2 rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 mr-2 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-xs font-bold">
                                {currency.symbol.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span>{currency.name}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Arrow — centered on the seam between the two cards */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "999px",
                background: "#b1f128",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                /* IMPORTANT */
                border: "6px solid #1c1c1c",
              }}
            >
              {isConverting ? (
                <Loader2 size={18} color="#000" className="animate-spin" />
              ) : (
                <ArrowUpDown size={18} color="#000" />
              )}
            </div>
          </div>
        </div>

        {/* ── Conversion Fee ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            margin: "12px 2px 12px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#fff" }}>
            Conversion fee:
          </span>
          <span style={{ fontSize: "13px", color: "#b1f128", fontWeight: 700 }}>
            {dynamicFee > 0 ? `${dynamicFee}%` : "0.5%"}
          </span>
        </div>

        {/* Auto-fill banner */}
        {isUsingAutoFill && savedBank && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(177,241,40,0.07)",
              borderRadius: "10px",
              padding: "8px 14px",
              marginBottom: "10px",
              fontSize: "12px",
              color: "#b1f128",
              border: "1px solid rgba(177,241,40,0.15)",
            }}
          >
            <span>✓ Using saved bank details</span>
            <button
              onClick={handleClearBankDetails}
              style={{
                fontSize: "11px",
                textDecoration: "underline",
                color: "#b1f128",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* ── Bank + Account joined bar ── */}
        <div style={{ display: "flex", height: "48px", marginBottom: "12px" }}>
          {/* Bank side — left rounded */}
          <div
            style={{
              flex: "0 0 36%",
              background: "#0d0d0d",
              borderRadius: "10px 0 0 10px",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRight: "none",
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {loadingBanks ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Loader2 size={15} color="#555" className="animate-spin" />
              </div>
            ) : (
              <div style={{ width: "100%", height: "100%" }}>
                <SelectBank
                  banks={banks}
                  selectedBank={selectedBank}
                  onBankChange={(bank) => {
                    setSelectedBank(bank);
                    if (isUsingAutoFill && bank.code !== savedBank?.bankCode)
                      setIsUsingAutoFill(false);
                  }}
                />
              </div>
            )}
          </div>
          {/* Vertical divider */}
          <div
            style={{
              width: "1px",
              background: "rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          />
          {/* Account number side — right rounded */}
          <input
            placeholder="Enter account number"
            value={accountNumber}
            onChange={(e) => {
              const newValue = e.target.value.replace(/\D/g, "").slice(0, 10);
              setAccountNumber(newValue);
              if (isUsingAutoFill && newValue !== savedBank?.accountNumber)
                setIsUsingAutoFill(false);
            }}
            style={{
              flex: 1,
              height: "100%",
              borderRadius: "0 10px 10px 0",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "none",
              background: "#0d0d0d",
              color: "#fff",
              padding: "0 14px",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        {/* Validating */}
        {isValidatingAccount && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "8px",
              fontSize: "12px",
              color: "#777",
            }}
          >
            <Loader2 size={13} className="animate-spin" />
            Validating account...
          </div>
        )}

        {/* Account name */}
        {accountName && (
          <div
            style={{
              marginBottom: "12px",
              borderRadius: "10px",
              border: "1px solid rgba(177,241,40,0.2)",
              background: "rgba(177,241,40,0.05)",
              padding: "8px 14px",
              fontSize: "13px",
              color: "#b1f128",
            }}
          >
            ✓ Account Name: {accountName}
          </div>
        )}

        {/* Wallet address block */}
        {walletAddress && (
          <div
            style={{
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#0d0d0d",
              overflow: "hidden",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "12px", color: "#aaa" }}>
                  Transfer{" "}
                  <strong style={{ color: "#fff" }}>
                    {sendAmount} {sendCurrency.symbol}
                  </strong>{" "}
                  on {sendCurrency.network} to
                </span>
                <div style={{ display: "flex", gap: "2px" }}>
                  <button
                    onClick={() => copyAddress(walletAddress)}
                    style={{
                      padding: "5px",
                      borderRadius: "6px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#777",
                    }}
                  >
                    {copied ? (
                      <Check size={14} color="#b1f128" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => setShowModal(true)}
                    style={{
                      padding: "5px",
                      borderRadius: "6px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#777",
                    }}
                  >
                    <QrCode size={14} />
                  </button>
                </div>
              </div>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  color: "#ddd",
                  marginTop: "5px",
                  wordBreak: "break-all",
                }}
              >
                {walletAddress}
              </p>
            </div>
            <div
              style={{
                padding: "8px 14px",
                background: "rgba(245,158,11,0.06)",
                borderLeft: "3px solid #f59e0b",
                display: "flex",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "13px" }}>⚠️</span>
              <p style={{ fontSize: "12px", color: "#fbbf24", margin: 0 }}>
                Only send tokens on {sendCurrency.network} to this address.
              </p>
            </div>
          </div>
        )}

        {/* CTA Button */}
        {walletAddress ? (
          <button
            onClick={handleSent}
            style={{
              width: "100%",
              height: "52px",
              borderRadius: "999px",
              background: "#b1f128",
              color: "#000",
              fontWeight: 800,
              fontSize: "16px",
              border: "none",
              cursor: "pointer",
            }}
          >
            I've made transfer
          </button>
        ) : (
          <button
            onClick={handleCreateTransfer}
            disabled={progress < 3 || !accountName || isCreatingTransfer}
            style={{
              width: "100%",
              height: "52px",
              borderRadius: "999px",
              background: "#b1f128",
              color: "#000",
              fontWeight: 800,
              fontSize: "16px",
              border: "none",
              cursor: isButtonActive ? "pointer" : "default",
              opacity: isButtonActive ? 1 : 0.5,
              transition: "opacity 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {isCreatingTransfer ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Creating
                transfer...
              </>
            ) : (
              getButtonText()
            )}
          </button>
        )}

        {walletAddress && (
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "#fff",
            }}
          >
            <span>
              Swap {sendAmount} {sendCurrency.symbol} → {receiveAmount}{" "}
              {receiveCurrency.symbol}
            </span>
            <span>Est. time: 30 secs</span>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              background: "#1c1c1c",
              borderRadius: "20px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.9)",
              maxWidth: "360px",
              width: "100%",
              position: "relative",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                background: "rgba(255,255,255,0.07)",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
              }}
            >
              <X size={13} />
            </button>
            <div
              style={{
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#fff",
                  margin: 0,
                }}
              >
                Send to this address
              </h3>
              <div
                style={{
                  background: "#fff",
                  padding: "12px",
                  borderRadius: "10px",
                }}
              >
                <QRCodeCanvas
                  value={walletAddress}
                  size={175}
                  level="H"
                  includeMargin
                />
              </div>
              <div
                style={{
                  width: "100%",
                  background: "#0d0d0d",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11px",
                    color: "#ccc",
                    wordBreak: "break-all",
                    margin: 0,
                  }}
                >
                  {walletAddress}
                </p>
                <button
                  onClick={() => copyAddress(walletAddress)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#aaa",
                    flexShrink: 0,
                  }}
                >
                  {copied ? (
                    <Check size={14} color="#b1f128" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{ fontSize: "11px", color: "#555", margin: "0 0 3px" }}
                >
                  Transaction ID: {transactionId}
                </p>
                <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>
                  Send {sendAmount} {sendCurrency.symbol} to this address for
                  auto-transfer to bank.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferForm;
