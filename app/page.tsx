"use client"

import { useState, useEffect } from "react" // Import useEffect
import { SignUpScreen } from "@/components/signup-screen"
import { WeeklyPlanner } from "@/components/weekly-planner"
import { WorkoutSession } from "@/components/workout-session"
import { ProfileScreen } from "@/components/profile-screen" // Import ProfileScreen

export type UserProfile = {
  name: string
  email: string
  age: number
  gender: "male" | "female" | "other"
  weight: number
  height: number
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very-active"
  fitnessGoals: string[]
}

export type Exercise = {
  id: string
  name: string
  category: string
  youtubeUrl: string
  reps: number
  weight: number
  calories?: number
  mets?: number // Added METS as it's in the DB and likely needed for calorie calculation
}

export type DayWorkout = {
  day: string
  exercises: Exercise[]
}

export type WeeklyPlan = {
  weekOf: string
  workouts: DayWorkout[]
}

export default function FitnessApp() {
  const [currentScreen, setCurrentScreen] = useState<"signup" | "planner" | "workout" | "profile">("signup")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([])
  const [currentWorkout, setCurrentWorkout] = useState<DayWorkout | null>(null)

  // useEffect to load userProfile from localStorage on initial render
  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile")
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile))
      setCurrentScreen("planner") // Optionally, navigate to planner if profile exists
    }
  }, [])

  const handleSignUpComplete = (profile: UserProfile) => {
    setUserProfile(profile)
    localStorage.setItem("userProfile", JSON.stringify(profile)) // Store userProfile in localStorage
    setCurrentScreen("planner")
  }

  const handleStartWorkout = (workout: DayWorkout) => {
    setCurrentWorkout(workout)
    setCurrentScreen("workout")
  }

  const handleWorkoutComplete = () => {
    setCurrentWorkout(null)
    setCurrentScreen("planner")
  }

  const updateWeeklyPlans = (plans: WeeklyPlan[]) => {
    setWeeklyPlans(plans)
  }

  const handleViewProfile = () => {
    setCurrentScreen("profile")
  }

  const handleBackToPlanner = () => {
    setCurrentScreen("planner")
  }

  const handleLogout = () => {
    localStorage.removeItem("userProfile")
    setUserProfile(null)
    setCurrentScreen("signup")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === "signup" && <SignUpScreen onComplete={handleSignUpComplete} />}

      {currentScreen === "planner" && userProfile && (
        <WeeklyPlanner
          userProfile={userProfile}
          weeklyPlans={weeklyPlans}
          onUpdatePlans={updateWeeklyPlans}
          onStartWorkout={handleStartWorkout}
          onBackToSignup={() => setCurrentScreen("signup")}
          onViewProfile={handleViewProfile} // Pass handleViewProfile to WeeklyPlanner
          onLogout={handleLogout} // Pass handleLogout to WeeklyPlanner
        />
      )}

      {currentScreen === "workout" && currentWorkout && userProfile && (
        <WorkoutSession workout={currentWorkout} userProfile={userProfile} onComplete={handleWorkoutComplete} />
      )}

      {currentScreen === "profile" && userProfile && (
        <ProfileScreen userProfile={userProfile} onBackToPlanner={handleBackToPlanner} onLogout={handleLogout} />
      )}
    </div>
  )
}
