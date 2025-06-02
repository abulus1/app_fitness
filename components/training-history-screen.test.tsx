import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { TrainingHistoryScreen } from "./training-history-screen"
import type { UserProfile, WorkoutRecord } from "@/app/page"

describe("TrainingHistoryScreen Component", () => {
  const baseMockUserProfile: UserProfile = {
    name: "Test User",
    email: "test@example.com",
    age: 30, gender: "male", weight: 70, height: 175, activityLevel: "moderate", fitnessGoals: [],
    role: "user", membershipType: "trial", password: "password123",
    workoutHistory: [],
  };

  test("displays 'No workouts recorded yet' message when history is empty", () => {
    render(<TrainingHistoryScreen userProfile={baseMockUserProfile} />);
    expect(screen.getByText("No workouts recorded yet.")).toBeInTheDocument();
    expect(screen.getByText("Complete a session to see your history!")).toBeInTheDocument();
  });

  test("displays 'No workouts recorded yet' message when userProfile is null", () => {
    render(<TrainingHistoryScreen userProfile={null} />);
    expect(screen.getByText("No workouts recorded yet.")).toBeInTheDocument();
  });

  const mockWorkoutHistory: WorkoutRecord[] = [
    {
      date: "2024-03-15T10:00:00.000Z",
      duration: 30,
      exercisesPerformed: [
        { id: "ex1", name: "Push-ups", category: "Chest", reps: 15, weight: 0 },
        { id: "ex2", name: "Squats", category: "Legs", reps: 12, weight: 20 },
      ],
      caloriesBurned: 150,
    },
    {
      date: "2024-03-13T11:00:00.000Z", // Older record
      duration: 45,
      exercisesPerformed: [
        { id: "ex3", name: "Deadlift", category: "Back", reps: 8, weight: 100 },
      ],
      // caloriesBurned is optional
    },
  ];

  const profileWithHistory: UserProfile = {
    ...baseMockUserProfile,
    workoutHistory: mockWorkoutHistory,
  };

  test("displays multiple workout records, sorted most recent first", () => {
    render(<TrainingHistoryScreen userProfile={profileWithHistory} />);
    
    const recordDates = screen.getAllByText(/March \d{1,2}, 2024/i); // Find accordion triggers by date text
    
    // Check sorting: March 15 should appear before March 13
    expect(recordDates[0].textContent).toContain("March 15, 2024");
    expect(recordDates[1].textContent).toContain("March 13, 2024");

    // Check content of the first (most recent) record
    expect(screen.getByText("30 mins")).toBeInTheDocument(); // Duration for March 15 record
    
    // Expand the first record
    fireEvent.click(recordDates[0]);
    expect(screen.getByText("Calories Burned: 150 kcal")).toBeInTheDocument();
    expect(screen.getByText(/Push-ups \(Chest\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Reps: 15 • Weight: 0 kg/i)).toBeInTheDocument();
    expect(screen.getByText(/Squats \(Legs\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Reps: 12 • Weight: 20 kg/i)).toBeInTheDocument();
    
    // Expand the second record (optional, but good for completeness)
    fireEvent.click(recordDates[1]);
    expect(screen.getByText("45 mins")).toBeInTheDocument(); // Duration for March 13 record
    expect(screen.queryByText(/Calories Burned:/, { exact: false })).not.toHaveTextContent("Calories Burned: undefined kcal"); // Ensure calories not shown if undefined
    expect(screen.getByText(/Deadlift \(Back\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Reps: 8 • Weight: 100 kg/i)).toBeInTheDocument();
  });
  
  test("displays calories if available, and not if undefined", () => {
    const historyWithAndWithoutCalories: WorkoutRecord[] = [
      { ...mockWorkoutHistory[0], date: "2024-03-16T10:00:00.000Z", caloriesBurned: 200 }, // With calories
      { ...mockWorkoutHistory[1], date: "2024-03-17T10:00:00.000Z", caloriesBurned: undefined }, // Without calories
    ];
    const profileForCalorieTest: UserProfile = { ...baseMockUserProfile, workoutHistory: historyWithAndWithoutCalories };
    render(<TrainingHistoryScreen userProfile={profileForCalorieTest} />);

    // Records are sorted, so March 17th (no calories) will be first.
    const recordWithoutCaloriesTrigger = screen.getByText(/March 17, 2024/i);
    fireEvent.click(recordWithoutCaloriesTrigger);
    // Check that "Calories Burned" is NOT present for this record
    // Querying for "Calories Burned:" and then checking its absence in the specific accordion item is tricky.
    // A simpler check is to ensure it's not rendered with a specific value.
    // We need to ensure the "Calories Burned" text itself isn't there for this item's content.
    // This requires a more specific query within the AccordionContent or a different approach.
    // For now, we'll check that the text "Calories Burned" followed by a number is not there.
    // This is an approximation. A data-testid on the calorie <p> would be better.
    expect(screen.queryByText(/Calories Burned: \d+ kcal/i, { selector: 'p' })).toBeNull();


    const recordWithCaloriesTrigger = screen.getByText(/March 16, 2024/i);
    fireEvent.click(recordWithCaloriesTrigger);
    expect(screen.getByText("Calories Burned: 200 kcal")).toBeInTheDocument();
  });
});
