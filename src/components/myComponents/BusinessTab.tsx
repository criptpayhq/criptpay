import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBusinessStore } from "@/stores/business-store";
import {
  Loader2,
  Key,
  Info,
  Check,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { ensureProtocol } from "@/utils/formatUrl";

const BusinessTab = () => {
  const {
    businesses,
    fetchMyBusinesses,
    createBusiness,
    requestApiKey,
    requestViewApiKeyOtp,
    verifyViewApiKeyOtp,
    loading,
    creating,
  } = useBusinessStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null,
  );
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    website: "",
    description: "",
    type: "To Customer",
    isRegistered: false,
  });
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchMyBusinesses();
  }, [fetchMyBusinesses]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isRegistered: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBusiness(formData);
    setIsCreateOpen(false);
    setFormData({
      name: "",
      address: "",
      email: "",
      website: "",
      description: "",
      type: "To Customer",
      isRegistered: false,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const toggleKeyVisibility = (id: string) => {
    const business = businesses.find((b) => b._id === id);
    if (!visibleKeys[id] && business?.apiKey?.includes("*")) {
      // Key is masked, request OTP
      handleRequestOtp(id);
      return;
    }
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRequestOtp = async (id: string) => {
    const success = await requestViewApiKeyOtp(id);
    if (success) {
      setSelectedBusinessId(id);
      setIsOtpOpen(true);
      setOtp("");
    }
  };

  const handleVerifyOtp = async () => {
    if (!selectedBusinessId || !otp) return;
    setVerifying(true);
    const key = await verifyViewApiKeyOtp(selectedBusinessId, otp);
    setVerifying(false);
    if (key) {
      setIsOtpOpen(false);
      setVisibleKeys((prev) => ({ ...prev, [selectedBusinessId]: true }));
    }
  };

  const customer_support_mail = "criptpayhq@gmail.com";

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Businesses
          </h1>
          <p className="text-muted-foreground">
            Manage your businesses and API keys.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <a
              href="https://criptpay.mintlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              API Documentation
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">Create Business</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#0A0A0A] text-black dark:text-white border-black/10 dark:border-white/10">
              <DialogHeader>
                <DialogTitle>Create New Business</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Business Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="type"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="To Customer">To Customer</option>
                      <option value="To Business">To Business</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Business Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="website"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Website URL
                  </label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="address"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRegistered"
                    checked={formData.isRegistered}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="isRegistered"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Is this a registered business?
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create Business
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-gray-50 dark:bg-gray-900/50 border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-muted-foreground">
            You haven't created any businesses yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Card
              key={business._id}
              className="bg-white/50 dark:bg-gray-900/50 backdrop-blur border-black/10 dark:border-white/10"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{business.name}</CardTitle>
                    <CardDescription>{business.email}</CardDescription>
                    {business.website && (
                      <a
                        href={ensureProtocol(business.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline block mt-1"
                      >
                        {business.website}
                      </a>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`capitalize 
                    ${business.status === "active" ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : ""}
                    ${business.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800" : ""}
                    ${business.status === "rejected" ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" : ""}
                    ${business.status === "new" ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" : ""}
                  `}
                  >
                    {business.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {business.description}
                </p>

                {business.status !== "rejected" && business.apiKey ? (
                  <div className="p-3 bg-muted rounded-md relative group">
                    <p className="text-xs font-mono text-muted-foreground mb-1">
                      API Key
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-sm font-bold truncate flex-1">
                        {visibleKeys[business._id]
                          ? business.apiKey
                          : "•".repeat(24)}
                      </code>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => toggleKeyVisibility(business._id)}
                        >
                          {visibleKeys[business._id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(business.apiKey!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
                    <Info className="h-4 w-4" />
                    {business.status === "pending"
                      ? "API Key request is pending approval."
                      : business.status === "rejected"
                        ? "Request rejected. See details below."
                        : "No API Key generated yet."}
                  </div>
                )}

                {business.status === "rejected" && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-sm text-red-600 dark:text-red-400">
                    <p className="font-semibold mb-1">Rejection Reason:</p>
                    <p>{business.rejectionReason}</p>
                    {business.supportContact && (
                      <p className="mt-2 text-xs">
                        Support:{" "}
                        <a
                          href={`mailto:${business.supportContact}`}
                          className="underline"
                        >
                          {business.supportContact}
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {!business.apiKey &&
                  business.status !== "pending" &&
                  business.status !== "rejected" && (
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2"
                      onClick={() => requestApiKey(business._id)}
                    >
                      <Key className="h-4 w-4" />
                      Request API Key
                    </Button>
                  )}
                <div className="flex flex-col gap-4">
                  {business.status === "pending" && (
                    <Button
                      variant="outline"
                      disabled
                      className="w-full opacity-75"
                    >
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Request...
                    </Button>
                  )}
                  {business.status === "pending" && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-200 text-xs">
                        You can reach out to customer support for fast approval:
                      </p>
                      <a
                        href={`mailto:${customer_support_mail}`}
                        className="text-black dark:text-white underline text-sm"
                      >
                        {customer_support_mail}
                      </a>
                    </div>
                  )}
                </div>
                {business.status === "active" && business.apiKey && (
                  <div className="w-full text-center text-xs text-muted-foreground">
                    <Check className="inline h-3 w-3 mr-1 text-green-500" />
                    API Access Active
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* OTP Dialog */}
      <Dialog open={isOtpOpen} onOpenChange={setIsOtpOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-[#0A0A0A] text-black dark:text-white border-black/10 dark:border-white/10">
          <DialogHeader>
            <DialogTitle>View API Key Verification</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              We've sent a 6-digit OTP to your business email. Please enter it
              below to view your API key.
            </p>
            <div className="flex justify-center">
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="text-center text-2xl tracking-[1em] font-mono h-14"
                maxLength={6}
              />
            </div>
            <Button
              onClick={handleVerifyOtp}
              className="w-full"
              disabled={verifying || otp.length !== 6}
            >
              {verifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Verify & Show Key
            </Button>
            <Button
              variant="ghost"
              className="w-full text-xs"
              onClick={() => handleRequestOtp(selectedBusinessId!)}
              disabled={verifying}
            >
              Resend OTP
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessTab;
