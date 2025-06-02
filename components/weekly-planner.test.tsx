import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { WeeklyPlanner } from "./weekly-planner" // Adjust path as necessary
import type { UserProfile, WeeklyPlan, DayWorkout } from "@/app/page" // Adjust path as necessary

// Mock ExerciseManager as it's a separate complex component
jest.mock("@/components/exercise-manager", () => ({
  ExerciseManager: ({ onSave, onCancel }: { onSave: (workout: DayWorkout) => void; onCancel: () => void }) => (
    <div>
      <span>Exercise Manager Mock</span>
      <button onClick={() => onSave({ day: "Monday", exercises: [] })}>Save Exercise</button>
      <button onClick={onCancel}>Cancel Exercise</button>
    </div>
  ),
}))

describe("WeeklyPlanner Component", () => {
  const mockUserProfile: UserProfile = {
    name: "Planner User",
    email: "planner@example.com",
    age: 28,
    gender: "female",
    weight: 60,
    height: 165,
    activityLevel: "light",
    fitnessGoals: ["stay active"],
    role: "user", // Default role for this mock
    membershipType: "trial",
    workoutHistory: [],
    password: "password123", // Added password
  }
  
  const mockAdminUserProfile: UserProfile = {
    ...mockUserProfile, // This will copy password from mockUserProfile
    role: "admin",
    email: "admin@example.com",
    // password will be "password123" from mockUserProfile spread
  }

  const mockWeeklyPlans: WeeklyPlan[] = []
  const mockOnUpdatePlans = jest.fn()
  const mockOnStartWorkout = jest.fn()
  // const mockOnBackToSignup = jest.fn(); // Removed
  const mockOnViewProfile = jest.fn()
  const mockOnLogout = jest.fn()
  const mockOnNavigateToAdminDashboard = jest.fn()


  // Helper to render with specific props for role tests
  const renderPlanner = (profile: UserProfile, navCallback?: () => void) => {
    render(
      <WeeklyPlanner
        userProfile={profile}
        weeklyPlans={mockWeeklyPlans}
        onUpdatePlans={mockOnUpdatePlans}
        onStartWorkout={mockOnStartWorkout}
        // onBackToSignup={mockOnBackToSignup} // Removed
        onViewProfile={mockOnViewProfile}
        onLogout={mockOnLogout}
        onNavigateToAdminDashboard={navCallback}
      />
    );
  }

  beforeEach(() => {
    mockOnLogout.mockClear();
    mockOnViewProfile.mockClear();
    // mockOnBackToSignup.mockClear(); // Removed
    mockOnNavigateToAdminDashboard.mockClear();
    // Default render for simple tests, specific tests will re-render
    renderPlanner(mockUserProfile, mockOnNavigateToAdminDashboard);
  })

  test('renders header with "Weekly Planner" title', () => {
    expect(screen.getByText("Weekly Planner")).toBeInTheDocument()
  })

  test('renders "Profile" button and calls onViewProfile when clicked', () => {
    const profileButton = screen.getByRole("button", { name: /profile/i })
    expect(profileButton).toBeInTheDocument()
    fireEvent.click(profileButton)
    expect(mockOnViewProfile).toHaveBeenCalledTimes(1)
  })
  
  test('renders "Logout" button and calls onLogout when clicked', () => {
    // The text "Logout" is within the button, not its accessible name if an icon is present first.
    // We can find it by text content or a more specific selector if needed.
    const logoutButton = screen.getByRole("button", { name: /logout/i }) // Lucide icons might affect accessible name
    expect(logoutButton).toBeInTheDocument()
    fireEvent.click(logoutButton)
    expect(mockOnLogout).toHaveBeenCalledTimes(1)
  })

  // Basic test to ensure user info is displayed (not exhaustive)
  test("displays user's name in the user info card", () => {
    expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument()
  })

  // Basic test for week navigation (interaction, not date logic)
  test("week navigation buttons are present", () => {
    expect(screen.getByText(/week of/i)).toBeInTheDocument() // Example: "Week of 1/15/2024"
    // Buttons for previous and next week (could be more specific with aria-labels if available)
    const navButtons = screen.getAllByRole("button")
    expect(navButtons.some(button => button.innerHTML.includes("ChevronLeft"))).toBe(true)
    expect(navButtons.some(button => button.innerHTML.includes("ChevronRight"))).toBe(true)
  })

  describe("Admin Dashboard Button", () => {
    test("is visible and calls onNavigateToAdminDashboard for admin user", () => {
      // Re-render with admin profile and callback
      renderPlanner(mockAdminUserProfile, mockOnNavigateToAdminDashboard);
      const adminButton = screen.getByRole("button", { name: /admin/i });
      expect(adminButton).toBeInTheDocument();
      fireEvent.click(adminButton);
      expect(mockOnNavigateToAdminDashboard).toHaveBeenCalledTimes(1);
    });

    test("is not visible for non-admin user", () => {
      // mockUserProfile is already non-admin, ensure it was rendered in beforeEach or re-render
      renderPlanner(mockUserProfile, mockOnNavigateToAdminDashboard);
      expect(screen.queryByRole("button", { name: /admin/i })).not.toBeInTheDocument();
    });

    test("is not visible if onNavigateToAdminDashboard is not provided, even for admin", () => {
      renderPlanner(mockAdminUserProfile, undefined); // No callback provided
      expect(screen.queryByRole("button", { name: /admin/i })).not.toBeInTheDocument();
    });
  });
})
