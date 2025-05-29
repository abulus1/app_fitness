import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define types for the function parameters inline for clarity if not already globally defined
// For this exercise, we'll assume Exercise and UserProfile types might be more complex elsewhere,
// but for this function, we only care about specific properties.

interface ExerciseWithMets {
  mets?: number; // METS value for the exercise
  // other exercise properties like name, category, etc., could be here
}

interface UserProfileForCalories {
  weight: number; // User's body weight in kg
  // other user profile properties like name, age, etc., could be here
}

/**
 * Calculates the estimated calories burned during an exercise session.
 *
 * @param exercise An object containing exercise details, specifically the METS value.
 * @param userProfile An object containing user profile details, specifically their weight in kg.
 * @param reps The number of repetitions performed.
 * @param weightUsed The weight used for the exercise in kg (currently not used in the primary formula but available for future enhancements).
 * @returns The estimated number of calories burned. Returns 0 if METS value is not available or is 0.
 */
export function calculateCaloriesBurned(
  exercise: ExerciseWithMets,
  userProfile: UserProfileForCalories,
  reps: number,
  weightUsed: number // Parameter included for future use
): number {
  // If METS value is missing or 0, return 0 calories.
  if (!exercise.mets || exercise.mets <= 0) {
    return 0
  }

  // Assume each repetition takes approximately 3 seconds.
  // Calculate duration in hours: (reps * seconds_per_rep) / seconds_per_hour
  const durationInHours = (reps * 3) / 3600

  // Primary formula for calorie calculation:
  // Calories = METS * Body Weight (kg) * Duration (hours)
  const calories = exercise.mets * userProfile.weight * durationInHours

  return calories
}

/*
// Example Usage:

// 1. Exercise with METS, user weighs 70kg, 15 reps
const exercise1 = { mets: 8 }; // e.g., Vigorous push-ups
const user1 = { weight: 70 }; // 70kg
const reps1 = 15;
const weightUsed1 = 0; // Bodyweight exercise
const calories1 = calculateCaloriesBurned(exercise1, user1, reps1, weightUsed1);
// Expected: (8 * 70 * (15 * 3 / 3600)) = (8 * 70 * (45 / 3600)) = (8 * 70 * 0.0125) = 7 calories
console.log(`Example 1: METS=8, Weight=70kg, Reps=15 -> Calories: ${calories1}`); // Should be 7

// 2. Exercise with METS, user weighs 60kg, 100 reps (e.g., lighter cardio)
const exercise2 = { mets: 3.5 }; // e.g., Light calisthenics
const user2 = { weight: 60 }; // 60kg
const reps2 = 100;
const weightUsed2 = 0;
const calories2 = calculateCaloriesBurned(exercise2, user2, reps2, weightUsed2);
// Expected: (3.5 * 60 * (100 * 3 / 3600)) = (3.5 * 60 * (300 / 3600)) = (3.5 * 60 * 0.083333) approx 17.5 calories
console.log(`Example 2: METS=3.5, Weight=60kg, Reps=100 -> Calories: ${calories2}`); // Should be approx 17.5

// 3. Exercise with no METS value
const exercise3 = { mets: 0 };
const user3 = { weight: 75 }; // 75kg
const reps3 = 20;
const weightUsed3 = 10; // 10kg dumbbells
const calories3 = calculateCaloriesBurned(exercise3, user3, reps3, weightUsed3);
console.log(`Example 3: METS=0 -> Calories: ${calories3}`); // Should be 0

// 4. Exercise with missing METS property
const exercise4 = {}; // No mets property
const user4 = { weight: 80 }; // 80kg
const reps4 = 12;
const weightUsed4 = 0;
const calories4 = calculateCaloriesBurned(exercise4, user4, reps4, weightUsed4);
console.log(`Example 4: Missing METS -> Calories: ${calories4}`); // Should be 0

// 5. Higher METS, higher reps
const exercise5 = { mets: 6 }; // e.g., Bench Press
const user5 = { weight: 85 }; // 85kg
const reps5 = 50; // e.g. 5 sets of 10 reps
const weightUsed5 = 60; // 60kg on bench
const calories5 = calculateCaloriesBurned(exercise5, user5, reps5, weightUsed5);
// Expected: (6 * 85 * (50 * 3 / 3600)) = (6 * 85 * (150 / 3600)) = (6 * 85 * 0.041666) approx 21.25 calories
console.log(`Example 5: METS=6, Weight=85kg, Reps=50 -> Calories: ${calories5}`); // Should be approx 21.25
*/
