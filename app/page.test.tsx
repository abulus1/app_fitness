import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import FitnessApp, { UserProfile } from "./page"
import localStorageMock from "../__mocks__/localstorage" // Adjust path as necessary

// Define a type for the partial profile passed from SignUpScreen
type PartialUserProfile = Omit<UserProfile, "role" | "membershipType" | "workoutHistory">;

// Mock child components to simplify testing FitnessApp
jest.mock("@/components/signup-screen", () => ({
  SignUpScreen: ({ onComplete }: { onComplete: (profile: PartialUserProfile) => void }) => (
    <>
      <button onClick={() => onComplete({ name: "Test User", email: "test@example.com", age: 30, gender: "male", weight: 70, height: 175, activityLevel: "moderate", fitnessGoals: ["lose weight"] })}>
        Complete Sign Up
      </button>
      <button onClick={() => onComplete({ name: "Admin User", email: "admin@example.com", age: 40, gender: "female", weight: 60, height: 160, activityLevel: "sedentary", fitnessGoals: ["manage app"] })}>
        Complete Sign Up as Admin
      </button>
    </>
  ),
}))

// Keep track of props passed to mocked components
const mockWeeklyPlannerProps = jest.fn();
const mockProfileScreenProps = jest.fn();
const mockAdminDashboardProps = jest.fn();
const ALL_USERS_STORAGE_KEY = "allFitnessUsers"; // Ensure this matches the key in app/page.tsx

// Updated WeeklyPlanner Mock
jest.mock("@/components/weekly-planner", () => ({
  WeeklyPlanner: (props: any) => {
    mockWeeklyPlannerProps(props); // Capture all props
    return (
      <div>
        <span>Weekly Planner</span>
        <button onClick={props.onViewProfile}>View Own Profile</button>,
        <button onClick={props.onLogout}>Logout</button>
        {props.userProfile?.role === "admin" && props.onNavigateToAdminDashboard && (
          <button onClick={props.onNavigateToAdminDashboard}>Admin Dashboard</button>
        )}
        <button onClick={() => props.onStartWorkout({ day: "TestDay", exercises: [] })}>Start Test Workout</button>
      </div>
    );
  },
}));

// Updated ProfileScreen Mock
jest.mock("@/components/profile-screen", () => ({
  ProfileScreen: (props: any) => {
    mockProfileScreenProps(props); // Capture all props
    return (
      <div>
        <span>Profile Screen for {props.userProfile.name}</span>
        <button onClick={props.onBackToPlanner}>Back</button>
        <button onClick={props.onLogout}>Logout</button>
        {props.onUpdateUserProfile && (
          <button onClick={() => props.onUpdateUserProfile({ ...props.userProfile, name: "Updated Name by Test" })}>
            Simulate Update Profile
          </button>
        )}
      </div>
    );
  },
}));

// Mock AdminDashboard
jest.mock("@/components/admin-dashboard", () => ({
  AdminDashboard: (props: any) => {
    mockAdminDashboardProps(props); // Capture all props
    return (
      <div>
        <span>Admin Dashboard</span>
        <button onClick={props.onLogout}>Logout</button>
        {props.allUsers && props.allUsers.length > 0 && (
          <button onClick={() => props.onViewUserProfile(props.allUsers[0].email)}>
            View First User
          </button>
        )}
      </div>
    );
  },
}));
import { WorkoutRecord } from "./page"; // Import WorkoutRecord for the mock


// Mock WorkoutSession (already good for capturing onComplete)
const mockWorkoutSessionOnComplete = jest.fn();
jest.mock("@/components/workout-session", () => ({
  WorkoutSession: (props: { workout: any, userProfile: any, onComplete: (record: WorkoutRecord) => void }) => {
    mockWorkoutSessionOnComplete.mockImplementation(props.onComplete); // Capture onComplete
    return (
      <button onClick={() => {
        const sampleRecord: WorkoutRecord = {
          date: new Date().toISOString(),
          duration: 30,
          exercisesPerformed: [{ id: "ex1", name: "Push-ups", category: "Chest", reps: 10, weight: 0 }],
          caloriesBurned: 150,
        };
        props.onComplete(sampleRecord);
      }}>
        Simulate Complete Workout
      </button>
    );
  },
}));


