import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { PreMadeRoutinesScreen } from "./pre-made-routines-screen"

describe("PreMadeRoutinesScreen Component", () => {
  test("renders title and coming soon message", () => {
    render(<PreMadeRoutinesScreen />)
    expect(screen.getByText("Pre-Made Routines")).toBeInTheDocument()
    expect(screen.getByText("Coming soon!")).toBeInTheDocument()
    expect(screen.getByText(/Explore a library of expertly crafted workout routines/i)).toBeInTheDocument()
  })
})
