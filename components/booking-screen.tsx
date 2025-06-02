"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarCheck } from "lucide-react"

export function BookingScreen() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <CalendarCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Booking & Reservations</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Plan and book your workout sessions or classes here.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <div className="text-center">
            <p className="text-xl text-gray-700">This feature is coming soon!</p>
            <p className="mt-2 text-gray-500">
              Soon you'll be able to reserve your spot in group classes, book personal training sessions,
              and manage your appointments with ease.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
