"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PlusSquare } from "lucide-react"

export function CreateRoutineScreen() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <PlusSquare className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Create Your Workout Routine</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Build and customize your own workout routines.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <div className="text-center">
            <p className="text-xl text-gray-700">This tool is under development.</p>
            <p className="mt-2 text-gray-500">
              Soon you'll be able to design personalized workout plans tailored to your fitness goals,
              select exercises, define sets/reps, and schedule your training.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