describe("FitnessApp Page", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  const baseUser PartonCompleteData = { name: "Test User", email: "test@example.com", age: 30, gender: "male", weight: 70, height: 175, activityLevel: "moderate", fitnessGoals: ["lose weight"] };
  const adminUserPartonCompleteData = { name: "Admin User", email: "admin@example.com", age: 40, gender: "female", weight: 60, height: 160, activityLevel: "sedentary", fitnessGoals: ["manage app"] };

  const expectedTestUserProfile: UserProfile = {
    ...baseUserPartonCompleteData,
    role: "user",
    membershipType: "trial",
    workoutHistory: [],
  };

  const expectedAdminUserProfile: UserProfile = {
    ...adminUserPartonCompleteData,
    role: "admin",
    membershipType: "trial",
    workoutHistory: [],
  };

  // --- Begin tests for allUserProfiles management ---
  describe("allUserProfiles Management", () => {
    test("handleSignUpComplete adds new user to allUserProfiles and localStorage", () => {
      render(<FitnessApp />);
      act(() => {
        fireEvent.click(screen.getByText("Complete Sign Up")); // Signs up testUserProfile
      });
      const allUsersString = localStorageMock.getItem(ALL_USERS_STORAGE_KEY);
      expect(allUsersString).not.toBeNull();
      const allUsers = JSON.parse(allUsersString!);
      expect(allUsers).toHaveLength(1);
      expect(allUsers[0]).toEqual(expect.objectContaining(expectedTestUserProfile));
    });

    test("useEffect loads allUserProfiles from localStorage and adds loggedInUser if not present", () => {
      const existingUserInAll = { ...expectedTestUserProfile, name: "Existing User In All" };
      localStorageMock.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify([existingUserInAll]));
      // Logged-in user is different and not in the 'allUsers' list initially
      const loggedInUser = { ...expectedAdminUserProfile, email: "newadmin@example.com" };
      localStorageMock.setItem("userProfile", JSON.stringify(loggedInUser));

      render(<FitnessApp />);

      const allUsersString = localStorageMock.getItem(ALL_USERS_STORAGE_KEY);
      expect(allUsersString).not.toBeNull();
      const allUsers = JSON.parse(allUsersString!);
      expect(allUsers).toHaveLength(2);
      expect(allUsers).toEqual(expect.arrayContaining([
        expect.objectContaining(existingUserInAll),
        expect.objectContaining(loggedInUser)
      ]));
    });

    test("handleWorkoutComplete updates user in both userProfile and allUserProfiles", () => {
      // 1. Setup: User signs up
      render(<FitnessApp />);
      act(() => { fireEvent.click(screen.getByText("Complete Sign Up")); }); // Signs up testUserProfile

      // 2. Simulate starting a workout (via mock)
      act(() => { fireEvent.click(screen.getByText("Start Test Workout")); });

      // 3. Simulate completing the workout (via mock)
      const workoutRecord: WorkoutRecord = { date: "2024-01-01", duration: 30, exercisesPerformed: [], caloriesBurned: 100 };
      act(() => { mockWorkoutSessionOnComplete(workoutRecord); }); // Call the captured onComplete

      // Check userProfile in localStorage
      const userProfileStr = localStorageMock.getItem("userProfile");
      const updatedLoggedInUser = JSON.parse(userProfileStr!);
      expect(updatedLoggedInUser.workoutHistory).toHaveLength(1);
      expect(updatedLoggedInUser.workoutHistory[0]).toEqual(workoutRecord);

      // Check allUserProfiles in localStorage
      const allUsersStr = localStorageMock.getItem(ALL_USERS_STORAGE_KEY);
      const allUsers = JSON.parse(allUsersStr!);
      const userInAll = allUsers.find((u: UserProfile) => u.email === expectedTestUserProfile.email);
      expect(userInAll.workoutHistory).toHaveLength(1);
      expect(userInAll.workoutHistory[0]).toEqual(workoutRecord);
    });
  });
  // --- End tests for allUserProfiles management ---

  test("should load OLD userProfile from localStorage and apply defaults (checks userProfile state)", () => {
    const oldUserProfile = {
      name: "Old User",
      email: "old@example.com",
      age: 50,
      gender: "other", weight: 75, height: 170, activityLevel: "light", fitnessGoals: ["stay healthy"],
    };
    localStorageMock.setItem("userProfile", JSON.stringify(oldUserProfile));
    render(<FitnessApp />);
    expect(screen.getByText("Weekly Planner")).toBeInTheDocument(); // Navigates to planner

    act(() => { fireEvent.click(screen.getByText("View Own Profile")); }); // Navigate to profile screen

    expect(screen.getByText("Profile Screen for Old User")).toBeInTheDocument();
    expect(mockProfileScreenProps).toHaveBeenCalledWith(expect.objectContaining({
      userProfile: expect.objectContaining({
        ...oldUserProfile, // Original fields
        role: "user", // Default applied
        membershipType: "trial", // Default applied
        workoutHistory: [], // Default applied
      }),
      loggedInUserRole: "user",
      isEditingOwnProfile: true,
    }));
  });

  // --- Admin Workflow Tests ---
  describe("Admin Workflow", () => {
    beforeEach(() => {
      // Log in as admin
      localStorageMock.setItem("userProfile", JSON.stringify(expectedAdminUserProfile));
      // Setup some users in allUserProfiles for admin to see
      const otherUser = { ...expectedTestUserProfile, name: "Other Test User", email: "other@example.com" };
      localStorageMock.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify([expectedAdminUserProfile, otherUser]));
      render(<FitnessApp />);
    });

    test("Admin can navigate to AdminDashboard", () => {
      expect(screen.getByText("Weekly Planner")).toBeInTheDocument();
      const adminDashboardButton = screen.getByText("Admin Dashboard");
      expect(adminDashboardButton).toBeInTheDocument();
      act(() => { fireEvent.click(adminDashboardButton); });
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument(); // Mocked AdminDashboard content
      // Admin themselves should not be in the list passed to AdminDashboard
      expect(mockAdminDashboardProps).toHaveBeenCalledWith(expect.objectContaining({
        allUsers: [expect.objectContaining({ email: "other@example.com" })]
      }));
    });

    test("Admin can view a user's profile from AdminDashboard", () => {
      act(() => { fireEvent.click(screen.getByText("Admin Dashboard")); }); // Go to admin dash
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();

      // Simulate admin clicking "View First User" (mocked AdminDashboard behavior)
      const otherUserEmail = "other@example.com"; // Assuming this is the first user in mock
       mockAdminDashboardProps.mock.calls[0][0].onViewUserProfile(otherUserEmail); // Manually call the prop like the mock would

      // This requires re-rendering or state update to be reflected
      // For now, we'll check the direct call effect if possible, or need to re-evaluate mock interaction for screen change.
      // The above line already called handleViewUserProfileFromAdmin.
      // Need to wait for state update and re-render.
      // The test setup for ProfileScreen mock captures props on each render.
      // So, the last call to mockProfileScreenProps after navigation should have the viewingProfile.

      // This relies on the mock AdminDashboard correctly calling onViewUserProfile,
      // which then triggers a state update in FitnessApp, leading to ProfileScreen re-render.
      // Let's check the props passed to ProfileScreen after this action.
      // This is tricky because the button click that changes screen is inside the mock.
      // Awaiting state update and re-render.
      // For now, let's assume the navigation to profile screen happened and check props.
      // This part might need adjustment based on how state updates are tested with async nature.

      // To properly test this, we'd need to click a button *within* the AdminDashboard mock
      // that triggers the onViewUserProfile prop. Our mock has "View First User".
       act(() => {fireEvent.click(screen.getByText("View First User"))});


      expect(screen.getByText("Profile Screen for Other Test User")).toBeInTheDocument();
      expect(mockProfileScreenProps).toHaveBeenCalledWith(expect.objectContaining({
        userProfile: expect.objectContaining({ email: otherUserEmail }),
        loggedInUserRole: "admin",
        isEditingOwnProfile: false,
      }));
    });

    test("handleProfileScreenBack navigates admin from other user's profile to adminDashboard", () => {
      act(() => { fireEvent.click(screen.getByText("Admin Dashboard")); });
      act(() => { fireEvent.click(screen.getByText("View First User")); }); // Navigate to other user's profile
      expect(screen.getByText("Profile Screen for Other Test User")).toBeInTheDocument();

      act(() => { fireEvent.click(screen.getByText("Back")); }); // Click back button in ProfileScreen mock
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
      // Also check that viewingProfile was cleared - this needs exposing state or checking ProfileScreen props again
    });
  });

  // --- handleUpdateUserProfile Tests ---
  describe("handleUpdateUserProfile", () => {
    test("User edits own profile: updates userProfile, allUserProfiles, and localStorage", () => {
      localStorageMock.setItem("userProfile", JSON.stringify(expectedTestUserProfile));
      localStorageMock.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify([expectedTestUserProfile]));
      render(<FitnessApp />);

      act(() => { fireEvent.click(screen.getByText("View Own Profile")); }); // Go to own profile
      expect(screen.getByText(`Profile Screen for ${expectedTestUserProfile.name}`)).toBeInTheDocument();

      // Simulate ProfileScreen calling onUpdateUserProfile
      const updatedDataFromScreen = { ...expectedTestUserProfile, name: "User Self-Edited Name" };
      act(() => { mockProfileScreenProps.mock.calls[mockProfileScreenProps.mock.calls.length - 1][0].onUpdateUserProfile(updatedDataFromScreen); });

      // Check userProfile in localStorage
      const userProfileStr = localStorageMock.getItem("userProfile");
      expect(JSON.parse(userProfileStr!).name).toBe("User Self-Edited Name");

      // Check allUserProfiles in localStorage
      const allUsersStr = localStorageMock.getItem(ALL_USERS_STORAGE_KEY);
      const allUsers = JSON.parse(allUsersStr!);
      expect(allUsers[0].name).toBe("User Self-Edited Name");

      // Check ProfileScreen is re-rendered with updated name
      expect(screen.getByText("Profile Screen for User Self-Edited Name")).toBeInTheDocument();
    });

    test("Admin edits another user's profile: updates allUserProfiles, localStorage, and viewingProfile", () => {
      const otherUser = { ...expectedTestUserProfile, email: "other@example.com", name: "Other User" };
      localStorageMock.setItem("userProfile", JSON.stringify(expectedAdminUserProfile)); // Admin logged in
      localStorageMock.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify([expectedAdminUserProfile, otherUser]));
      render(<FitnessApp />);

      act(() => { fireEvent.click(screen.getByText("Admin Dashboard")); });
      act(() => { fireEvent.click(screen.getByText("View First User")); }); // Admin views 'otherUser'
      expect(screen.getByText(`Profile Screen for ${otherUser.name}`)).toBeInTheDocument();

      const updatedDataFromScreen = { ...otherUser, name: "Admin Edited OtherUser Name" };
      act(() => { mockProfileScreenProps.mock.calls[mockProfileScreenProps.mock.calls.length - 1][0].onUpdateUserProfile(updatedDataFromScreen); });

      // Check allUserProfiles in localStorage
      const allUsersStr = localStorageMock.getItem(ALL_USERS_STORAGE_KEY);
      const allUsers = JSON.parse(allUsersStr!);
      const editedUserInAll = allUsers.find((u:UserProfile) => u.email === otherUser.email);
      expect(editedUserInAll.name).toBe("Admin Edited OtherUser Name");

      // Check admin's own profile in localStorage is unchanged
      const adminProfileStr = localStorageMock.getItem("userProfile");
      expect(JSON.parse(adminProfileStr!).name).toBe(expectedAdminUserProfile.name);

      // Check ProfileScreen shows updated name for the viewed user
      expect(screen.getByText("Profile Screen for Admin Edited OtherUser Name")).toBeInTheDocument();
    });
  });

  // Basic Logout Test (already existed, ensure it's still valid)
  test("should clear localStorage and reset state on logout (from planner)", () => {
    localStorageMock.setItem("userProfile", JSON.stringify(expectedTestUserProfile));
    render(<FitnessApp />);
    expect(screen.getByText("Weekly Planner")).toBeInTheDocument();
    act(() => { fireEvent.click(screen.getByText("Logout")); }); // From WeeklyPlanner mock
    expect(localStorageMock.getItem("userProfile")).toBeNull();
    expect(screen.getByText("Complete Sign Up")).toBeInTheDocument();
  });
})
