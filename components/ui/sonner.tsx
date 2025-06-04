import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      // className="toaster group" // Keep original classes if they don't conflict
      // Ensure the viewport for these toasts is centered.
      // The `sonner` library might have specific props for viewport positioning or styling.
      // If direct viewport styling isn't available through props,
      // we might need to rely on global CSS overrides or ensure the toast itself is styled to appear modal-like.
      // For now, let's focus on centering the toast content.
      // The `position` prop is the standard way to control toast location.
      position="top-center" // This will position toasts at the top-center.
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:p-6 group-[.toaster]:min-w-[300px] group-[.toaster]:max-w-md", // Added padding and width constraints
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          // Ensure the container for multiple toasts is also centered if that's controlled here.
          // If Sonner creates a specific viewport element, that would be the target.
          // For now, the styling is on individual toasts.
        },
      }}
      // If we want a background overlay for *when a toast is visible*, that's more complex.
      // Typically, toasts don't have their own full-screen backdrop.
      // The issue asks for "visible overlay in the center", this could mean the toast itself is the overlay.
      {...props}
    />
  )
}

export { Toaster }
