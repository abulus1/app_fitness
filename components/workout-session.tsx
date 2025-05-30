"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { DayWorkout, Exercise, UserProfile } from "@/app/page"
import { ArrowLeft, CheckCircle, Timer, Flame } from "lucide-react"

interface WorkoutSessionProps {
  workout: DayWorkout
  userProfile: UserProfile
  onComplete: () => void
}

export function WorkoutSession({ workout, userProfile, onComplete }: WorkoutSessionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [completedExercises, setCompletedExercises] = useState<string[]>([])
  const [sessionTime, setSessionTime] = useState(0)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive) {
      interval = setInterval(() => {
        setSessionTime((time) => time + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive])

  const currentExercise = workout.exercises[currentExerciseIndex]
  const progress = (completedExercises.length / workout.exercises.length) * 100

  const calculateCalories = (exercise: Exercise, userProfile: UserProfile) => {
    // Simplified calorie calculation based on exercise type, weight, and reps
    const baseCaloriesPerRep = {
      "Push-ups": 0.5,
      Squats: 0.6,
      "Bench Press": 0.8,
      Deadlift: 1.0,
      "Pull-ups": 0.7,
      "Bicep Curls": 0.3,
      "Shoulder Press": 0.5,
      Lunges: 0.4,
      Plank: 0.2,
      "Leg Press": 0.6,
    }

    const baseCalories = baseCaloriesPerRep[exercise.name as keyof typeof baseCaloriesPerRep] || 0.5
    const weightFactor = userProfile.weight / 70 // Normalize to 70kg
    const weightUsedFactor = exercise.weight > 0 ? 1 + exercise.weight / 50 : 1

    return Math.round(baseCalories * exercise.reps * weightFactor * weightUsedFactor)
  }

  const completeExercise = () => {
    if (!completedExercises.includes(currentExercise.id)) {
      setCompletedExercises([...completedExercises, currentExercise.id])
    }

    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    }
  }

  const goToExercise = (index: number) => {
    setCurrentExerciseIndex(index)
  }

  const finishWorkout = () => {
    setIsActive(false)
    // Calculate total calories burned
    const totalCalories = workout.exercises.reduce((total, exercise) => {
      return total + calculateCalories(exercise, userProfile)
    }, 0)

    // Show completion summary (you could add a modal here)
    alert(
      `Workout Complete!\nTime: ${Math.floor(sessionTime / 60)}:${(sessionTime % 60).toString().padStart(2, "0")}\nCalories Burned: ${totalCalories}`,
    )
    onComplete()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const totalCalories = workout.exercises.reduce((total, exercise) => {
    if (completedExercises.includes(exercise.id)) {
      return total + calculateCalories(exercise, userProfile)
    }
    return total
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onComplete}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{workout.day} Workout</h1>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className="font-mono">{formatTime(sessionTime)}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">
                  {completedExercises.length} / {workout.exercises.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>{totalCalories} calories</span>
                </div>
                <span className="text-gray-600">{Math.round(progress)}% complete</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Exercise */}
      {currentExercise && (
        <div className="p-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{currentExercise.name}</CardTitle>
                {completedExercises.includes(currentExercise.id) && <CheckCircle className="h-6 w-6 text-green-500" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Video Placeholder */}
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Exercise Video</span>
                </div>

                {/* Exercise Details */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{currentExercise.reps}</p>
                    <p className="text-sm text-gray-600">Reps</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{currentExercise.weight}</p>
                    <p className="text-sm text-gray-600">kg</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{calculateCalories(currentExercise, userProfile)}</p>
                    <p className="text-sm text-gray-600">cal</p>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={completeExercise}
                  className="w-full"
                  size="lg"
                  disabled={completedExercises.includes(currentExercise.id)}
                >
                  {completedExercises.includes(currentExercise.id) ? "Completed" : "Mark Complete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exercise List */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold mb-3">All Exercises</h3>
        {workout.exercises.map((exercise, index) => (
          <Card
            key={exercise.id}
            className={`cursor-pointer transition-colors ${
              index === currentExerciseIndex ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => goToExercise(index)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {completedExercises.includes(exercise.id) ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <div>
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-sm text-gray-600">
                      {exercise.reps} reps • {exercise.weight}kg
                    </p>
                  </div>
                </div>
                <Badge variant={completedExercises.includes(exercise.id) ? "default" : "secondary"}>
                  {calculateCalories(exercise, userProfile)} cal
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Finish Workout */}
      {completedExercises.length === workout.exercises.length && (
        <div className="p-4">
          <Button onClick={finishWorkout} className="w-full" size="lg">
            Finish Workout
          </Button>
        </div>
      )}
    </div>
  )
}
