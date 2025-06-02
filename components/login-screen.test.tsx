import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { LoginScreen } from "./login-screen"
import type { LoginCredentials } from "./login-screen"

describe("LoginScreen Component", () => {
  const mockOnLogin = jest.fn()
  const mockOnNavigateToRegister = jest.fn()

  beforeEach(() => {
    mockOnLogin.mockClear()
    mockOnNavigateToRegister.mockClear()
  })

  test("renders all form fields and buttons", () => {
    render(<LoginScreen onLogin={mockOnLogin} onNavigateToRegister={mockOnNavigateToRegister} />)
    expect(screen.getByText("Welcome Back")).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /don't have an account\? register/i })).toBeInTheDocument()
  })

  test("input field changes update state", () => {
    render(<LoginScreen onLogin={mockOnLogin} onNavigateToRegister={mockOnNavigateToRegister} />)
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "test@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })

    expect((screen.getByLabelText(/email address/i) as HTMLInputElement).value).toBe("test@example.com")
    expect((screen.getByLabelText(/password/i) as HTMLInputElement).value).toBe("password123")
  })

  test("successful login calls onLogin with correct credentials", () => {
    render(<LoginScreen onLogin={mockOnLogin} onNavigateToRegister={mockOnNavigateToRegister} />)
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "user@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: /login/i }))

    expect(mockOnLogin).toHaveBeenCalledTimes(1)
    expect(mockOnLogin).toHaveBeenCalledWith<[LoginCredentials]>({
      email: "user@example.com",
      password: "password123",
    })
    expect(screen.queryByText(/email and password are required/i)).not.toBeInTheDocument()
  })

  test("shows internal error if required fields are empty", () => {
    render(<LoginScreen onLogin={mockOnLogin} onNavigateToRegister={mockOnNavigateToRegister} />)
    fireEvent.click(screen.getByRole("button", { name: /login/i }))
    expect(screen.getByText(/email and password are required/i)).toBeInTheDocument()
    expect(mockOnLogin).not.toHaveBeenCalled()
  })
  
  test("shows internal error for invalid email format", () => {
    render(<LoginScreen onLogin={mockOnLogin} onNavigateToRegister={mockOnNavigateToRegister} />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "invalidemail" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test("displays error prop message from parent", () => {
    const errorMessage = "Invalid credentials from server."
    render(<LoginScreen onLogin={mockOnLogin} onNavigateToRegister={mockOnNavigateToRegister} error={errorMessage} />)
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })
  
  test("internal error takes precedence over prop error if both exist (e.g. client validation fails first)", () => {
    const propErrorMessage = "Error from server (should not see this if client error exists)";
    render(<LoginScreen onLogin={mockOnLogin} onNavigateToRegister={mockOnNavigateToRegister} error={propErrorMessage} />);
    // Trigger client-side error by submitting empty form
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.getByText(/email and password are required/i)).toBeInTheDocument();
    expect(screen.queryByText(propErrorMessage)).not.toBeInTheDocument();
  });


  test("calls onNavigateToRegister when 'Don't have an account? Register' is clicked", () => {
    render(<LoginScreen onLogin={mockOnLogin} onNavigateToRegister={mockOnNavigateToRegister} />)
    fireEvent.click(screen.getByRole("button", { name: /don't have an account\? register/i }))
    expect(mockOnNavigateToRegister).toHaveBeenCalledTimes(1)
  })
})
