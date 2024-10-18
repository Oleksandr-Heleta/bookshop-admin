"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { uk } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={uk}
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "pl-2 text-sm font-medium",
        nav: "absolute top-4 right-4 space-x-1 flex items-center",
        day:  "rounded m-1 text-center h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        disabled: "text-muted-foreground opacity-50",
        today: "bg-accent text-accent-foreground",
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        hidden: "invisible",
          ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      } as any}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }