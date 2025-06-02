"use client"

import { useState, useEffect } from "react" // Import useEffect
import { SignUpScreen } from "@/components/signup-screen"
import { WeeklyPlanner } from "@/components/weekly-planner"
import { WorkoutSession } from "@/components/workout-session"
import { ProfileScreen } from "@/components/profile-screen"
import { AdminDashboard } from "@/components/admin-dashboard" // Import AdminDashboard

export type UserProfile = {
  name: string
  email: string
  age: number
  gender: "male" | "female" | "other"
  weight: number
  height: number
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very-active"
  fitnessGoals: string[]
  role: "admin" | "user"
  membershipType: "basic" | "premium" | "trial"
  workoutHistory: WorkoutRecord[]
}

export type WorkoutRecord = {
  date: string // ISO string for date
  duration: number // in minutes
  exercisesPerformed: Array<{
    id: string // Keep id from Exercise type
    name: string
    category: string
    reps: number
    weight: number
  }>
  caloriesBurned?: number // Optional
}

export type Exercise = {
  id: string
  name: string
  category: string
  youtubeUrl: string
  reps: number
  weight: number
  calories?: number
  mets?: number // Added METS as it's in the DB and likely needed for calorie calculation
}

export type DayWorkout = {
  day: string
  exercises: Exercise[]
}

export type WeeklyPlan = {
  weekOf: string
  workouts: DayWorkout[]
}

const ALL_USERS_STORAGE_KEY = "allFitnessUsers";

