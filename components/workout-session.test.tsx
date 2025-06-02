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
      { id: "ex1", name: "Push-ups", category: "Chest", reps: 10, weight: 0, youtubeUrl: "", metsValue: 3.8 },
      { id: "ex2", name: "Squats", category: "Legs", reps: 12, weight: 20, youtubeUrl: "", metsValue: 5.0 },
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
    // For "Push-ups" (ex1): reps=10, metsValue=3.8. Duration = (10*3)/60 = 0.5 min. Calories = (3.8 * 70 * 3.5) / 200 * 0.5 = 2.3275 => 2
    // For "Squats" (ex2): reps=12, metsValue=5.0. Duration = (12*3)/60 = 0.6 min. Calories = (5.0 * 70 * 3.5) / 200 * 0.6 = 3.675 => 4
    // Total expected calories = 2 + 4 = 6
    expect(actualRecord.caloriesBurned).toBe(6); 
  })

  test("calls onComplete with partial data (0 calories if no exercises completed) when header back button is clicked", () => {
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
    expect(actualRecord.caloriesBurned).toBe(0); 
  })

  describe("Calorie Calculation in UI and onComplete", () => {
    test("calculates and sums calories correctly for multiple completed exercises with METS values", () => {
      render(<WorkoutSession workout={mockWorkout} userProfile={mockUserProfile} onComplete={mockOnComplete} />);
      
      // Complete both exercises
      fireEvent.click(screen.getAllByRole("button", { name: /mark complete/i })[0]); // Complete Push-ups
      fireEvent.click(screen.getAllByRole("button", { name: /mark complete/i })[0]); // Complete Squats
      
      // Check UI display of total calories
      // Push-ups: (3.8 * 70 * 3.5) / 200 * ((10*3)/60) = 2.3275 ~ 2
      // Squats:   (5.0 * 70 * 3.5) / 200 * ((12*3)/60) = 3.675 ~ 4
      // Total = 6
      expect(screen.getByText("6 calories")).toBeInTheDocument();

      // Check calories in onComplete record
      fireEvent.click(screen.getByRole("button", { name: /finish workout/i }));
      const actualRecord = mockOnComplete.mock.calls[0][0] as WorkoutRecord;
      expect(actualRecord.caloriesBurned).toBe(6);
    });

    test("calculates 0 calories for an exercise if metsValue is missing or zero", () => {
      const workoutWithMissingMets: DayWorkout = {
        day: "Test Day",
        exercises: [
          { id: "ex1", name: "Push-ups", category: "Chest", reps: 10, weight: 0, youtubeUrl: "", metsValue: 3.8 },
          { id: "ex3", name: "Walking", category: "Cardio", reps: 10, weight: 0, youtubeUrl: "" }, // No metsValue
          { id: "ex4", name: "Jogging", category: "Cardio", reps: 10, weight: 0, youtubeUrl: "", metsValue: 0 }, // metsValue is 0
        ],
      };
      render(<WorkoutSession workout={workoutWithMissingMets} userProfile={mockUserProfile} onComplete={mockOnComplete} />);
      
      // Complete all exercises
      fireEvent.click(screen.getAllByRole("button", { name: /mark complete/i })[0]); // Push-ups
      fireEvent.click(screen.getAllByRole("button", { name: /mark complete/i })[0]); // Walking
      fireEvent.click(screen.getAllByRole("button", { name: /mark complete/i })[0]); // Jogging
      
      // Expected calories only from Push-ups: (3.8 * 70 * 3.5) / 200 * ((10*3)/60) = 2.3275 ~ 2
      expect(screen.getByText("2 calories")).toBeInTheDocument(); // UI Check

      fireEvent.click(screen.getByRole("button", { name: /finish workout/i }));
      const actualRecord = mockOnComplete.mock.calls[0][0] as WorkoutRecord;
      expect(actualRecord.caloriesBurned).toBe(2); // onComplete check
    });

    test("UI displays individual exercise calories correctly", () => {
      render(<WorkoutSession workout={mockWorkout} userProfile={mockUserProfile} onComplete={mockOnComplete} />);
      // For Push-ups (first exercise): (3.8 * 70 * 3.5) / 200 * ((10*3)/60) = 2.3275 ~ 2
      // The text is split across elements, so we find a parent or use a regex.
      // The calorie display is within a div with other details.
      // Example: <p className="text-2xl font-bold">2</p> <p className="text-sm text-gray-600">cal</p>
      // We can check for the number 2 specifically if it's distinct enough.
      // Let's find the 'cal' text and check its preceding sibling or parent content.
      const calElements = screen.getAllByText("cal"); // Gets all elements with text "cal"
      // Assuming the current exercise display is the one with the detailed breakdown
      // Push-ups: 2 calories
      expect(calElements[0].previousElementSibling?.textContent).toBe("2");


      // Navigate to the next exercise (Squats)
      // There isn't a direct "next" button, user clicks on the exercise in the list.
      // Let's assume Squats is now the currentExercise by clicking it in the list if needed,
      // or by completing the first one.
      fireEvent.click(screen.getAllByRole("button", { name: /mark complete/i })[0]); // Complete Push-ups, currentExercise becomes Squats

      // Squats: (5.0 * 70 * 3.5) / 200 * ((12*3)/60) = 3.675 ~ 4
      // Re-query for calorie display as component re-renders
      const updatedCalElements = screen.getAllByText("cal");
      expect(updatedCalElements[0].previousElementSibling?.textContent).toBe("4");
    });
  });
})
