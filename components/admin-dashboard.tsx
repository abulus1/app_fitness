"use client"

import { UserProfile } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { LogOut, Edit } from "lucide-react"

interface AdminDashboardProps {
  allUsers: UserProfile[]
  onViewUserProfile: (userId: string) => void // Using email as userId
  onLogout: () => void
}

export function AdminDashboard({ allUsers, onViewUserProfile, onLogout }: AdminDashboardProps) {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
            <CardDescription>User Management</CardDescription>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </CardHeader>
        <CardContent>
          {(!allUsers || allUsers.length === 0) ? (
            <p className="text-center text-gray-500 py-8">No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</TableCell>
                    <TableCell>{user.membershipType.charAt(0).toUpperCase() + user.membershipType.slice(1)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewUserProfile(user.email)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> View/Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
