"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { DayWorkout, Exercise, UserProfile } from "@/app/page"
import { ArrowLeft, CheckCircle, Timer, Flame } from "lucide-react"
import { calculateCaloriesBurned } from "@/lib/utils" // Import the new calorie calculation utility

import { WorkoutRecord } from "@/app/page"; 

interface WorkoutSessionProps {
  workout: DayWorkout
  userProfile: UserProfile
  onComplete: (completedWorkoutData: WorkoutRecord) => void // Updated signature
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

  // Helper to calculate duration for a single exercise based on reps (3 seconds per rep)
  const getExerciseDurationMinutes = (reps: number): number => {
    return (reps * 3) / 60; // Duration in minutes
  };

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

  const finishWorkout = (isFullyCompleted: boolean = true) => {
    setIsActive(false)
    
    const finalExercisesPerformed = workout.exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      reps: ex.reps, // Assuming these are target reps, or actual if tracked
      weight: ex.weight, // Assuming this is target weight, or actual if tracked
    }));

    // Use the existing totalCalories calculation which sums up calories for completed exercises
    // If !isFullyCompleted, this will reflect partial completion.
    // If isFullyCompleted, it's implied all exercises contributed if they were marked.
    let totalCaloriesBurnedForSession = 0;
    workout.exercises.forEach(exercise => {
      if (completedExercises.includes(exercise.id) || isFullyCompleted) { // If fully completed, count all exercises
        const exerciseDurationMinutes = getExerciseDurationMinutes(exercise.reps);
        totalCaloriesBurnedForSession += calculateCaloriesBurned(exercise, userProfile.weight, exerciseDurationMinutes);
      }
    });
    
    const record: WorkoutRecord = {
      date: new Date().toISOString(),
      duration: Math.floor(sessionTime / 60), 
      exercisesPerformed: finalExercisesPerformed,
      caloriesBurned: totalCaloriesBurnedForSession,
    }
    onComplete(record)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate total calories for UI display (dynamic based on completed exercises)
  const currentDisplayedTotalCalories = workout.exercises.reduce((total, exercise) => {
    if (completedExercises.includes(exercise.id)) {
      const exerciseDurationMinutes = getExerciseDurationMinutes(exercise.reps);
      return total + calculateCaloriesBurned(exercise, userProfile.weight, exerciseDurationMinutes);
    }
    return total;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          {/* Updated: Header back button calls finishWorkout with isFullyCompleted = false */}
          <Button variant="ghost" size="sm" onClick={() => finishWorkout(false) }> 
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
                  <span>{currentDisplayedTotalCalories} calories</span>
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
                    <p className="text-2xl font-bold">
                      {calculateCaloriesBurned(currentExercise, userProfile.weight, getExerciseDurationMinutes(currentExercise.reps))}
                    </p>
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
                  {calculateCaloriesBurned(exercise, userProfile.weight, getExerciseDurationMinutes(exercise.reps))} cal
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Finish Workout */}
      {/* Button appears when all exercises are marked, or always visible to allow early finish?
          Current logic: only when all exercises are completed.
          This means finishWorkout(true) is only called when everything is done.
      */}
      {completedExercises.length === workout.exercises.length && (
        <div className="p-4">
          <Button onClick={() => finishWorkout(true)} className="w-full" size="lg">
            Finish Workout
          </Button>
        </div>
      )}
    </div>
  )
}
