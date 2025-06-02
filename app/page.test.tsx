import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import FitnessApp, { UserProfile } from "./page"
import localStorageMock from "../__mocks__/localstorage" // Adjust path as necessary

// Mock child components to simplify testing FitnessApp
jest.mock("@/components/signup-screen", () => ({
  SignUpScreen: ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => (
    <button onClick={() => onComplete({ name: "Test User", email: "test@example.com", age: 30, gender: "male", weight: 70, height: 175, activityLevel: "moderate", fitnessGoals: ["lose weight"] })}>
      Complete Sign Up
    </button>
  ),
}))

jest.mock("@/components/weekly-planner", () => ({
  WeeklyPlanner: ({ onLogout, onViewProfile }: { onLogout: () => void; onViewProfile: () => void }) => (
    <div>
      <button onClick={onViewProfile}>View Profile</button>
      <button onClick={onLogout}>Logout from Planner</button>
      <span>Weekly Planner</span>
    </div>
  ),
}))

jest.mock("@/components/profile-screen", () => ({
  ProfileScreen: ({ onBackToPlanner, onLogout }: { onBackToPlanner: () => void; onLogout: () => void }) => (
    <div>
      <button onClick={onBackToPlanner}>Back to Planner from Profile</button>
      <button onClick={onLogout}>Logout from Profile</button>
      <span>Profile Screen</span>
    </div>
  ),
}))

jest.mock("@/components/workout-session", () => ({
  WorkoutSession: ({ onComplete }: { onComplete: () => void }) => (
    <button onClick={onComplete}>Complete Workout</button>
  ),
}))

describe("FitnessApp Page", () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks() // Clear all mocks before each test
  })

  const testUserProfile: UserProfile = {
    name: "Test User",
    email: "test@example.com",
    age: 30,
    gender: "male",
    weight: 70,
    height: 175,
    activityLevel: "moderate",
    fitnessGoals: ["lose weight", "build muscle"],
  }

  test("should save userProfile to localStorage on signup", () => {
    render(<FitnessApp />)
    // Initial screen is signup
    expect(screen.getByText("Complete Sign Up")).toBeInTheDocument()

    act(() => {
      fireEvent.click(screen.getByText("Complete Sign Up"))
    })

    // Check localStorage
    const storedProfile = localStorageMock.getItem("userProfile")
    expect(storedProfile).not.toBeNull()
    expect(JSON.parse(storedProfile!)).toEqual(testUserProfile)

    // Check if screen changed to planner
    expect(screen.getByText("Weekly Planner")).toBeInTheDocument()
  })

  test("should load userProfile from localStorage on initial render", () => {
    localStorageMock.setItem("userProfile", JSON.stringify(testUserProfile))
    render(<FitnessApp />)

    // Check if userProfile is loaded and screen is planner
    expect(screen.getByText("Weekly Planner")).toBeInTheDocument()
    // You might need to expose userProfile or currentScreen for a more direct assertion,
    // or check for an element that only appears when userProfile is set.
    // For now, navigating to 'planner' implies profile was loaded.
  })

  test("should clear localStorage and reset state on logout", () => {
    // Setup: User is signed in and on planner screen
    localStorageMock.setItem("userProfile", JSON.stringify(testUserProfile))
    render(<FitnessApp />)
    expect(screen.getByText("Weekly Planner")).toBeInTheDocument()

    // Trigger logout from planner (could also be from profile)
    act(() => {
      fireEvent.click(screen.getByText("Logout from Planner"))
    })

    // Check localStorage
    expect(localStorageMock.getItem("userProfile")).toBeNull()

    // Check if screen changed to signup
    expect(screen.getByText("Complete Sign Up")).toBeInTheDocument()
    expect(screen.queryByText("Weekly Planner")).not.toBeInTheDocument()
    expect(screen.queryByText("Profile Screen")).not.toBeInTheDocument()
  })

  test("handleLogout function correctly clears localStorage and resets screen", () => {
    // Directly test handleLogout by simulating a state where a user is logged in
    localStorageMock.setItem("userProfile", JSON.stringify(testUserProfile))

    const { rerender } = render(<FitnessApp />)

    // Ensure user is initially on planner screen due to localStorage
    expect(screen.getByText("Weekly Planner")).toBeInTheDocument()

    // To call handleLogout, we need to navigate to a screen with a logout button
    // and then click it. The previous test "should clear localStorage and reset state on logout"
    // already covers the integrated logout. This test can focus on the direct effects
    // if we could call handleLogout directly, but within component testing, we trigger via UI.

    // Let's ensure logout from Profile screen works too
    act(() => {
      fireEvent.click(screen.getByText("View Profile")) // Navigate to Profile
    })
    expect(screen.getByText("Profile Screen")).toBeInTheDocument()

    act(() => {
      fireEvent.click(screen.getByText("Logout from Profile")) // Click logout on Profile
    })

    expect(localStorageMock.getItem("userProfile")).toBeNull()
    expect(screen.getByText("Complete Sign Up")).toBeInTheDocument()
    expect(screen.queryByText("Profile Screen")).not.toBeInTheDocument()
  })
})
