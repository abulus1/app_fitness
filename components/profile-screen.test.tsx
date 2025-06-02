import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { ProfileScreen } from "./profile-screen" // Adjust path as necessary
import type { UserProfile } from "@/app/page" // Adjust path as necessary

describe("ProfileScreen Component", () => {
  const mockUserProfile: UserProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    age: 32,
    gender: "male",
    weight: 80,
    height: 180,
    activityLevel: "active",
    fitnessGoals: ["gain muscle", "increase endurance"],
  }

  const mockOnBackToPlanner = jest.fn()
  const mockOnLogout = jest.fn()

  beforeEach(() => {
    // Reset mocks before each test
    mockOnBackToPlanner.mockClear()
    mockOnLogout.mockClear()
    render(
      <ProfileScreen
        userProfile={mockUserProfile}
        onBackToPlanner={mockOnBackToPlanner}
        onLogout={mockOnLogout}
      />
    )
  })

  test("renders user profile information correctly", () => {
    expect(screen.getByText("User Profile")).toBeInTheDocument()
    expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument()
    expect(screen.getByText(mockUserProfile.email)).toBeInTheDocument()
    expect(screen.getByText(mockUserProfile.age.toString())).toBeInTheDocument()
    expect(screen.getByText(mockUserProfile.gender)).toBeInTheDocument()
    expect(screen.getByText(`${mockUserProfile.weight} kg`)).toBeInTheDocument()
    expect(screen.getByText(`${mockUserProfile.height} cm`)).toBeInTheDocument()
    expect(screen.getByText(mockUserProfile.activityLevel)).toBeInTheDocument()
    mockUserProfile.fitnessGoals.forEach((goal) => {
      expect(screen.getByText(goal)).toBeInTheDocument()
    })
  })

  test("renders placeholder texts for membership, workout history, and progress stats", () => {
    expect(screen.getByText("Membership Type:")).toBeInTheDocument()
    expect(screen.getByText("Standard")).toBeInTheDocument() // Placeholder value
    expect(screen.getByText("Workout History:")).toBeInTheDocument()
    expect(screen.getByText("Coming Soon")).toBeInTheDocument() // Placeholder value
    expect(screen.getByText("Progress Stats:")).toBeInTheDocument()
    expect(screen.getByText("Check back later!")).toBeInTheDocument() // Placeholder value
  })

  test('calls onBackToPlanner when "Back to Planner" button is clicked', () => {
    const backButton = screen.getByRole("button", { name: /back to planner/i })
    fireEvent.click(backButton)
    expect(mockOnBackToPlanner).toHaveBeenCalledTimes(1)
  })

  test('calls onLogout when "Logout" button is clicked', () => {
    const logoutButton = screen.getByRole("button", { name: /logout/i })
    fireEvent.click(logoutButton)
    expect(mockOnLogout).toHaveBeenCalledTimes(1)
  })
})
