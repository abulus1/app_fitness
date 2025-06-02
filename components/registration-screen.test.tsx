import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { RegistrationScreen } from "./registration-screen"
import type { RegistrationData } from "./registration-screen"

describe("RegistrationScreen Component", () => {
  const mockOnRegister = jest.fn()
  const mockOnNavigateToLogin = jest.fn()

  beforeEach(() => {
    mockOnRegister.mockClear()
    mockOnNavigateToLogin.mockClear()
    render(<RegistrationScreen onRegister={mockOnRegister} onNavigateToLogin={mockOnNavigateToLogin} />)
  })

  test("renders all form fields and buttons", () => {
    expect(screen.getByText("Create an Account")).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument() // Use exact match for "Password"
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /already have an account\? login/i })).toBeInTheDocument()
  })

  test("input field changes update state", () => {
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Test Name" } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "test@example.com" } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } })
    // For Select, it's harder to directly test state change without more complex interaction or exposing state.
    // We'll test its effect during submission.

    expect((screen.getByLabelText(/full name/i) as HTMLInputElement).value).toBe("Test Name")
    expect((screen.getByLabelText(/email address/i) as HTMLInputElement).value).toBe("test@example.com")
    expect((screen.getByLabelText(/^password$/i) as HTMLInputElement).value).toBe("password123")
    expect((screen.getByLabelText(/confirm password/i) as HTMLInputElement).value).toBe("password123")
  })

  test("successful registration calls onRegister with correct data", () => {
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Test User" } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "user@example.com" } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } })
    // Role defaults to "user", can also simulate selection if needed
    // fireEvent.click(screen.getByLabelText(/role/i)); fireEvent.click(screen.getByText("Admin")); // Example if needed

    fireEvent.click(screen.getByRole("button", { name: /register/i }))

    expect(mockOnRegister).toHaveBeenCalledTimes(1)
    expect(mockOnRegister).toHaveBeenCalledWith<[RegistrationData]>({
      name: "Test User",
      email: "user@example.com",
      password: "password123",
      role: "user", // Default role
    })
    expect(screen.queryByText(/all fields are required/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument()
  })

  test("shows error if required fields are empty", () => {
    fireEvent.click(screen.getByRole("button", { name: /register/i }))
    expect(screen.getByText(/all fields are required/i)).toBeInTheDocument()
    expect(mockOnRegister).not.toHaveBeenCalled()
  })

  test("shows error if passwords do not match", () => {
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Test User" } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "user@example.com" } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password456" } })
    fireEvent.click(screen.getByRole("button", { name: /register/i }))
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    expect(mockOnRegister).not.toHaveBeenCalled()
  })
  
  test("shows error for invalid email format", () => {
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Test User" } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "invalidemail" } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  test("shows error for short password", () => {
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Test User" } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "user@example.com" } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "123" } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "123" } })
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(screen.getByText(/password must be at least 6 characters long/i)).toBeInTheDocument();
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  test("calls onNavigateToLogin when 'Already have an account? Login' is clicked", () => {
    fireEvent.click(screen.getByRole("button", { name: /already have an account\? login/i }))
    expect(mockOnNavigateToLogin).toHaveBeenCalledTimes(1)
  })
})