export default function FitnessApp() {
  const [currentScreen, setCurrentScreen] = useState<"signup" | "planner" | "workout" | "profile" | "adminDashboard">("signup");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allUserProfiles, setAllUserProfiles] = useState<UserProfile[]>([]);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null); // For admin viewing other profiles
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<DayWorkout | null>(null);

  useEffect(() => {
    // Load all users first
    const storedAllUsers = localStorage.getItem(ALL_USERS_STORAGE_KEY);
    let currentAllUsers: UserProfile[] = [];
    if (storedAllUsers) {
      currentAllUsers = JSON.parse(storedAllUsers);
      setAllUserProfiles(currentAllUsers);
    }

    // Load logged-in user profile
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      let loadedProfile = JSON.parse(storedProfile) as UserProfile;
      loadedProfile.role = loadedProfile.role || "user";
      loadedProfile.membershipType = loadedProfile.membershipType || "trial";
      loadedProfile.workoutHistory = loadedProfile.workoutHistory || [];
      setUserProfile(loadedProfile);
      setCurrentScreen("planner");

      // Ensure logged-in user is in allUserProfiles list
      const loggedInUserInAllUsers = currentAllUsers.find(u => u.email === loadedProfile.email);
      if (!loggedInUserInAllUsers) {
        const updatedAllUsers = [...currentAllUsers, loadedProfile];
        setAllUserProfiles(updatedAllUsers);
        localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(updatedAllUsers));
      }
    }
  }, []);

  const handleSignUpComplete = (partialProfile: Omit<UserProfile, "role" | "membershipType" | "workoutHistory">) => {
    const isAdmin = partialProfile.email === "admin@example.com";
    const completedProfile: UserProfile = {
      ...partialProfile,
      role: isAdmin ? "admin" : "user",
      membershipType: "trial",
      workoutHistory: [],
    };
    setUserProfile(completedProfile);
    localStorage.setItem("userProfile", JSON.stringify(completedProfile));

    // Add to allUserProfiles list and save
    setAllUserProfiles(prevAllUsers => {
      const existingUserIndex = prevAllUsers.findIndex(u => u.email === completedProfile.email);
      let updatedAllUsers;
      if (existingUserIndex > -1) {
        updatedAllUsers = [...prevAllUsers];
        updatedAllUsers[existingUserIndex] = completedProfile;
      } else {
        updatedAllUsers = [...prevAllUsers, completedProfile];
      }
      localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(updatedAllUsers));
      return updatedAllUsers;
    });
    setCurrentScreen("planner");
  };

  const handleStartWorkout = (workout: DayWorkout) => {
    setCurrentWorkout(workout);
    setCurrentScreen("workout");
  };

  const handleWorkoutComplete = (completedWorkoutData: WorkoutRecord) => {
    if (userProfile) {
      const updatedLoggedInProfile = {
        ...userProfile,
        workoutHistory: [...userProfile.workoutHistory, completedWorkoutData],
      };
      setUserProfile(updatedLoggedInProfile);
      localStorage.setItem("userProfile", JSON.stringify(updatedLoggedInProfile));

      // Update this user in the allUserProfiles list
      setAllUserProfiles(prevAllUsers => {
        const updatedAllUsers = prevAllUsers.map(u =>
          u.email === updatedLoggedInProfile.email ? updatedLoggedInProfile : u
        );
        localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(updatedAllUsers));
        return updatedAllUsers;
      });
    }
    setCurrentWorkout(null);
    setCurrentScreen("planner");
  };

  // Placeholder for updateWeeklyPlans - ensure it also updates allUserProfiles if plans are part of UserProfile
  const updateWeeklyPlans = (plans: WeeklyPlan[]) => {
    setWeeklyPlans(plans);
    // If weeklyPlans were part of UserProfile and saved per user, this would need to update allUserProfiles too
  };

  const handleViewOwnProfile = () => { // Renamed from handleViewProfile
    setViewingProfile(null); // Ensure we are not viewing someone else
    setCurrentScreen("profile");
  };

  const handleProfileScreenBack = () => { // Renamed from handleBackToPlanner
    if (userProfile?.role === "admin" && viewingProfile) {
      setViewingProfile(null); // Clear viewing profile when admin goes back to dashboard
      setCurrentScreen("adminDashboard");
    } else {
      setCurrentScreen("planner");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    setUserProfile(null);
    setViewingProfile(null); // Clear any viewed profile on logout
    // allUserProfiles remains in localStorage for other users / next login
    setCurrentScreen("signup");
  };

  // --- Admin Specific Handlers ---
  const handleNavigateToAdminDashboard = () => {
    if (userProfile?.role === "admin") {
      setCurrentScreen("adminDashboard");
    }
  };

  const handleViewUserProfileFromAdmin = (userEmail: string) => {
    const profileToView = allUserProfiles.find(u => u.email === userEmail);
    if (profileToView) {
      setViewingProfile(profileToView);
      setCurrentScreen("profile");
    }
  };

  const handleUpdateUserProfile = (updatedProfileData: UserProfile) => {
    // If admin is editing another user (viewingProfile is set and is not the admin themselves)
    if (viewingProfile && viewingProfile.email !== userProfile?.email) {
      const updatedAllUsers = allUserProfiles.map(u =>
        u.email === updatedProfileData.email ? updatedProfileData : u
      );
      setAllUserProfiles(updatedAllUsers);
      localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(updatedAllUsers));
      setViewingProfile(updatedProfileData); // Keep viewing the updated profile
    } else { // User is editing their own profile, or admin is editing their own profile
      setUserProfile(updatedProfileData);
      localStorage.setItem("userProfile", JSON.stringify(updatedProfileData));
      const updatedAllUsers = allUserProfiles.map(u =>
        u.email === updatedProfileData.email ? updatedProfileData : u
      );
      setAllUserProfiles(updatedAllUsers);
      localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(updatedAllUsers));
      if (viewingProfile && viewingProfile.email === updatedProfileData.email) {
        setViewingProfile(updatedProfileData); // Also update viewingProfile if admin was viewing self
      }
    }
  };


  // Determine which profile to display on ProfileScreen
  const profileToDisplayOnScreen = viewingProfile || userProfile;

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === "signup" && <SignUpScreen onComplete={handleSignUpComplete} />}

      {currentScreen === "planner" && userProfile && (
        <WeeklyPlanner
          userProfile={userProfile}
          weeklyPlans={weeklyPlans}
          onUpdatePlans={updateWeeklyPlans}
          onStartWorkout={handleStartWorkout}
          onBackToSignup={() => { /* This might need review - should it clear viewingProfile? */ setCurrentScreen("signup"); setViewingProfile(null); }}
          onViewProfile={handleViewOwnProfile}
          onLogout={handleLogout}
          onNavigateToAdminDashboard={handleNavigateToAdminDashboard} // New Prop
        />
      )}

      {currentScreen === "workout" && currentWorkout && userProfile && (
        <WorkoutSession workout={currentWorkout} userProfile={userProfile} onComplete={handleWorkoutComplete} />
      )}

      {currentScreen === "profile" && profileToDisplayOnScreen && userProfile && (
        <ProfileScreen
          userProfile={profileToDisplayOnScreen}
          onBackToPlanner={handleProfileScreenBack} // Updated handler
          onLogout={handleLogout}
          loggedInUserRole={userProfile.role}
          isEditingOwnProfile={profileToDisplayOnScreen.email === userProfile.email}
          onUpdateUserProfile={handleUpdateUserProfile}
        />
      )}

      {currentScreen === "adminDashboard" && userProfile?.role === "admin" && (
        <AdminDashboard
          allUsers={allUserProfiles.filter(u => u.email !== userProfile.email)} // Show other users
          onViewUserProfile={handleViewUserProfileFromAdmin}
          onLogout={handleLogout}
        />
      )}
       {/* Fallback for non-admin trying to access adminDashboard or other invalid states */}
      {currentScreen === "adminDashboard" && userProfile?.role !== "admin" && (
        // Redirect to planner or show error
        <>{setCurrentScreen("planner")}</>
      )}
    </div>
  );
}
