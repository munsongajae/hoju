"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

interface CollapsibleContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextType | undefined>(undefined)

function Collapsible({ children, defaultOpen = false }: CollapsibleProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      {children}
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(CollapsibleContext)
  if (!context) throw new Error("CollapsibleTrigger must be used within Collapsible")
  
  const { open, setOpen } = context
  
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn("flex items-center justify-between w-full", className)}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "w-4 h-4 transition-transform duration-200",
          open && "transform rotate-180"
        )}
      />
    </button>
  )
}

function CollapsibleContent({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(CollapsibleContext)
  if (!context) throw new Error("CollapsibleContent must be used within Collapsible")
  
  const { open } = context
  
  if (!open) return null
  
  return (
    <div
      className={cn("overflow-hidden transition-all", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
