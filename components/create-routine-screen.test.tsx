import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { CreateRoutineScreen } from "./create-routine-screen"

describe("CreateRoutineScreen Component", () => {
  test("renders title and under development message", () => {
    render(<CreateRoutineScreen />)
    expect(screen.getByText("Create Your Workout Routine")).toBeInTheDocument()
    expect(screen.getByText("This tool is under development.")).toBeInTheDocument()
    expect(screen.getByText(/Build and customize your own workout routines/i)).toBeInTheDocument()
  })
})
