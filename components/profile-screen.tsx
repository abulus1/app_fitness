"use client"

import { UserProfile } from "@/app/page" // Import UserProfile
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileScreenProps {
  userProfile: UserProfile
  onBackToPlanner: () => void
  onLogout: () => void // Added onLogout
}

export function ProfileScreen({ userProfile, onBackToPlanner, onLogout }: ProfileScreenProps) {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <p><strong>Name:</strong> {userProfile.name}</p>
            <p><strong>Email:</strong> {userProfile.email}</p>
            <p><strong>Age:</strong> {userProfile.age}</p>
            <p><strong>Gender:</strong> {userProfile.gender}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Physical Details</h3>
            <p><strong>Weight:</strong> {userProfile.weight} kg</p>
            <p><strong>Height:</strong> {userProfile.height} cm</p>
            <p><strong>Activity Level:</strong> {userProfile.activityLevel}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Fitness Goals</h3>
            <ul className="list-disc list-inside">
              {userProfile.fitnessGoals.map((goal, index) => (
                <li key={index}>{goal}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Membership & Progress</h3>
            <p><strong>Membership Type:</strong> Standard</p>
            <p><strong>Workout History:</strong> Coming Soon</p>
            <p><strong>Progress Stats:</strong> Check back later!</p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={onBackToPlanner} className="flex-1">
              Back to Planner
            </Button>
            <Button onClick={onLogout} variant="outline" className="flex-1">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
