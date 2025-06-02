import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { Sidebar } from "./sidebar"
import type { UserProfile, WorkoutRecord } from "@/app/page" // Assuming UserProfile is needed
import { Calendar, User, History, PlusSquare, ListChecks, Ticket, ShieldCheck, LogOut, UserCircle } from "lucide-react" // Import icons for matching

// Mock lucide-react icons to simplify testing and avoid complex SVG rendering
jest.mock("lucide-react", () => {
  const original = jest.requireActual("lucide-react");
  return {
    ...original, // Spread original exports
    Calendar: () => <div data-testid="icon-calendar">Calendar</div>,
    User: () => <div data-testid="icon-user">User</div>,
    History: () => <div data-testid="icon-history">History</div>,
    PlusSquare: () => <div data-testid="icon-plussquare">PlusSquare</div>,
    ListChecks: () => <div data-testid="icon-listchecks">ListChecks</div>,
    Ticket: () => <div data-testid="icon-ticket">Ticket</div>,
    ShieldCheck: () => <div data-testid="icon-shieldcheck">ShieldCheck</div>,
    LogOut: () => <div data-testid="icon-logout">LogOut</div>,
    UserCircle: () => <div data-testid="icon-usercircle">UserCircle</div>,
  };
});


describe("Sidebar Component", () => {
  const mockOnNavigate = jest.fn();
  const mockOnLogout = jest.fn();

  const userProfileUser: UserProfile = {
    name: "Test User",
    email: "user@example.com",
    role: "user",
    age: 30, gender: "male", weight: 70, height: 170, activityLevel: "moderate", fitnessGoals: [], membershipType: "trial", workoutHistory: [], password: "123"
  };

  const userProfileAdmin: UserProfile = {
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    age: 30, gender: "male", weight: 70, height: 170, activityLevel: "moderate", fitnessGoals: [], membershipType: "trial", workoutHistory: [], password: "123"
  };

  beforeEach(() => {
    mockOnNavigate.mockClear();
    mockOnLogout.mockClear();
  });

  test("renders user info when userProfile is provided", () => {
    render(<Sidebar currentScreen="planner" onNavigate={mockOnNavigate} onLogout={mockOnLogout} userProfile={userProfileUser} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    // Check for initials or UserCircle icon based on implementation
    expect(screen.getByText("TU")).toBeInTheDocument(); // Based on getInitials("Test User")
  });
  
  test("renders guest info when userProfile is null", () => {
    render(<Sidebar currentScreen="planner" onNavigate={mockOnNavigate} onLogout={mockOnLogout} userProfile={null} />);
    expect(screen.getByText("Guest User")).toBeInTheDocument();
    expect(screen.getByTestId("icon-usercircle")).toBeInTheDocument();
  });


  test("renders all standard navigation links", () => {
    render(<Sidebar currentScreen="planner" onNavigate={mockOnNavigate} onLogout={mockOnLogout} userProfile={userProfileUser} />);
    expect(screen.getByRole("button", { name: /planner/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /training history/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create your routine/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pre-made routines/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /booking\/reservation/i })).toBeInTheDocument();
  });

  test("highlights the active link based on currentScreen prop", () => {
    render(<Sidebar currentScreen="profile" onNavigate={mockOnNavigate} onLogout={mockOnLogout} userProfile={userProfileUser} />);
    const profileButton = screen.getByRole("button", { name: /profile/i });
    // Check for a class or style that indicates active state.
    // Sidebar uses variant="secondary" or "bg-gray-700" for active.
    // Since variant is harder to check directly without inspecting computed styles or specific class names from the variant,
    // we rely on the visual difference or a data-attribute if set by the component.
    // For this example, we assume 'bg-gray-700' is a distinguishing class for active.
    expect(profileButton).toHaveClass("bg-gray-700"); // Or check for variant="secondary" if possible

    const plannerButton = screen.getByRole("button", { name: /planner/i });
    expect(plannerButton).not.toHaveClass("bg-gray-700");
    expect(plannerButton).toHaveClass("hover:bg-gray-700/80"); // Check non-active style
  });

  test("clicking a navigation link calls onNavigate with the correct screen key", () => {
    render(<Sidebar currentScreen="planner" onNavigate={mockOnNavigate} onLogout={mockOnLogout} userProfile={userProfileUser} />);
    fireEvent.click(screen.getByRole("button", { name: /profile/i }));
    expect(mockOnNavigate).toHaveBeenCalledWith("profile");

    fireEvent.click(screen.getByRole("button", { name: /booking\/reservation/i }));
    expect(mockOnNavigate).toHaveBeenCalledWith("booking");
  });

  test("renders 'Admin Dashboard' link if user is admin", () => {
    render(<Sidebar currentScreen="planner" onNavigate={mockOnNavigate} onLogout={mockOnLogout} userProfile={userProfileAdmin} />);
    expect(screen.getByRole("button", { name: /admin dashboard/i })).toBeInTheDocument();
  });

  test("does not render 'Admin Dashboard' link if user is not admin", () => {
    render(<Sidebar currentScreen="planner" onNavigate={mockOnNavigate} onLogout={mockOnLogout} userProfile={userProfileUser} />);
    expect(screen.queryByRole("button", { name: /admin dashboard/i })).not.toBeInTheDocument();
  });

  test("clicking 'Admin Dashboard' link calls onNavigate with 'adminDashboard'", () => {
    render(<Sidebar currentScreen="planner" onNavigate={mockOnNavigate} onLogout={mockOnLogout} userProfile={userProfileAdmin} />);
    fireEvent.click(screen.getByRole("button", { name: /admin dashboard/i }));
    expect(mockOnNavigate).toHaveBeenCalledWith("adminDashboard");
  });
  
  test("renders and calls onLogout when logout button is clicked", () => {
    render(<Sidebar currentScreen="planner" onNavigate={mockOnNavigate} onLogout={mockOnLogout} userProfile={userProfileUser} />);
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
    fireEvent.click(logoutButton);
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });
});
