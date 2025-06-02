import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define types for the function parameters inline for clarity if not already globally defined
// For this exercise, we'll assume Exercise and UserProfile types might be more complex elsewhere,
// but for this function, we only care about specific properties.

interface ExerciseForCalorieCalc {
  metsValue?: number; // METS value for the exercise
}

/**
 * Calculates the estimated calories burned during an exercise.
 * Formula: (METS × Body Weight in kg × 3.5) / 200 × Duration in minutes
 *
 * @param exercise An object containing exercise details, specifically the METS value.
 * @param weightKg User's body weight in kg.
 * @param durationMinutes The duration of the exercise in minutes.
 * @returns The estimated number of calories burned. Returns 0 if METS value is not available or is 0, or if duration is 0.
 */
export function calculateCaloriesBurned(
  exercise: ExerciseForCalorieCalc,
  weightKg: number,
  durationMinutes: number
): number {
  if (!exercise.metsValue || exercise.metsValue <= 0 || durationMinutes <= 0 || weightKg <= 0) {
    return 0;
  }

  const calories = (exercise.metsValue * weightKg * 3.5) / 200 * durationMinutes;
  
  return Math.round(calories); // Often good to return whole numbers for calories
}

/*
// Example Usage Updated:

// 1. Exercise with METS, user weighs 70kg, duration 10 minutes
const exercise1 = { metsValue: 8 }; 
const weight1 = 70; // 70kg
const duration1 = 10; // minutes
const calories1 = calculateCaloriesBurned(exercise1, weight1, duration1);
// Expected: (8 * 70 * 3.5) / 200 * 10 = (1960) / 200 * 10 = 9.8 * 10 = 98 calories
console.log(`Example 1: METS=8, Weight=70kg, Duration=10min -> Calories: ${calories1}`);

// 2. Exercise with METS, user weighs 60kg, duration 30 minutes
const exercise2 = { metsValue: 3.5 }; 
const weight2 = 60; // 60kg
const duration2 = 30; // minutes
const calories2 = calculateCaloriesBurned(exercise2, weight2, duration2);
// Expected: (3.5 * 60 * 3.5) / 200 * 30 = (735) / 200 * 30 = 3.675 * 30 = 110.25 calories -> rounded to 110
console.log(`Example 2: METS=3.5, Weight=60kg, Duration=30min -> Calories: ${calories2}`);

// 3. Exercise with no METS value
const exercise3 = { metsValue: 0 };
const weight3 = 75; 
const duration3 = 20;
const calories3 = calculateCaloriesBurned(exercise3, weight3, duration3);
console.log(`Example 3: METS=0 -> Calories: ${calories3}`); // Should be 0

// 4. Exercise with missing METS property
const exercise4 = {}; 
const weight4 = 80; 
const duration4 = 12;
const calories4 = calculateCaloriesBurned(exercise4, weight4, duration4);
console.log(`Example 4: Missing METS -> Calories: ${calories4}`); // Should be 0

// 5. Higher METS, duration
const exercise5 = { metsValue: 6 }; 
const weight5 = 85; 
const duration5 = 25; 
const calories5 = calculateCaloriesBurned(exercise5, weight5, duration5);
// Expected: (6 * 85 * 3.5) / 200 * 25 = (1785) / 200 * 25 = 8.925 * 25 = 223.125 -> rounded to 223
console.log(`Example 5: METS=6, Weight=85kg, Duration=25min -> Calories: ${calories5}`);
*/
