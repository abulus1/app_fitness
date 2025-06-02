"use client"

import React, { useState, useEffect } from "react" // Import useState and useEffect
import { UserProfile, WorkoutRecord } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ProfileScreenProps {
  userProfile: UserProfile
  onBackToPlanner: () => void
  onLogout: () => void
  loggedInUserRole: "admin" | "user"
  isEditingOwnProfile: boolean
  onUpdateUserProfile?: (updatedProfile: UserProfile) => void
}

export function ProfileScreen({
  userProfile,
  onBackToPlanner,
  onLogout,
  loggedInUserRole,
  isEditingOwnProfile,
  onUpdateUserProfile,
}: ProfileScreenProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>(userProfile);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(userProfile);
    // Reset password fields when not in edit mode or when userProfile changes
    if (!isEditMode || userProfile !== formData) { 
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordChangeError(null);
    }
  }, [userProfile, isEditMode]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEdit = () => setIsEditMode(true)
  
  const handleCancel = () => {
    setIsEditMode(false);
    setFormData(userProfile);
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordChangeError(null);
  };

  const handleSave = () => {
    setPasswordChangeError(null); // Clear previous password error

    let profileToSave: UserProfile = {
      ...userProfile, // Base with original non-editable fields
      ...formData,
      age: Number(formData.age) || userProfile.age,
      weight: Number(formData.weight) || userProfile.weight,
      height: Number(formData.height) || userProfile.height,
      fitnessGoals: typeof formData.fitnessGoals === 'string' 
        ? formData.fitnessGoals.split(',').map(goal => goal.trim()).filter(goal => goal) 
        : userProfile.fitnessGoals,
      email: isAdminEditing ? (formData.email || userProfile.email) : userProfile.email,
      membershipType: isAdminEditing ? (formData.membershipType || userProfile.membershipType) : userProfile.membershipType,
      // Role is handled below if admin is editing
    };
    
    if (isAdminEditing) {
        profileToSave.role = formData.role || userProfile.role;
    } else {
        profileToSave.role = userProfile.role; // Ensure role is not changed by non-admin
    }

    if (newPassword) {
      if (newPassword !== confirmNewPassword) {
        setPasswordChangeError("New passwords do not match.");
        return; // Don't save if passwords don't match
      }
      if (newPassword.length < 6) {
        setPasswordChangeError("New password must be at least 6 characters long.");
        return;
      }
      profileToSave.password = newPassword; // Include new password
    }

    if (onUpdateUserProfile) {
      onUpdateUserProfile(profileToSave);
    }
    setIsEditMode(false);
    setNewPassword(""); // Clear password fields after save attempt
    setConfirmNewPassword("");
    // passwordChangeError is already cleared or set above
  };
  
  const canEditProfile = loggedInUserRole === "admin" || isEditingOwnProfile;
  const isAdminEditing = loggedInUserRole === "admin";

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-center">User Profile</CardTitle>
          {!isEditMode && canEditProfile && onUpdateUserProfile && (
            <Button onClick={handleEdit} variant="outline">Edit Profile</Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div>
              <Label htmlFor="name">Name</Label>
              {isEditMode && (isAdminEditing || isEditingOwnProfile) ? (
                <Input id="name" name="name" value={formData.name || ""} onChange={handleInputChange} />
              ) : (
                <p>{userProfile.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              {isEditMode && isAdminEditing ? ( // Only admin can edit email
                <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleInputChange} />
              ) : (
                <p>{userProfile.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              {isEditMode && (isAdminEditing || isEditingOwnProfile) ? (
                <Input id="age" name="age" type="number" value={formData.age || ""} onChange={handleInputChange} />
              ) : (
                <p>{userProfile.age}</p>
              )}
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              {isEditMode && (isAdminEditing || isEditingOwnProfile) ? (
                <Select name="gender" value={formData.gender || ""} onValueChange={(value) => handleSelectChange("gender", value)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p>{userProfile.gender}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Physical Details</h3>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              {isEditMode && (isAdminEditing || isEditingOwnProfile) ? (
                <Input id="weight" name="weight" type="number" value={formData.weight || ""} onChange={handleInputChange} />
              ) : (
                <p>{userProfile.weight} kg</p>
              )}
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              {isEditMode && (isAdminEditing || isEditingOwnProfile) ? (
                <Input id="height" name="height" type="number" value={formData.height || ""} onChange={handleInputChange} />
              ) : (
                <p>{userProfile.height} cm</p>
              )}
            </div>
            <div>
              <Label htmlFor="activityLevel">Activity Level</Label>
              {isEditMode && (isAdminEditing || isEditingOwnProfile) ? (
                <Select name="activityLevel" value={formData.activityLevel || ""} onValueChange={(value) => handleSelectChange("activityLevel", value)}>
                  <SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="very-active">Very Active</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p>{userProfile.activityLevel}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Fitness Goals</h3>
            {isEditMode && (isAdminEditing || isEditingOwnProfile) ? (
              <div>
                <Label htmlFor="fitnessGoals">Fitness Goals (comma-separated)</Label>
                <Input id="fitnessGoals" name="fitnessGoals" value={Array.isArray(formData.fitnessGoals) ? formData.fitnessGoals.join(", ") : ""} onChange={handleInputChange} />
              </div>
            ) : (
              <ul className="list-disc list-inside">
                {userProfile.fitnessGoals.map((goal, index) => (
                  <li key={index}>{goal}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Membership & Account</h3>
            <div>
              <Label htmlFor="membershipType">Membership Type</Label>
              {isEditMode && isAdminEditing ? (
                <Select name="membershipType" value={formData.membershipType || ""} onValueChange={(value) => handleSelectChange("membershipType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select membership type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p>{userProfile.membershipType.charAt(0).toUpperCase() + userProfile.membershipType.slice(1)}</p>
              )}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              {isEditMode && isAdminEditing ? (
                 <Select name="role" value={formData.role || ""} onValueChange={(value) => handleSelectChange("role" as keyof UserProfile, value)}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p>{userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}</p>
              )}
            </div>
          </div>
          
          {isEditMode && (isEditingOwnProfile || isAdminEditing) && (
            <div className="space-y-2 border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold">Change Password</h3>
              {passwordChangeError && (
                <p className="text-sm text-destructive">{passwordChangeError}</p>
              )}
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password (min. 6 chars)"/>
              </div>
              <div>
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password"/>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Workout History</h3>
            {userProfile.workoutHistory && userProfile.workoutHistory.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {userProfile.workoutHistory.map((record, index) => (
                  <AccordionItem value={`item-${index}`} key={record.date + index}>
                    <AccordionTrigger>
                      <div className="flex justify-between w-full pr-4">
                        <span>{new Date(record.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                        <span>{record.duration} mins</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-2 pr-2">
                      {record.caloriesBurned && (
                        <p className="text-sm text-gray-600 mb-2">
                          Calories Burned: {record.caloriesBurned}
                        </p>
                      )}
                      <ul className="space-y-1">
                        {record.exercisesPerformed.map((exercise, exIndex) => (
                          <li key={exIndex} className="text-sm p-2 bg-gray-50 rounded-md">
                            <strong>{exercise.name}</strong> ({exercise.category}): {exercise.reps} reps, {exercise.weight} kg
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-gray-500">No workouts recorded yet.</p>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Progress Stats</h3>
            <p className="text-sm text-gray-500">Check back later!</p>
          </div>

          {isEditMode ? (
            <div className="flex space-x-2 mt-6">
              <Button onClick={handleSave} className="flex-1">Save Changes</Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">Cancel</Button>
            </div>
          ) : (
            <div className="flex space-x-2 mt-6">
              <Button onClick={onBackToPlanner} className="flex-1">
                Back to Planner
              </Button>
              <Button onClick={onLogout} variant="outline" className="flex-1">
                Logout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
