"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { DayWorkout, Exercise, UserProfile } from "@/app/page"
import { ArrowLeft, CheckCircle, Timer, Flame } from "lucide-react"
import { calculateCaloriesBurned } from "@/lib/utils" // Import the new calorie calculation utility
// VideoPlaceholderIcon can be replaced with an actual icon like Video from lucide-react if desired
// For now, using the img tag with placeholder.svg as in ExerciseManager

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

// Helper function to convert YouTube watch URL to embed URL (copied from ExerciseManager)
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
    // console.error("Invalid YouTube URL:", error);
    return null;
  }
  return null;
};

interface ExerciseVideoPlayerProps {
  youtubeUrl: string | undefined;
  exerciseName: string | undefined;
}

const ExerciseVideoPlayer: React.FC<ExerciseVideoPlayerProps> = ({ youtubeUrl, exerciseName }) => {
  const [videoError, setVideoError] = useState(false);
  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);

  useEffect(() => {
    setVideoError(false);
  }, [youtubeUrl]);

  if (videoError || !embedUrl) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '0.5rem' }}>
        <img src="/placeholder.svg" alt="Video unavailable" style={{ width: '50px', height: '50px', marginBottom: '10px' }} />
        <p style={{ color: '#555', textAlign: 'center', padding: '0 10px' }}>Video currently unavailable.</p>
      </div>
    );
  }

  return (
    <iframe
      width="100%"
      height="100%"
      src={embedUrl}
      title={exerciseName || "Exercise Video"}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="w-full h-full"
      onError={() => setVideoError(true)}
    />
  );
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
    
    let totalCaloriesBurnedForSession = 0;
    const finalExercisesPerformed = workout.exercises
      .filter(ex => isFullyCompleted || completedExercises.includes(ex.id)) // Process only relevant exercises
      .map(ex => {
        const durationMinutes = getExerciseDurationMinutes(ex.reps);
        const calories = calculateCaloriesBurned(ex, userProfile.weight, durationMinutes);
        totalCaloriesBurnedForSession += calories;
        return {
          id: ex.id,
          name: ex.name,
          category: ex.category,
          reps: ex.reps,
          weight: ex.weight,
          durationMinutes: durationMinutes,
          caloriesBurned: calories,
          metsValue: ex.metsValue,
        };
      });

    // If not fully completed, recalculate total calories based on *actually processed* exercises in finalExercisesPerformed
    // This might be redundant if the filter + map logic for totalCaloriesBurnedForSession is already correct.
    // Let's ensure totalCaloriesBurnedForSession is purely from the exercises included in finalExercisesPerformed.
    // The current map().reduce() on totalCaloriesBurnedForSession within the map itself is correct.
    
    // If workout is exited early, totalCaloriesBurnedForSession should reflect only completed exercises.
    // The logic for totalCaloriesBurnedForSession needs to be accurate for both full and partial completion.
    // The current `totalCaloriesBurnedForSession += calories` inside the map handles this correctly
    // as `finalExercisesPerformed` is already filtered.

    // The old logic for totalCaloriesBurnedForSession:
    // let totalCaloriesBurnedForSession = 0;
    // workout.exercises.forEach(exercise => {
    //   if (completedExercises.includes(exercise.id) || isFullyCompleted) {
    //     const exerciseDurationMinutes = getExerciseDurationMinutes(exercise.reps);
    //     totalCaloriesBurnedForSession += calculateCaloriesBurned(exercise, userProfile.weight, exerciseDurationMinutes);
    //   }
    // });
    // This old logic is fine, but the new one sums it up while building finalExercisesPerformed.

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
                {/* Video Player */}
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  <ExerciseVideoPlayer youtubeUrl={currentExercise.youtubeUrl} exerciseName={currentExercise.name} />
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
