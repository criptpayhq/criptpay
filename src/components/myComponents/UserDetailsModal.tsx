import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface User {
  _id: string;
  nickName: string;
  email: string;
  avatar: string;
  authProvider: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  googleId?: string;
}

interface UserDetailsModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const UserDetailsModal = ({
  user,
  open,
  onOpenChange,
}: UserDetailsModalProps) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#0A0A0A] text-black dark:text-white border-black/10 dark:border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative flex h-24 w-24 shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
            {user.avatar ? (
              <img
                className="aspect-square h-full w-full object-cover"
                src={user.avatar}
                alt={user.nickName}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 text-2xl font-medium">
                {user.nickName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold">{user.nickName}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex gap-2 justify-center">
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {user.authProvider}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4 border-black/10 dark:border-white/10">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">User ID</p>
              <p className="font-mono text-xs mt-1 truncate" title={user._id}>
                {user._id}
              </p>
            </div>
            {user.googleId && (
              <div>
                <p className="text-muted-foreground">Google ID</p>
                <p
                  className="font-mono text-xs mt-1 truncate"
                  title={user.googleId}
                >
                  {user.googleId}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Joined</p>
              <p className="mt-1">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="mt-1">{formatDate(user.updatedAt)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
