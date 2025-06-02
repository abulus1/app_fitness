"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, AlertCircle } from "lucide-react"

export interface LoginCredentials {
  email: string
  password: string
}

interface LoginScreenProps {
  onLogin: (credentials: LoginCredentials) => void
  onNavigateToRegister: () => void
  error?: string | null // Optional error message from parent
}

export function LoginScreen({ onLogin, onNavigateToRegister, error: propError }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [internalError, setInternalError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setInternalError(null) // Clear previous internal errors

    if (!email || !password) {
      setInternalError("Email and password are required.")
      return
    }
    
    // Basic email validation (can be improved)
    if (!/\S+@\S+\.\S+/.test(email)) {
      setInternalError("Invalid email format.")
      return
    }

    onLogin({ email, password })
  }

  const displayError = propError || internalError;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to login.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayError && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-md flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {displayError}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" onClick={handleSubmit}>
            Login
          </Button>
          <Button variant="link" size="sm" className="text-sm text-muted-foreground" onClick={onNavigateToRegister}>
            Don't have an account? Register
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
