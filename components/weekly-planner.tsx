"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { UserProfile, WeeklyPlan, DayWorkout } from "@/app/page"
import { ExerciseManager } from "@/components/exercise-manager"
import { Calendar, Plus, Play, User, ChevronLeft, ChevronRight, LogOut, ShieldCheck } from "lucide-react" // Import ShieldCheck

interface WeeklyPlannerProps {
  userProfile: UserProfile
  weeklyPlans: WeeklyPlan[]
  onUpdatePlans: (plans: WeeklyPlan[]) => void
  onStartWorkout: (workout: DayWorkout) => void
  onBackToSignup: () => void
  onViewProfile: () => void
  onLogout: () => void
  onNavigateToAdminDashboard?: () => void // New prop
}

export function WeeklyPlanner({
  userProfile,
  weeklyPlans,
  onUpdatePlans,
  onStartWorkout,
  onBackToSignup,
  onViewProfile,
  onLogout,
  onNavigateToAdminDashboard, // New prop
}: WeeklyPlannerProps) {
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showExerciseManager, setShowExerciseManager] = useState(false)

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  function getCurrentWeek() {
    const today = new Date()
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1))
    return monday.toISOString().split("T")[0]
  }

  function getNextWeek(weekOf: string) {
    const date = new Date(weekOf)
    date.setDate(date.getDate() + 7)
    return date.toISOString().split("T")[0]
  }

  function getPreviousWeek(weekOf: string) {
    const date = new Date(weekOf)
    date.setDate(date.getDate() - 7)
    return date.toISOString().split("T")[0]
  }

  const currentPlan = weeklyPlans.find((plan) => plan.weekOf === currentWeek) || {
    weekOf: currentWeek,
    workouts: weekdays.map((day) => ({ day, exercises: [] })),
  }

  const handleAddExercise = (day: string) => {
    setSelectedDay(day)
    setShowExerciseManager(true)
  }

  const handleUpdateWorkout = (updatedWorkout: DayWorkout) => {
    const updatedPlans = [...weeklyPlans]
    const planIndex = updatedPlans.findIndex((plan) => plan.weekOf === currentWeek)

    if (planIndex >= 0) {
      const workoutIndex = updatedPlans[planIndex].workouts.findIndex((w) => w.day === updatedWorkout.day)
      updatedPlans[planIndex].workouts[workoutIndex] = updatedWorkout
    } else {
      const newPlan: WeeklyPlan = {
        weekOf: currentWeek,
        workouts: weekdays.map((day) => (day === updatedWorkout.day ? updatedWorkout : { day, exercises: [] })),
      }
      updatedPlans.push(newPlan)
    }

    onUpdatePlans(updatedPlans)
    setShowExerciseManager(false)
    setSelectedDay(null)
  }

  if (showExerciseManager && selectedDay) {
    const dayWorkout = currentPlan.workouts.find((w) => w.day === selectedDay) || { day: selectedDay, exercises: [] }
    return (
      <ExerciseManager
        workout={dayWorkout}
        onSave={handleUpdateWorkout}
        onCancel={() => {
          setShowExerciseManager(false)
          setSelectedDay(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onViewProfile}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              {userProfile.role === "admin" && onNavigateToAdminDashboard && (
                <Button variant="ghost" size="sm" onClick={onNavigateToAdminDashboard}>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
            </div>
            <h1 className="text-xl font-bold">Weekly Planner</h1>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(getPreviousWeek(currentWeek))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Week of {new Date(currentWeek).toLocaleDateString()}</span>
            </div>

            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(getNextWeek(currentWeek))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{userProfile.name}</h3>
                <p className="text-sm text-gray-600">
                  {userProfile.weight}kg • {userProfile.height}cm
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {userProfile.fitnessGoals.slice(0, 2).map((goal) => (
                  <Badge key={goal} variant="secondary" className="text-xs">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule */}
      <div className="p-4 space-y-3">
        {weekdays.map((day) => {
          const dayWorkout = currentPlan.workouts.find((w) => w.day === day)
          const exerciseCount = dayWorkout?.exercises.length || 0

          return (
            <Card key={day}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{day}</CardTitle>
                  <Badge variant={exerciseCount > 0 ? "default" : "secondary"}>{exerciseCount} exercises</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {exerciseCount > 0 ? (
                  <div className="space-y-2">
                    {dayWorkout?.exercises.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{exercise.name}</p>
                          <p className="text-xs text-gray-600">
                            {exercise.reps} reps • {exercise.weight}kg
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1" onClick={() => onStartWorkout(dayWorkout!)}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Workout
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddExercise(day)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => handleAddExercise(day)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercises
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
