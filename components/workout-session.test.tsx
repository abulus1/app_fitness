import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import { WorkoutSession } from "./workout-session"
import type { UserProfile, DayWorkout, WorkoutRecord } from "@/app/page" // Assuming types are exported from here

// Mock new Date().toISOString() to return a fixed date for snapshots/assertions
const mockDate = "2024-03-15T10:00:00.000Z"
jest.spyOn(global, "Date").mockImplementation(() => new Date(mockDate) as any)


describe("WorkoutSession Component", () => {
  const mockUserProfile: UserProfile = {
    name: "Test User",
    email: "test@example.com",
    age: 30,
    gender: "male",
    weight: 70, // For calorie calculation
    height: 175,
    activityLevel: "moderate",
    fitnessGoals: ["get stronger"],
    role: "user",
    membershipType: "trial",
    workoutHistory: [],
    password: "password123", // Added password
  }

  const mockWorkout: DayWorkout = {
    day: "Monday",
    exercises: [
      { id: "ex1", name: "Push-ups", category: "Chest", reps: 10, weight: 0, youtubeUrl: "" },
      { id: "ex2", name: "Squats", category: "Legs", reps: 12, weight: 20, youtubeUrl: "" },
    ],
  }

  const mockOnComplete = jest.fn()

  beforeEach(() => {
    mockOnComplete.mockClear()
    // Reset Date mock if needed, though for fixed date it's fine
  })

  test("calls onComplete with workout data when 'Finish Workout' is clicked", async () => {
    render(<WorkoutSession workout={mockWorkout} userProfile={mockUserProfile} onComplete={mockOnComplete} />)

    // Simulate completing all exercises
    // Click "Mark Complete" for first exercise
    const markCompleteButtons = screen.getAllByRole("button", { name: /mark complete/i })
    expect(markCompleteButtons.length).toBe(1) // Only one is active at a time
    fireEvent.click(markCompleteButtons[0])
    
    // After 1st exercise, the button for 2nd exercise should appear
    const markCompleteButtonsAfterFirst = screen.getAllByRole("button", { name: /mark complete/i })
    expect(markCompleteButtonsAfterFirst.length).toBe(1)
    fireEvent.click(markCompleteButtonsAfterFirst[0])

    // Now the "Finish Workout" button should be visible
    const finishWorkoutButton = screen.getByRole("button", { name: /finish workout/i })
    expect(finishWorkoutButton).toBeInTheDocument()

    // Mock sessionTime - advance timers
    // The sessionTime is an internal state updated by setInterval.
    // We need to use jest.advanceTimersByTime after enabling fake timers.
    jest.useFakeTimers()
    act(() => {
      jest.advanceTimersByTime(5 * 60 * 1000); // Advance by 5 minutes (300 seconds)
    });
    
    fireEvent.click(finishWorkoutButton)
    jest.useRealTimers()


    expect(mockOnComplete).toHaveBeenCalledTimes(1)
    const expectedRecord: Partial<WorkoutRecord> = {
      date: mockDate,
      duration: 5, // 5 minutes from advanced timer
      exercisesPerformed: mockWorkout.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        reps: ex.reps,
        weight: ex.weight,
      })),
      // caloriesBurned will be calculated by the component, so we check if it exists
    }
    
    const actualRecord = mockOnComplete.mock.calls[0][0] as WorkoutRecord;
    expect(actualRecord.date).toEqual(expectedRecord.date)
    expect(actualRecord.duration).toEqual(expectedRecord.duration)
    expect(actualRecord.exercisesPerformed).toEqual(expectedRecord.exercisesPerformed)
    expect(actualRecord.caloriesBurned).toBeDefined() // Check if caloriesBurned is calculated
    // Example calorie check (highly dependent on the internal calculateCalories function)
    // For "Push-ups": 0.5 * 10 * (70/70) * 1 = 5
    // For "Squats": 0.6 * 12 * (70/70) * (1 + 20/50) = 0.6 * 12 * 1.4 = 7.2 * 1.4 = 10.08 ~ 10
    // Total expected calories = 5 + 10 = 15 (if rounding occurs as in component)
    expect(actualRecord.caloriesBurned).toBe(15); // This is an example, needs exact matching with component's logic
  })

  test("calls onComplete with partial data when header back button is clicked", () => {
    render(<WorkoutSession workout={mockWorkout} userProfile={mockUserProfile} onComplete={mockOnComplete} />)
    
    jest.useFakeTimers()
    act(() => {
      jest.advanceTimersByTime(2 * 60 * 1000); // Advance by 2 minutes (120 seconds)
    });

    const backButton = screen.getAllByRole("button")[0] // First button in header is back
    fireEvent.click(backButton)
    jest.useRealTimers()

    expect(mockOnComplete).toHaveBeenCalledTimes(1)
    const actualRecord = mockOnComplete.mock.calls[0][0] as WorkoutRecord;

    expect(actualRecord.date).toEqual(mockDate)
    expect(actualRecord.duration).toEqual(2) // 2 minutes
    expect(actualRecord.exercisesPerformed).toEqual(mockWorkout.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        reps: ex.reps,
        weight: ex.weight,
      })))
    // Calories burned will be 0 if no exercises were marked complete
    expect(actualRecord.caloriesBurned).toBe(0) 
  })
})
