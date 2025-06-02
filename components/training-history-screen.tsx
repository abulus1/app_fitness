"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { History } from "lucide-react"
import type { UserProfile, WorkoutRecord } from "@/app/page" // Import types
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion" // Import Accordion components

interface TrainingHistoryScreenProps {
  userProfile: UserProfile | null;
}

export function TrainingHistoryScreen({ userProfile }: TrainingHistoryScreenProps) {
  const workoutHistory = userProfile?.workoutHistory || [];
  
  // Sort history to show most recent first
  const sortedHistory = [...workoutHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <History className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Training History</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Review your past workouts and track your progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          {sortedHistory.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-3">
              {sortedHistory.map((record, index) => (
                <AccordionItem value={`item-${index}`} key={record.date + index} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <AccordionTrigger className="p-4 hover:bg-gray-50 rounded-t-lg">
                    <div className="flex justify-between w-full items-center">
                      <span className="font-semibold text-lg text-gray-700">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                      <span className="text-sm text-gray-500">{record.duration} mins</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 border-t border-gray-200">
                    {record.caloriesBurned != null && ( // Check for null or undefined
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Calories Burned:</strong> {record.caloriesBurned} kcal
                      </p>
                    )}
                    <h4 className="font-semibold text-md mb-2 text-gray-700">Exercises Performed:</h4>
                    <ul className="space-y-2">
                      {record.exercisesPerformed.map((exercise, exIndex) => (
                        <li key={exIndex} className="text-sm p-3 bg-gray-50 rounded-md border border-gray-100">
                          <strong className="text-gray-800">{exercise.name}</strong> ({exercise.category})
                          <div className="text-xs text-gray-500 mt-1">
                            Reps: {exercise.reps} • Weight: {exercise.weight} kg
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <p className="text-xl text-gray-700">No workouts recorded yet.</p>
              <p className="mt-2 text-gray-500">Complete a session to see your history!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
