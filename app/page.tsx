"use client"

import { useState, useEffect } from "react"
// Remove SignUpScreen, Add LoginScreen and RegistrationScreen
import { LoginScreen, LoginCredentials } from "@/components/login-screen" 
import { RegistrationScreen, RegistrationData } from "@/components/registration-screen"
import { WeeklyPlanner } from "@/components/weekly-planner"
import { WorkoutSession } from "@/components/workout-session"
import { ProfileScreen } from "@/components/profile-screen"
import { AdminDashboard } from "@/components/admin-dashboard"

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
  password?: string // Added password, make it optional for now for easier adoption
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
  const [currentScreen, setCurrentScreen] = useState<"login" | "registration" | "planner" | "workout" | "profile" | "adminDashboard">("login");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allUserProfiles, setAllUserProfiles] = useState<UserProfile[]>([]);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<DayWorkout | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const storedAllUsers = localStorage.getItem(ALL_USERS_STORAGE_KEY);
    let currentAllUsers: UserProfile[] = [];
    if (storedAllUsers) {
      currentAllUsers = JSON.parse(storedAllUsers);
      setAllUserProfiles(currentAllUsers);
    }

    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      let loadedProfile = JSON.parse(storedProfile) as UserProfile;
      loadedProfile.role = loadedProfile.role || "user";
      loadedProfile.membershipType = loadedProfile.membershipType || "trial";
      loadedProfile.workoutHistory = loadedProfile.workoutHistory || [];
      loadedProfile.password = loadedProfile.password || "defaultPassword";
      setUserProfile(loadedProfile);
      setCurrentScreen("planner"); // User is logged in, go to planner

      const loggedInUserInAllUsers = currentAllUsers.find(u => u.email === loadedProfile.email);
      if (!loggedInUserInAllUsers) {
        const updatedAllUsers = [...currentAllUsers, loadedProfile];
        setAllUserProfiles(updatedAllUsers);
        localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(updatedAllUsers));
      }
    } else {
      setCurrentScreen("login"); // No stored profile, default to login screen
    }
  }, []);

  // --- Authentication Handlers ---
  const navigateToLogin = () => {
    setCurrentScreen("login");
    setLoginError(null);
    setViewingProfile(null); 
  };

  const navigateToRegister = () => {
    setCurrentScreen("registration");
    setLoginError(null);
  };

  const handleRegister = (registrationData: RegistrationData) => {
    const emailExists = allUserProfiles.find(u => u.email === registrationData.email);
    if (emailExists) {
      // In a real app, RegistrationScreen would have an error prop to show this
      alert("Email already exists. Please try a different email or login."); 
      return;
    }

    const newUser: UserProfile = {
      name: registrationData.name,
      email: registrationData.email,
      password: registrationData.password, // Password is now set during registration
      role: registrationData.role, // Role is set during registration
      age: 0, // Default, to be updated in profile
      gender: "other", // Default
      weight: 0, // Default
      height: 0, // Default
      activityLevel: "sedentary", // Default
      fitnessGoals: [], // Default
      membershipType: "trial", // Default
      workoutHistory: [], // Default
    };

    const updatedAllUsers = [...allUserProfiles, newUser];
    setAllUserProfiles(updatedAllUsers);
    localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(updatedAllUsers));
    
    alert("Registration successful! Please login."); // Or directly log them in
    navigateToLogin();
  };

  const handleLogin = (credentials: LoginCredentials) => {
    const foundUser = allUserProfiles.find(u => u.email === credentials.email);

    if (foundUser && foundUser.password === credentials.password) {
      setUserProfile(foundUser);
      localStorage.setItem("userProfile", JSON.stringify(foundUser));
      setCurrentScreen("planner");
      setLoginError(null);
    } else {
      setLoginError("Invalid email or password.");
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    setUserProfile(null);
    setViewingProfile(null);
    navigateToLogin(); // Navigate to login screen after logout
  };

  // --- Core App Logic Handlers (Keep these) ---
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

  // --- Admin Specific Handlers (Keep these) ---
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
      {/* --- Authentication Screens --- */}
      {currentScreen === "login" && !userProfile && (
        <LoginScreen 
          onLogin={handleLogin} 
          onNavigateToRegister={navigateToRegister} 
          error={loginError} 
        />
      )}
      {currentScreen === "registration" && !userProfile && (
        <RegistrationScreen 
          onRegister={handleRegister} 
          onNavigateToLogin={navigateToLogin} 
        />
      )}

      {/* --- Logged-in User Screens --- */}
      {userProfile && currentScreen === "planner" && (
        <WeeklyPlanner
          userProfile={userProfile}
          weeklyPlans={weeklyPlans}
          onUpdatePlans={updateWeeklyPlans}
          onStartWorkout={handleStartWorkout}
          // onBackToSignup is removed, logout goes to login
          onViewProfile={handleViewOwnProfile} 
          onLogout={handleLogout}
          onNavigateToAdminDashboard={handleNavigateToAdminDashboard}
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
