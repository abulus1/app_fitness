"use client"

import React from "react"
import { UserProfile } from "@/app/page" // Adjust path as necessary
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  User,
  History,
  PlusSquare,
  ListChecks,
  Ticket,
  ShieldCheck,
  LogOut,
  UserCircle, // Fallback for Avatar
} from "lucide-react"

export type SidebarNavigationScreen = 
  | "profile" 
  | "booking" 
  | "trainingHistory" 
  | "createRoutine" 
  | "preMadeRoutines" 
  | "planner"
  | "adminDashboard"; // Added adminDashboard here

interface SidebarProps {
  currentScreen: SidebarNavigationScreen | string; // Allow string for flexibility if other screens exist
  onNavigate: (screen: SidebarNavigationScreen) => void;
  onLogout: () => void;
  userProfile: UserProfile | null;
}

const navItems = [
  { name: "Planner", screen: "planner" as SidebarNavigationScreen, icon: Calendar },
  { name: "Profile", screen: "profile" as SidebarNavigationScreen, icon: User },
  { name: "Training History", screen: "trainingHistory" as SidebarNavigationScreen, icon: History },
  { name: "Create Your Routine", screen: "createRoutine" as SidebarNavigationScreen, icon: PlusSquare },
  { name: "Pre-Made Routines", screen: "preMadeRoutines" as SidebarNavigationScreen, icon: ListChecks },
  { name: "Booking/Reservation", screen: "booking" as SidebarNavigationScreen, icon: Ticket },
];

const adminNavItems = [
  { name: "Admin Dashboard", screen: "adminDashboard" as SidebarNavigationScreen, icon: ShieldCheck }
];

export function Sidebar({ currentScreen, onNavigate, onLogout, userProfile }: SidebarProps) {
  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
      {/* User Info Section */}
      <div className="mb-8 mt-4 flex flex-col items-center text-center">
        <Avatar className="h-20 w-20 mb-3">
          {/* Assuming userProfile might have an avatarUrl field in the future */}
          {/* <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.name} /> */}
          <AvatarFallback className="text-2xl bg-gray-600 text-gray-300">
            {userProfile ? getInitials(userProfile.name) : <UserCircle className="h-12 w-12" />}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold">{userProfile?.name || "Guest User"}</h2>
        {userProfile && <p className="text-xs text-gray-400">{userProfile.email}</p>}
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant={item.screen === currentScreen ? "secondary" : "ghost"}
            className={`w-full justify-start text-left h-10 ${
              item.screen === currentScreen 
                ? "bg-gray-700 text-white" 
                : "hover:bg-gray-700/80 hover:text-white text-gray-300"
            }`}
            onClick={() => onNavigate(item.screen)}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Button>
        ))}
        
        {/* Admin Link */}
        {userProfile?.role === "admin" && adminNavItems.map((item) => (
           <Button
            key={item.name}
            variant={item.screen === currentScreen ? "secondary" : "ghost"}
            className={`w-full justify-start text-left h-10 ${
              item.screen === currentScreen 
                ? "bg-gray-700 text-white" 
                : "hover:bg-gray-700/80 hover:text-white text-gray-300"
            }`}
            onClick={() => onNavigate(item.screen)}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto">
        <Button
          variant="outline"
          className="w-full justify-start text-left h-10 bg-transparent border-gray-600 hover:bg-red-700/80 hover:border-red-700 hover:text-white text-gray-300"
          onClick={onLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
