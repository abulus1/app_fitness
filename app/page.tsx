"use client"

import { useState, useEffect } from "react"
// Remove SignUpScreen, Add LoginScreen and RegistrationScreen
import { LoginScreen, LoginCredentials } from "@/components/login-screen"
import { RegistrationScreen, RegistrationData } from "@/components/registration-screen"
import { WeeklyPlanner } from "@/components/weekly-planner"
import { toast } from "sonner"
import { WorkoutSession } from "@/components/workout-session"
import { ProfileScreen } from "@/components/profile-screen"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Sidebar, SidebarNavigationScreen } from "@/components/sidebar"
import { Menu } from "lucide-react"
import { BookingScreen } from "@/components/booking-screen" // Import new screens
import { TrainingHistoryScreen } from "@/components/training-history-screen"
import { CreateRoutineScreen } from "@/components/create-routine-screen"
import { PreMadeRoutinesScreen } from "@/components/pre-made-routines-screen"

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

export type PerformedExercise = {
  id: string;
  name: string;
  category: string;
  reps: number;
  weight: number;
  durationMinutes: number; // Duration of this specific exercise instance
  caloriesBurned: number;  // Calories burned for this specific exercise instance
  metsValue?: number; // Optional: store METS value used for calculation for traceability
};

export type WorkoutRecord = {
  date: string // ISO string for date
  duration: number // in minutes (total session duration)
  exercisesPerformed: PerformedExercise[];
  caloriesBurned?: number // Optional: Total calories for the session
}

export type Exercise = {
  id: string
  name: string
  category: string
  youtubeUrl: string
  reps: number
  weight: number
  calories?: number
  metsValue?: number // Renamed from mets to metsValue as per subtask
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

// Ensure this union type includes all keys from SidebarNavigationScreen plus others like "login", "registration", "workout"
type AppScreen = SidebarNavigationScreen | "login" | "registration" | "workout";

export default function FitnessApp() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("login");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allUserProfiles, setAllUserProfiles] = useState<UserProfile[]>([]);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsSidebarOpen(true); // Open by default on larger screens
      } else {
        setIsSidebarOpen(false); // Closed by default on smaller screens
      }
    };
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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

  const handleSidebarNavigate = (screen: SidebarNavigationScreen) => {
    if (screen === "profile") {
      handleViewOwnProfile(); // Uses existing logic to ensure viewingProfile is cleared
    } else if (screen === "adminDashboard") {
      handleNavigateToAdminDashboard();
    } else {
      // For other screens like "planner", "booking", etc.
      // Make sure to clear viewingProfile if admin was viewing someone else
      if (viewingProfile) {
        setViewingProfile(null);
      }
      setCurrentScreen(screen);
    }
  };

  // --- Admin Specific Handlers (Keep these) ---
  const handleNavigateToAdminDashboard = () => {
    if (userProfile?.role === "admin") {
      setViewingProfile(null); // Clear any viewed profile when going to dashboard
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

  // --- Test Alert Handler ---
  const handleTestAlert = () => {
    toast.message("Test Alert", {
      description: "This is a test alert displayed in the center.",
      duration: 5000, // milliseconds
    });
  };

  // Render authentication screens if no user profile
  if (!userProfile) {
    if (currentScreen === "registration") {
      return <RegistrationScreen onRegister={handleRegister} onNavigateToLogin={navigateToLogin} />;
    }
    // Default to Login screen if not logged in, or if currentScreen is login
    return <LoginScreen onLogin={handleLogin} onNavigateToRegister={navigateToRegister} error={loginError} />;
  }

  // Render main app layout with Sidebar if user is logged in
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Hamburger Menu Button for Mobile */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed top-4 left-4 z-30 p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 md:hidden ${isSidebarOpen ? 'hidden' : 'block'}`}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      <Sidebar
        currentScreen={currentScreen}
        onNavigate={handleSidebarNavigate}
        onLogout={handleLogout}
        userProfile={userProfile}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
<main className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
  {/* Botón para mostrar alerta centrada */}
  <button onClick={handleTestAlert} className="m-4 p-2 bg-blue-500 text-white rounded">
    Test Centered Alert
  </button>

  {/* Botón para mostrar toast */}
  <button onClick={() => toast("This is a test toast!")} className="m-4 p-2 bg-green-500 text-white rounded">
    Show Test Toast
  </button>
</main>

        {currentScreen === "planner" && (
          <WeeklyPlanner
            userProfile={userProfile}
            weeklyPlans={weeklyPlans}
            onUpdatePlans={updateWeeklyPlans}
            onStartWorkout={handleStartWorkout}
            onViewProfile={handleViewOwnProfile} 
            onLogout={handleLogout} // Logout can also be triggered from here if needed, or rely on Sidebar's
            onNavigateToAdminDashboard={handleNavigateToAdminDashboard} // For admin button within planner
          />
        )}

        {currentScreen === "workout" && currentWorkout && (
          <WorkoutSession workout={currentWorkout} userProfile={userProfile} onComplete={handleWorkoutComplete} />
        )}

        {currentScreen === "profile" && profileToDisplayOnScreen && (
          <ProfileScreen 
            userProfile={profileToDisplayOnScreen} 
            onBackToPlanner={handleProfileScreenBack} 
            onLogout={handleLogout} // Logout can also be triggered from here
            loggedInUserRole={userProfile.role}
            isEditingOwnProfile={profileToDisplayOnScreen.email === userProfile.email}
            onUpdateUserProfile={handleUpdateUserProfile}
          />
        )}

        {currentScreen === "adminDashboard" && userProfile.role === "admin" && (
          <AdminDashboard 
            allUsers={allUserProfiles.filter(u => u.email !== userProfile.email)} 
            onViewUserProfile={handleViewUserProfileFromAdmin}
            onLogout={handleLogout} // Logout can also be triggered from here
          />
        )}
        {/* Fallback for non-admin trying to access adminDashboard - handled by Sidebar/navigation logic */}
        {currentScreen === "adminDashboard" && userProfile.role !== "admin" && (
             <>{handleSidebarNavigate("planner")}</> // Or an Access Denied component
        )}

        {currentScreen === "booking" && <BookingScreen />}
        {currentScreen === "trainingHistory" && <TrainingHistoryScreen userProfile={userProfile} />}
        {currentScreen === "createRoutine" && <CreateRoutineScreen />}
        {currentScreen === "preMadeRoutines" && <PreMadeRoutinesScreen />}
        
        {/* Fallback for any unhandled valid screen type, or just rely on default case of navigation */}
        {!(["planner", "workout", "profile", "adminDashboard", "booking", "trainingHistory", "createRoutine", "preMadeRoutines"].includes(currentScreen)) && 
          currentScreen !== "login" && currentScreen !== "registration" && (
          <div className="text-center p-10">
            <h1 className="text-2xl font-semibold">Page not found or under construction</h1>
            <p className="text-gray-600">Please select an option from the sidebar.</p>
          </div>
        )}
      </main>
    </div>
  );
}
