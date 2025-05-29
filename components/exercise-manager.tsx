"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DayWorkout, Exercise } from "@/app/page"
import { Plus, Trash2, ArrowLeft } from "lucide-react"

interface ExerciseManagerProps {
  workout: DayWorkout
  onSave: (workout: DayWorkout) => void
  onCancel: () => void
}

const exerciseDatabase = [
  { name: "Push-ups", videoUrl: "/placeholder.svg?height=200&width=300" },
  { name: "Squats", videoUrl: "/placeholder.svg?height=200&width=300" },
  { name: "Bench Press", videoUrl: "/placeholder.svg?height=200&width=300" },
  { name: "Deadlift", videoUrl: "/placeholder.svg?height=200&width=300" },
  { name: "Pull-ups", videoUrl: "/placeholder.svg?height=200&width=300" },
  { name: "Bicep Curls", videoUrl: "/placeholder.svg?height=200&width=300" },
  { name: "Shoulder Press", videoUrl: "/placeholder.svg?height=200&width=300" },
  { name: "Lunges", videoUrl: "/placeholder.svg?height=200&width=300" },
  { name: "Plank", videoUrl: "/placeholder.svg?height=200&width=300" },
  { name: "Leg Press", videoUrl: "/placeholder.svg?height=200&width=300" },
]

export function ExerciseManager({ workout, onSave, onCancel }: ExerciseManagerProps) {
  const [exercises, setExercises] = useState<Exercise[]>(workout.exercises)
  const [selectedExercise, setSelectedExercise] = useState("")

  const addExercise = () => {
    const exerciseData = exerciseDatabase.find((ex) => ex.name === selectedExercise)
    if (exerciseData) {
      const newExercise: Exercise = {
        id: Date.now().toString(),
        name: exerciseData.name,
        videoUrl: exerciseData.videoUrl,
        reps: 10,
        weight: 0,
      }
      setExercises([...exercises, newExercise])
      setSelectedExercise("")
    }
  }

  const updateExercise = (id: string, field: keyof Exercise, value: string | number) => {
    setExercises(exercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)))
  }

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id))
  }

  const handleSave = () => {
    onSave({ ...workout, exercises })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Edit {workout.day} Workout</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Add Exercise */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseDatabase.map((exercise) => (
                    <SelectItem key={exercise.name} value={exercise.name}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addExercise} disabled={!selectedExercise}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exercise List */}
        {exercises.map((exercise, index) => (
          <Card key={exercise.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{exercise.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => removeExercise(exercise.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Video Placeholder */}
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Exercise Video</span>
                </div>

                {/* Exercise Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`reps-${exercise.id}`}>Repetitions</Label>
                    <Input
                      id={`reps-${exercise.id}`}
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(exercise.id, "reps", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`weight-${exercise.id}`}>Weight (kg)</Label>
                    <Input
                      id={`weight-${exercise.id}`}
                      type="number"
                      step="0.5"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(exercise.id, "weight", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Save Button */}
        <div className="pt-4">
          <Button onClick={handleSave} className="w-full" size="lg">
            Save Workout
          </Button>
        </div>
      </div>
    </div>
  )
}
