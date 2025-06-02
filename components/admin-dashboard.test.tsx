import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { AdminDashboard } from "./admin-dashboard"
import type { UserProfile } from "@/app/page" // Adjust path as necessary

describe("AdminDashboard Component", () => {
  const mockOnViewUserProfile = jest.fn()
  const mockOnLogout = jest.fn()

  const mockUsers: UserProfile[] = [
    {
      name: "Alice Wonderland",
      email: "alice@example.com",
      age: 30,
      gender: "female",
      weight: 60,
      height: 165,
      activityLevel: "moderate",
      fitnessGoals: ["run a marathon"],
      role: "user",
      membershipType: "premium",
      workoutHistory: [],
    },
    {
      name: "Bob The Builder",
      email: "bob@example.com",
      age: 45,
      gender: "male",
      weight: 85,
      height: 180,
      activityLevel: "active",
      fitnessGoals: ["build strength"],
      role: "user",
      membershipType: "basic",
      workoutHistory: [],
    },
    {
      name: "Charlie Admin",
      email: "charlie@admin.com",
      age: 38,
      gender: "male",
      weight: 75,
      height: 177,
      activityLevel: "sedentary",
      fitnessGoals: ["manage users"],
      role: "admin",
      membershipType: "trial",
      workoutHistory: [],
    },
  ]

  beforeEach(() => {
    mockOnViewUserProfile.mockClear()
    mockOnLogout.mockClear()
  })

  test("renders dashboard title and logout button", () => {
    render(<AdminDashboard allUsers={mockUsers} onViewUserProfile={mockOnViewUserProfile} onLogout={mockOnLogout} />)
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument()
    expect(screen.getByText("User Management")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument()
  })

  test("displays 'No users found.' message when allUsers is empty", () => {
    render(<AdminDashboard allUsers={[]} onViewUserProfile={mockOnViewUserProfile} onLogout={mockOnLogout} />)
    expect(screen.getByText("No users found.")).toBeInTheDocument()
  })

  test("displays 'No users found.' message when allUsers is undefined", () => {
    render(<AdminDashboard allUsers={undefined as any} onViewUserProfile={mockOnViewUserProfile} onLogout={mockOnLogout} />)
    expect(screen.getByText("No users found.")).toBeInTheDocument()
  })

  test("renders table with user information when users are provided", () => {
    render(<AdminDashboard allUsers={mockUsers} onViewUserProfile={mockOnViewUserProfile} onLogout={mockOnLogout} />)

    // Check for table headers
    expect(screen.getByRole("columnheader", { name: /name/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /email/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /role/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /membership/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /actions/i })).toBeInTheDocument()

    // Check for user data in table cells
    mockUsers.forEach(user => {
      expect(screen.getByRole("cell", { name: user.name })).toBeInTheDocument()
      expect(screen.getByRole("cell", { name: user.email })).toBeInTheDocument()
      expect(screen.getByRole("cell", { name: user.role.charAt(0).toUpperCase() + user.role.slice(1) })).toBeInTheDocument()
      expect(screen.getByRole("cell", { name: user.membershipType.charAt(0).toUpperCase() + user.membershipType.slice(1) })).toBeInTheDocument()
    })
  })

  test("calls onViewUserProfile with correct email when 'View/Edit' button is clicked", () => {
    render(<AdminDashboard allUsers={mockUsers} onViewUserProfile={mockOnViewUserProfile} onLogout={mockOnLogout} />)

    const viewEditButtons = screen.getAllByRole("button", { name: /view\/edit/i })
    expect(viewEditButtons.length).toBe(mockUsers.length)

    // Click the button for the first user
    fireEvent.click(viewEditButtons[0])
    expect(mockOnViewUserProfile).toHaveBeenCalledTimes(1)
    expect(mockOnViewUserProfile).toHaveBeenCalledWith(mockUsers[0].email)

    // Click the button for the second user
    fireEvent.click(viewEditButtons[1])
    expect(mockOnViewUserProfile).toHaveBeenCalledTimes(2) // Incremented
    expect(mockOnViewUserProfile).toHaveBeenCalledWith(mockUsers[1].email)
  })

  test("calls onLogout when 'Logout' button is clicked", () => {
    render(<AdminDashboard allUsers={mockUsers} onViewUserProfile={mockOnViewUserProfile} onLogout={mockOnLogout} />)
    const logoutButton = screen.getByRole("button", { name: /logout/i })
    fireEvent.click(logoutButton)
    expect(mockOnLogout).toHaveBeenCalledTimes(1)
  })
})
