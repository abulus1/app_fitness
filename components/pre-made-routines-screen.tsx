"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ListChecks } from "lucide-react"

export function PreMadeRoutinesScreen() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <ListChecks className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Pre-Made Routines</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Explore a library of expertly crafted workout routines.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <div className="text-center">
            <p className="text-xl text-gray-700">Coming soon!</p>
            <p className="mt-2 text-gray-500">
              Discover a variety of workout plans designed by fitness experts for different goals,
              experience levels, and available equipment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
