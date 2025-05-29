import { calculateCaloriesBurned } from './utils';

describe('calculateCaloriesBurned', () => {
  // Mock UserProfile and Exercise types for testing, similar to how they are defined in the function itself
  interface ExerciseWithMets {
    mets?: number;
  }

  interface UserProfileForCalories {
    weight: number;
  }

  // Test Case 1: Valid Inputs (Standard)
  test('should correctly calculate calories for valid inputs (case 1)', () => {
    const exercise: ExerciseWithMets = { mets: 5 };
    const userProfile: UserProfileForCalories = { weight: 70 }; // kg
    const reps = 10;
    const weightUsed = 0; // Not used in current formula
    // Expected: (5 METS * 70 kg * (10 reps * 3 sec/rep / 3600 sec/hr))
    // = 350 * (30 / 3600) = 350 * 0.0083333... = 2.91666...
    expect(calculateCaloriesBurned(exercise, userProfile, reps, weightUsed)).toBeCloseTo(2.91666);
  });

  // Test Case 2: Valid Inputs (Different values)
  test('should correctly calculate calories for valid inputs (case 2)', () => {
    const exercise: ExerciseWithMets = { mets: 8 };
    const userProfile: UserProfileForCalories = { weight: 60 }; // kg
    const reps = 12;
    const weightUsed = 0;
    // Expected: (8 METS * 60 kg * (12 reps * 3 sec/rep / 3600 sec/hr))
    // = 480 * (36 / 3600) = 480 * 0.01 = 4.8
    expect(calculateCaloriesBurned(exercise, userProfile, reps, weightUsed)).toBeCloseTo(4.8);
  });

  // Test Case 3: Edge Case - METS value is 0
  test('should return 0 calories if METS is 0', () => {
    const exercise: ExerciseWithMets = { mets: 0 };
    const userProfile: UserProfileForCalories = { weight: 70 };
    const reps = 10;
    const weightUsed = 0;
    expect(calculateCaloriesBurned(exercise, userProfile, reps, weightUsed)).toBe(0);
  });

  // Test Case 4: Edge Case - METS value is undefined
  test('should return 0 calories if METS is undefined', () => {
    const exercise: ExerciseWithMets = {}; // mets is undefined
    const userProfile: UserProfileForCalories = { weight: 70 };
    const reps = 10;
    const weightUsed = 0;
    expect(calculateCaloriesBurned(exercise, userProfile, reps, weightUsed)).toBe(0);
  });

  // Test Case 5: Edge Case - Reps are 0
  test('should return 0 calories if reps are 0', () => {
    const exercise: ExerciseWithMets = { mets: 5 };
    const userProfile: UserProfileForCalories = { weight: 70 };
    const reps = 0;
    const weightUsed = 0;
    // Expected: (5 * 70 * (0 * 3 / 3600)) = (5 * 70 * 0) = 0
    expect(calculateCaloriesBurned(exercise, userProfile, reps, weightUsed)).toBe(0);
  });

  // Test Case 6: Edge Case - User weight is 0
  test('should return 0 calories if user weight is 0', () => {
    const exercise: ExerciseWithMets = { mets: 5 };
    const userProfile: UserProfileForCalories = { weight: 0 };
    const reps = 10;
    const weightUsed = 0;
    // Expected: (5 * 0 * (10 * 3 / 3600)) = 0
    expect(calculateCaloriesBurned(exercise, userProfile, reps, weightUsed)).toBe(0);
  });

  // Additional test: Negative METS (should ideally be handled, returns 0 if <=0)
  test('should return 0 calories if METS is negative', () => {
    const exercise: ExerciseWithMets = { mets: -2 };
    const userProfile: UserProfileForCalories = { weight: 70 };
    const reps = 10;
    const weightUsed = 0;
    expect(calculateCaloriesBurned(exercise, userProfile, reps, weightUsed)).toBe(0);
  });
});
