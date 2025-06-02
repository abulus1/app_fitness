import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { ProfileScreen } from "./profile-screen"
import type { UserProfile, WorkoutRecord } from "@/app/page" // Import WorkoutRecord

// Mock Accordion components if they have complex internal state or animations not relevant to testing ProfileScreen logic
// For now, assume they render content correctly when open.
// jest.mock("@/components/ui/accordion", () => ({
//   Accordion: ({ children, ...props }: any) => <div {...props}>{children}</div>,
//   AccordionItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
//   AccordionTrigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
//   AccordionContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
// }))


describe("ProfileScreen Component", () => {
  const baseMockUserProfile: UserProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    age: 32,
    gender: "male",
    weight: 80,
    height: 180,
    activityLevel: "active",
    fitnessGoals: ["gain muscle", "increase endurance"],
    role: "user",
    membershipType: "trial",
    workoutHistory: [],
  }

  const mockOnBackToPlanner = jest.fn();
  const mockOnLogout = jest.fn();
  const mockOnUpdateUserProfile = jest.fn();

  interface RenderOptions {
    profile: UserProfile;
    loggedInRole?: "admin" | "user";
    isOwnProfile?: boolean;
    onUpdate?: (updatedProfile: UserProfile) => void;
  }

  // Helper function to render the component with specific context
  const renderProfileScreen = ({
    profile,
    loggedInRole = "user",
    isOwnProfile = true,
    onUpdate = mockOnUpdateUserProfile,
  }: RenderOptions) => {
    return render(
      <ProfileScreen
        userProfile={profile}
        onBackToPlanner={mockOnBackToPlanner}
        onLogout={mockOnLogout}
        loggedInUserRole={loggedInRole}
        isEditingOwnProfile={isOwnProfile}
        onUpdateUserProfile={onUpdate}
      />
    );
  };

  beforeEach(() => {
    mockOnBackToPlanner.mockClear();
    mockOnLogout.mockClear();
    mockOnUpdateUserProfile.mockClear();
  })

  test("renders user profile information correctly in view mode", () => {
    renderProfileScreen({ profile: baseMockUserProfile });
    expect(screen.getByText("User Profile")).toBeInTheDocument();
    expect(screen.getByText(baseMockUserProfile.name)).toBeInTheDocument();
    expect(screen.getByText(baseMockUserProfile.email)).toBeInTheDocument()
    expect(screen.getByText(baseMockUserProfile.age.toString())).toBeInTheDocument()
    expect(screen.getByText(baseMockUserProfile.gender)).toBeInTheDocument()
    expect(screen.getByText(`${baseMockUserProfile.weight} kg`)).toBeInTheDocument()
    expect(screen.getByText(`${baseMockUserProfile.height} cm`)).toBeInTheDocument()
    expect(screen.getByText(baseMockUserProfile.activityLevel)).toBeInTheDocument()
    baseMockUserProfile.fitnessGoals.forEach((goal) => {
      expect(screen.getByText(goal)).toBeInTheDocument()
    })
  })

  test("renders membership type correctly in view mode", () => {
    renderProfileScreen({ profile: baseMockUserProfile });
    expect(screen.getByText("Membership Type:")).toBeInTheDocument();
    expect(screen.getByText(baseMockUserProfile.membershipType.charAt(0).toUpperCase() + baseMockUserProfile.membershipType.slice(1))).toBeInTheDocument();
  });

  test("renders 'Progress Stats: Check back later!' placeholder", () => {
    renderProfileScreen({ profile: baseMockUserProfile });
    expect(screen.getByText("Progress Stats")).toBeInTheDocument();
    expect(screen.getByText("Check back later!")).toBeInTheDocument();
  });

  describe("Workout History Display (View Mode)", () => {
    test("displays 'No workouts recorded yet.' when workoutHistory is empty", () => {
      renderProfileScreen({ profile: baseMockUserProfile }); // baseMockUserProfile has empty workoutHistory
      expect(screen.getByText("Workout History")).toBeInTheDocument();
      expect(screen.getByText("No workouts recorded yet.")).toBeInTheDocument();
    })

    test("displays 'No workouts recorded yet.' when workoutHistory is undefined", () => {
      const profileWithUndefinedHistory = { ...baseMockUserProfile, workoutHistory: undefined as any };
      renderProfileScreen({ profile: profileWithUndefinedHistory });
      expect(screen.getByText("Workout History")).toBeInTheDocument();
      expect(screen.getByText("No workouts recorded yet.")).toBeInTheDocument();
    })

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
        date: "2024-03-13T11:00:00.000Z",
        duration: 45,
        exercisesPerformed: [
          { id: "ex3", name: "Deadlift", category: "Back", reps: 8, weight: 100 },
        ],
        // caloriesBurned is optional
      },
    ]

    test("displays multiple workout records in an accordion in view mode", async () => {
      const profileWithHistory = { ...baseMockUserProfile, workoutHistory: mockWorkoutHistory };
      renderProfileScreen({ profile: profileWithHistory });

      expect(screen.getByText("Workout History")).toBeInTheDocument();
      const firstRecordDate = new Date(mockWorkoutHistory[0].date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      const secondRecordDate = new Date(mockWorkoutHistory[1].date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

      const firstAccordionTrigger = screen.getByText(firstRecordDate)
      expect(firstAccordionTrigger).toBeInTheDocument()
      expect(screen.getByText(`${mockWorkoutHistory[0].duration} mins`, { exact: false })).toBeInTheDocument() // Part of first trigger

      const secondAccordionTrigger = screen.getByText(secondRecordDate)
      expect(secondAccordionTrigger).toBeInTheDocument()
      expect(screen.getByText(`${mockWorkoutHistory[1].duration} mins`, { exact: false })).toBeInTheDocument() // Part of second trigger

      // Click the first accordion item to expand
      fireEvent.click(firstAccordionTrigger)

      // Wait for content to be visible (if animations or async rendering)
      // Using waitFor to ensure content is loaded if Accordion has delays
      await waitFor(() => {
        expect(screen.getByText(`Calories Burned: ${mockWorkoutHistory[0].caloriesBurned}`)).toBeInTheDocument()
      })
      expect(screen.getByText(`${mockWorkoutHistory[0].exercisesPerformed[0].name}`, { exact: false })).toBeInTheDocument()
      expect(screen.getByText(/Push-ups \(Chest\): 15 reps, 0 kg/i)).toBeInTheDocument();
      expect(screen.getByText(/Squats \(Legs\): 12 reps, 20 kg/i)).toBeInTheDocument();


      // Click the second accordion item to expand
      fireEvent.click(secondAccordionTrigger)
      await waitFor(() => {
         expect(screen.getByText(`${mockWorkoutHistory[1].exercisesPerformed[0].name}`, { exact: false })).toBeInTheDocument()
      })
      expect(screen.getByText(/Deadlift \(Back\): 8 reps, 100 kg/i)).toBeInTheDocument();
      // Calories burned is optional and not present for the second record, so it shouldn't be rendered for it.
      // To test this properly, we would need to click the second trigger and check its content.
      // For now, this test confirms the first item's calories and general structure.
    });
  });

  describe("Edit Mode Functionality", () => {
    describe("Edit Button Visibility", () => {
      test("'Edit Profile' button is visible for admin", () => {
        renderProfileScreen({ profile: baseMockUserProfile, loggedInRole: "admin", isOwnProfile: false });
        expect(screen.getByRole("button", { name: /edit profile/i })).toBeInTheDocument();
      });

      test("'Edit Profile' button is visible for user editing their own profile", () => {
        renderProfileScreen({ profile: baseMockUserProfile, loggedInRole: "user", isOwnProfile: true });
        expect(screen.getByRole("button", { name: /edit profile/i })).toBeInTheDocument();
      });

      test("'Edit Profile' button is NOT visible for user viewing another user's profile", () => {
        renderProfileScreen({ profile: baseMockUserProfile, loggedInRole: "user", isOwnProfile: false });
        expect(screen.queryByRole("button", { name: /edit profile/i })).not.toBeInTheDocument();
      });
       test("'Edit Profile' button is NOT visible if onUpdateUserProfile is not provided", () => {
        renderProfileScreen({ profile: baseMockUserProfile, loggedInRole: "admin", isOwnProfile: true, onUpdate: undefined });
        expect(screen.queryByRole("button", { name: /edit profile/i })).not.toBeInTheDocument();
      });
    });

    describe("Entering Edit Mode", () => {
      test("clicking 'Edit Profile' enables edit mode, shows Save/Cancel buttons", () => {
        renderProfileScreen({ profile: baseMockUserProfile, loggedInRole: "admin" });
        fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));

        expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /edit profile/i })).not.toBeInTheDocument();
        // Check if an input field is present (e.g., for name)
        expect(screen.getByLabelText(/name/i)).toBeInstanceOf(HTMLInputElement);
      });
    });

    describe("Field Editability", () => {
      // Admin Editing
      test("Admin can edit Name, Email, Age, Gender, Weight, Height, Activity Level, Fitness Goals, Membership Type", () => {
        renderProfileScreen({ profile: baseMockUserProfile, loggedInRole: "admin" });
        fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));

        expect(screen.getByLabelText(/name/i)).not.toBeDisabled();
        expect(screen.getByLabelText(/email/i)).not.toBeDisabled();
        expect(screen.getByLabelText(/age/i)).not.toBeDisabled();
        // For Select, check presence of trigger
        expect(screen.getByLabelText(/gender/i)).toBeInTheDocument(); // Select Trigger
        expect(screen.getByLabelText(/weight \(kg\)/i)).not.toBeDisabled();
        expect(screen.getByLabelText(/height \(cm\)/i)).not.toBeDisabled();
        expect(screen.getByLabelText(/activity level/i)).toBeInTheDocument(); // Select Trigger
        expect(screen.getByLabelText(/fitness goals/i)).not.toBeDisabled();
        expect(screen.getByLabelText(/membership type/i)).toBeInTheDocument(); // Select Trigger
        // Role should not be editable
        expect(screen.getByText(baseMockUserProfile.role, { exact:false })).toBeInTheDocument();

      });

      // User Editing Own Profile
      test("User editing own profile can edit Name, Age, Gender, Weight, Height, Activity Level, Fitness Goals", () => {
        renderProfileScreen({ profile: baseMockUserProfile, loggedInRole: "user", isOwnProfile: true });
        fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));

        expect(screen.getByLabelText(/name/i)).not.toBeDisabled();
        expect(screen.getByLabelText(/age/i)).not.toBeDisabled();
        expect(screen.getByLabelText(/gender/i)).toBeInTheDocument(); // Select Trigger
        expect(screen.getByLabelText(/weight \(kg\)/i)).not.toBeDisabled();
        expect(screen.getByLabelText(/height \(cm\)/i)).not.toBeDisabled();
        expect(screen.getByLabelText(/activity level/i)).toBeInTheDocument(); // Select Trigger
        expect(screen.getByLabelText(/fitness goals/i)).not.toBeDisabled();
      });

      test("User editing own profile CANNOT edit Email, Role, Membership Type", () => {
        renderProfileScreen({ profile: baseMockUserProfile, loggedInRole: "user", isOwnProfile: true });
        fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));

        // These fields should be displayed as text, not input fields
        expect(screen.getByText(baseMockUserProfile.email)).toBeInTheDocument();
        expect(screen.queryByLabelText(/email/i)).toBeNull();

        expect(screen.getByText(baseMockUserProfile.membershipType.charAt(0).toUpperCase() + baseMockUserProfile.membershipType.slice(1))).toBeInTheDocument();
        expect(screen.queryByLabelText(/membership type/i)).toBeNull();

        expect(screen.getByText(baseMockUserProfile.role.charAt(0).toUpperCase() + baseMockUserProfile.role.slice(1))).toBeInTheDocument();
      });
    });

    describe("Saving and Canceling Changes", () => {
      test("'Cancel' button discards changes and exits edit mode", () => {
        renderProfileScreen({ profile: baseMockUserProfile, loggedInRole: "admin" });
        fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));

        const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: "Changed Name" } });
        expect(nameInput.value).toBe("Changed Name");

        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

        expect(screen.queryByRole("button", { name: /save changes/i })).not.toBeInTheDocument();
        expect(screen.getByText(baseMockUserProfile.name)).toBeInTheDocument(); // Name reverted
        expect(mockOnUpdateUserProfile).not.toHaveBeenCalled();
      });

      test("'Save Changes' calls onUpdateUserProfile with correct data and exits edit mode (Admin scenario)", () => {
        renderProfileScreen({ profile: baseMockUserProfile, loggedInRole: "admin" });
        fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));

        const nameInput = screen.getByLabelText(/name/i);
        const ageInput = screen.getByLabelText(/age/i);
        const goalsInput = screen.getByLabelText(/fitness goals/i);

        fireEvent.change(nameInput, { target: { value: "Admin Edited Name" } });
        fireEvent.change(ageInput, { target: { value: "40" } });
        fireEvent.change(goalsInput, { target: { value: "new goal, another goal" } });
        // Example for Select (Membership Type)
        // Need to open the select first. The actual Select component might need more specific interaction.
        // For simplicity, assume handleSelectChange is tested elsewhere or trust Select behavior.
        // Here we are more focused on the data passed to onUpdateUserProfile.


        fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

        expect(mockOnUpdateUserProfile).toHaveBeenCalledTimes(1);
        const expectedProfile = {
          ...baseMockUserProfile,
          name: "Admin Edited Name",
          age: 40, // Number
          fitnessGoals: ["new goal", "another goal"],
          // ensure email, role, membershipType are passed correctly based on admin edit rules
          email: baseMockUserProfile.email, // Assuming admin didn't change it in this specific test flow for email input
          membershipType: baseMockUserProfile.membershipType, // Assuming admin didn't change it
        };
        expect(mockOnUpdateUserProfile).toHaveBeenCalledWith(expect.objectContaining(expectedProfile));
        expect(screen.queryByRole("button", { name: /save changes/i })).not.toBeInTheDocument();
        expect(screen.getByText("Admin Edited Name")).toBeInTheDocument(); // UI updated
      });
    });
  });

  // Original tests for BackToPlanner and Logout (should still pass)
  describe("Navigation Buttons (View Mode)", () => {
    test('calls onBackToPlanner when "Back to Planner" button is clicked', () => {
      renderProfileScreen({ profile: baseMockUserProfile });
      const backButton = screen.getByRole("button", { name: /back to planner/i });
      fireEvent.click(backButton);
      expect(mockOnBackToPlanner).toHaveBeenCalledTimes(1);
    });

    test('calls onLogout when "Logout" button is clicked', () => {
      renderProfileScreen({ profile: baseMockUserProfile });
      const logoutButton = screen.getByRole("button", { name: /logout/i });
      fireEvent.click(logoutButton);
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });
  })
})
