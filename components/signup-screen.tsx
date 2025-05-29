"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserProfile } from "@/app/page"
import { Dumbbell } from "lucide-react"

interface SignUpScreenProps {
  onComplete: (profile: UserProfile) => void
}

export function SignUpScreen({ onComplete }: SignUpScreenProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    activityLevel: "",
    fitnessGoals: [] as string[],
  })

  const fitnessGoalOptions = [
    "Weight Loss",
    "Muscle Gain",
    "Strength Building",
    "Endurance",
    "General Fitness",
    "Flexibility",
  ]

  const handleGoalChange = (goal: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        fitnessGoals: [...prev.fitnessGoals, goal],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        fitnessGoals: prev.fitnessGoals.filter((g) => g !== goal),
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const profile: UserProfile = {
      name: formData.name,
      email: formData.email,
      age: Number.parseInt(formData.age),
      gender: formData.gender as "male" | "female" | "other",
      weight: Number.parseFloat(formData.weight),
      height: Number.parseFloat(formData.height),
      activityLevel: formData.activityLevel as UserProfile["activityLevel"],
      fitnessGoals: formData.fitnessGoals,
    }

    onComplete(profile)
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Dumbbell className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Your Fitness Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData((prev) => ({ ...prev, height: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select
                value={formData.activityLevel}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, activityLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                  <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="very-active">Very Active (2x/day)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Fitness Goals</Label>
              <div className="grid grid-cols-2 gap-2">
                {fitnessGoalOptions.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={formData.fitnessGoals.includes(goal)}
                      onCheckedChange={(checked) => handleGoalChange(goal, checked as boolean)}
                    />
                    <Label htmlFor={goal} className="text-sm">
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">
              Create Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
