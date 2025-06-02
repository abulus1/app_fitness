import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { BookingScreen } from "./booking-screen"

describe("BookingScreen Component", () => {
  test("renders title and coming soon message", () => {
    render(<BookingScreen />)
    expect(screen.getByText("Booking & Reservations")).toBeInTheDocument()
    expect(screen.getByText("This feature is coming soon!")).toBeInTheDocument()
    expect(screen.getByText(/Plan and book your workout sessions or classes here/i)).toBeInTheDocument()
  })
})
