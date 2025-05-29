"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DayWorkout, Exercise, UserProfile } from "@/app/page" // Imported UserProfile
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import { calculateCaloriesBurned } from "@/lib/utils" // Imported calculateCaloriesBurned

interface ExerciseManagerProps {
  workout: DayWorkout
  userProfile: UserProfile // Added userProfile
  onSave: (workout: DayWorkout) => void
  onCancel: () => void
}

const exerciseDatabase = [
  // Chest
  { name: "Bench Press (Barbell)", category: "Chest", youtubeUrl: "https://www.youtube.com/watch?v=SCVAc0sg0fQ", mets: 7.0 },
  { name: "Push-ups", category: "Chest", youtubeUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4", mets: 5.0 },
  { name: "Dumbbell Flyes", category: "Chest", youtubeUrl: "https://www.youtube.com/watch?v=eozb-ti_Kdc", mets: 4.5 },
  { name: "Incline Dumbbell Press", category: "Chest", youtubeUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8", mets: 6.0 },
  { name: "Dips (Chest Version)", category: "Chest", youtubeUrl: "https://www.youtube.com/watch?v=J0dYtflHlU", mets: 7.5 },
  { name: "Cable Crossovers", category: "Chest", youtubeUrl: "https://www.youtube.com/watch?v=taI4XDUHOaI", mets: 4.0 },
  { name: "Decline Dumbbell Press", category: "Chest", youtubeUrl: "https://www.youtube.com/watch?v=LfyQBUKR8s4", mets: 6.0 },
  { name: "Machine Chest Press", category: "Chest", youtubeUrl: "https://www.youtube.com/watch?v=N426jH_L9bA", mets: 5.0 },

  // Back
  { name: "Pull-ups", category: "Back", youtubeUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g", mets: 8.0 },
  { name: "Bent-over Rows (Barbell)", category: "Back", youtubeUrl: "https://www.youtube.com/watch?v=vT2GjY_Umpw", mets: 6.5 },
  { name: "Deadlifts (Conventional)", category: "Back", youtubeUrl: "https://www.youtube.com/watch?v=ytGaGIn3SjE", mets: 8.0 },
  { name: "Lat Pulldowns", category: "Back", youtubeUrl: "https://www.youtube.com/watch?v=0oeV402Z97c", mets: 4.5 },
  { name: "Seated Cable Rows", category: "Back", youtubeUrl: "https://www.youtube.com/watch?v=GZbfZ033f74", mets: 4.5 },
  { name: "T-Bar Rows", category: "Back", youtubeUrl: "https://www.youtube.com/watch?v=j3Igk5nyZE4", mets: 6.5 },
  { name: "Single Arm Dumbbell Row", category: "Back", youtubeUrl: "https://www.youtube.com/watch?v=pYcpY20QaE8", mets: 5.0 },
  { name: "Face Pulls", category: "Back", youtubeUrl: "https://www.youtube.com/watch?v=rep-qVOkqgk", mets: 3.0 }, // Also good for shoulders

  // Legs
  { name: "Squats (Barbell Back)", category: "Legs", youtubeUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8", mets: 7.5 },
  { name: "Lunges (Dumbbell)", category: "Legs", youtubeUrl: "https://www.youtube.com/watch?v=D7KaRcUTQeE", mets: 4.5 },
  { name: "Leg Press", category: "Legs", youtubeUrl: "https://www.youtube.com/watch?v=GvRgijoJ2xY", mets: 6.0 },
  { name: "Romanian Deadlifts (RDL)", category: "Legs", youtubeUrl: "https://www.youtube.com/watch?v=2SHsk9AzdjA", mets: 5.5 }, // Primarily hamstrings/glutes
  { name: "Standing Calf Raises", category: "Legs", youtubeUrl: "https://www.youtube.com/watch?v=d2GgSoO6G90", mets: 3.5 },
  { name: "Lying Hamstring Curls", category: "Legs", youtubeUrl: "https://www.youtube.com/watch?v=NWhS28U6bCY", mets: 4.0 },
  { name: "Leg Extensions (Quad)", category: "Legs", youtubeUrl: "https://www.youtube.com/watch?v=YyvSfVjQeL0", mets: 4.0 },
  { name: "Goblet Squats", category: "Legs", youtubeUrl: "https://www.youtube.com/watch?v=MeW_P-avZgM", mets: 5.0 },

  // Shoulders
  { name: "Overhead Press (Barbell)", category: "Shoulders", youtubeUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDI", mets: 6.0 },
  { name: "Lateral Raises (Dumbbell)", category: "Shoulders", youtubeUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo", mets: 4.0 },
  { name: "Front Raises (Dumbbell)", category: "Shoulders", youtubeUrl: "https://www.youtube.com/watch?v=s_L128OkPds", mets: 3.5 },
  { name: "Reverse Pec Deck (Rear Delts)", category: "Shoulders", youtubeUrl: "https://www.youtube.com/watch?v=5_5Be9vR9z8", mets: 3.5 },
  // { name: "Face Pulls", category: "Shoulders", youtubeUrl: "https://www.youtube.com/watch?v=rep-qVOkqgk", mets: 3.0 }, // Already in Back, good for rear delts
  { name: "Arnold Press", category: "Shoulders", youtubeUrl: "https://www.youtube.com/watch?v=6Z1QE_FEW_A", mets: 5.0 },
  { name: "Seated Dumbbell Press", category: "Shoulders", youtubeUrl: "https://www.youtube.com/watch?v=B-aVuyhvLHU", mets: 5.5 },
  { name: "Upright Rows", category: "Shoulders", youtubeUrl: "https://www.youtube.com/watch?v=v_ZkxWzYnMc", mets: 4.5 },


  // Biceps
  { name: "Barbell Curls", category: "Biceps", youtubeUrl: "https://www.youtube.com/watch?v=kwG2ipFRgfo", mets: 4.5 },
  { name: "Dumbbell Hammer Curls", category: "Biceps", youtubeUrl: "https://www.youtube.com/watch?v=zC3nLlEvin4", mets: 4.0 },
  { name: "Concentration Curls", category: "Biceps", youtubeUrl: "https://www.youtube.com/watch?v=0AUGkch3tzc", mets: 3.5 },
  { name: "Preacher Curls (EZ Bar)", category: "Biceps", youtubeUrl: "https://www.youtube.com/watch?v=fIWP-FRFNU0", mets: 4.0 },
  { name: "Cable Curls (Straight Bar)", category: "Biceps", youtubeUrl: "https://www.youtube.com/watch?v=ktG_Q8_S8Ik", mets: 4.0 },
  { name: "Incline Dumbbell Curls", category: "Biceps", youtubeUrl: "https://www.youtube.com/watch?v=soxrZlIl35U", mets: 4.0 },

  // Triceps
  { name: "Close-Grip Bench Press", category: "Triceps", youtubeUrl: "https://www.youtube.com/watch?v=cXbSJHt2H4A", mets: 6.5 },
  { name: "Overhead Dumbbell Extension", category: "Triceps", youtubeUrl: "https://www.youtube.com/watch?v=3Q0nggLg34", mets: 4.5 }, // Note: URL had a space, corrected if it was a typo
  { name: "Triceps Pushdowns (Rope)", category: "Triceps", youtubeUrl: "https://www.youtube.com/watch?v=vB5OHQZxSkI", mets: 4.0 },
  { name: "Skullcrushers (Lying Triceps Ext.)", category: "Triceps", youtubeUrl: "https://www.youtube.com/watch?v=d_KZxkY_0cM", mets: 5.0 },
  { name: "Dips (Triceps Version)", category: "Triceps", youtubeUrl: "https://www.youtube.com/watch?v=0326dy_-CzM", mets: 7.0 },
  { name: "Tricep Kickbacks", category: "Triceps", youtubeUrl: "https://www.youtube.com/watch?v=6SS6K3lAwZ8", mets: 3.5 },
];

// Helper to get unique categories for Tabs
const uniqueCategories = Array.from(new Set(exerciseDatabase.map(ex => ex.category)));

// Define the type for an exercise in the database
type ExerciseDataItem = typeof exerciseDatabase[number];

// Helper function to convert YouTube watch URL to embed URL
const getYoutubeEmbedUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") {
      if (urlObj.pathname === "/watch") {
        const videoId = urlObj.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      } else if (urlObj.pathname.startsWith("/embed/")) {
        return url; // Already an embed URL
      }
    } else if (urlObj.hostname === "youtu.be") { // Handle shortened URLs
      const videoId = urlObj.pathname.substring(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  } catch (error) {
    // console.error("Invalid YouTube URL:", error); // Silencing for cleaner output in this context
    return null;
  }
  return null; // Not a recognized YouTube URL pattern
};

export function ExerciseManager({ workout, userProfile, onSave, onCancel }: ExerciseManagerProps) {
  const [exercises, setExercises] = useState<Exercise[]>(() =>
    workout.exercises.map(ex => ({
      ...ex,
      calories: calculateCaloriesBurned(ex, userProfile, ex.reps, ex.weight)
    }))
  );

  const addExercise = (exerciseData: ExerciseDataItem) => {
    if (exerciseData) {
      const defaultReps = 10;
      const defaultWeight = 0;
      const initialCalories = userProfile
        ? calculateCaloriesBurned(exerciseData, userProfile, defaultReps, defaultWeight)
        : 0;

      const newExercise: Exercise = {
        id: Date.now().toString(),
        name: exerciseData.name,
        category: exerciseData.category,
        youtubeUrl: exerciseData.youtubeUrl,
        mets: exerciseData.mets,
        reps: defaultReps,
        weight: defaultWeight,
        calories: initialCalories,
      }
      setExercises([...exercises, newExercise])
    }
  }

  const updateExercise = (id: string, field: keyof Exercise, value: string | number) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === id) {
          const updatedExercise = { ...ex, [field]: value };
          // Recalculate calories if reps or weight changed
          if ((field === "reps" || field === "weight") && userProfile) {
            updatedExercise.calories = calculateCaloriesBurned(
              updatedExercise, // Pass the exercise itself (which has mets)
              userProfile,
              updatedExercise.reps,
              updatedExercise.weight
            );
          }
          return updatedExercise;
        }
        return ex;
      })
    );
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
            <Tabs defaultValue={uniqueCategories[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                {uniqueCategories.map(category => (
                  <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                ))}
              </TabsList>
              {uniqueCategories.map(category => (
                <TabsContent key={category} value={category}>
                  <div className="space-y-2 pt-2">
                    {exerciseDatabase.filter(ex => ex.category === category).map(exercise => (
                      <div key={exercise.name} className="flex items-center justify-between p-2 border rounded-md">
                        <span>{exercise.name}</span>
                        <Button variant="outline" size="sm" onClick={() => addExercise(exercise)}>
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
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
                {/* YouTube Video Embed */}
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {(() => {
                    const embedUrl = getYoutubeEmbedUrl(exercise.youtubeUrl);
                    if (embedUrl) {
                      return (
                        <iframe
                          width="100%"
                          height="100%" // className="w-full h-full" could also be used if aspect-video is on parent
                          src={embedUrl}
                          title={exercise.name || "Exercise Video"}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full" // Ensure iframe takes full space of parent
                        ></iframe>
                      );
                    } else {
                      return <span className="text-gray-500 p-2">No video available or invalid URL</span>;
                    }
                  })()}
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
                {/* Display Calories */}
                <div className="pt-2">
                  <p className="text-sm text-gray-700">
                    Estimated Calories Burned:{" "}
                    <span className="font-semibold">
                      {exercise.calories?.toFixed(0) ?? 'N/A'}
                    </span>
                  </p>
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
