import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Loader2 } from "lucide-react";
import { useUserStore } from "@/stores/user-store";
import UserDetailsModal from "./UserDetailsModal";

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

const UserTable = () => {
  const { users, loading, fetchAllUsers } = useUserStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const filteredUsers = users.filter((user) =>
    user.nickName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-black dark:text-white"
          />
        </div>
        <div className="text-sm text-muted-foreground ml-auto">
            Total Users: {users.length}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-100 dark:bg-gray-900 text-left">
            <tr>
              <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10 whitespace-nowrap">User</th>
              <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10 whitespace-nowrap">Email</th>
              <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10 whitespace-nowrap">Role</th>
              <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10 whitespace-nowrap">Status</th>
              <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10 whitespace-nowrap">Joined</th>
              <th className="px-3 py-3 font-semibold border-b border-black/10 dark:border-white/10 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center border-b border-black/5 dark:border-white/5">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading users...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center border-b border-black/5 dark:border-white/5">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 align-top">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
                         {user.avatar ? (
                            <img className="aspect-square h-full w-full object-cover" src={user.avatar} alt={user.nickName} />
                         ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium">
                                {user.nickName.slice(0, 2).toUpperCase()}
                            </div>
                         )}
                      </div>
                      <span className="font-medium">{user.nickName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{user.email}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Badge variant="outline" className="capitalize">
                       Active
                    </Badge>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(user)}
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserDetailsModal
        user={selectedUser}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default UserTable;
