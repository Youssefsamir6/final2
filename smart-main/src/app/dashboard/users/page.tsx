"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { makeUsers } from "@/lib/mock";
import { User } from "@/types/api";
import { format } from "date-fns";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

const columns = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }: { row: { original: User } }) => (
      <div className="flex items-center">
        <Avatar className="mr-3 h-8 w-8">
          <AvatarImage src={`https://i.pravatar.cc/32?u=${row.original.email}`} />
          <AvatarFallback>{row.original.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: { original: User } }) => (
      <Badge variant={row.original.status === "Active" ? "default" : "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "lastActiveAt",
    header: "Last Active",
    cell: ({ row }: { row: { original: User } }) => format(new Date(row.original.lastActiveAt), "MMM dd, HH:mm"),
  },
];

export default function UsersPage() {
  const { userRole } = useAuth();
  const canManage = userRole === 'admin' || userRole === 'operator';
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: makeUsers,
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access Control Users</h1>
          <p className="text-muted-foreground">Security team and authorized personnel</p>
        </div>
        {canManage && (
          <Link href="/dashboard/users/manage">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Manage Users
            </Button>
          </Link>
        )}
      </div>
      <DataTable
        columns={columns}
        data={usersQuery.data || []}
        isLoading={usersQuery.isLoading}
      />
    </div>
  );
}
