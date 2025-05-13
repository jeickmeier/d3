"use client";

import * as React from "react";
import { format, startOfMonth, startOfYear, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Preset configuration
const dateRangePresets = [
  {
    label: "1D",
    getDateRange: () => {
      const today = new Date();
      const yesterday = subDays(today, 1);
      return { from: yesterday, to: today };
    },
  },
  {
    label: "7D",
    getDateRange: () => {
      const today = new Date();
      const last7Days = subDays(today, 6);
      return { from: last7Days, to: today };
    },
  },
  {
    label: "MTD",
    getDateRange: () => {
      const today = new Date();
      const mtd = startOfMonth(today);
      return { from: mtd, to: today };
    },
  },
  {
    label: "YTD",
    getDateRange: () => {
      const today = new Date();
      const ytd = startOfYear(today);
      return { from: ytd, to: today };
    },
  },
  {
    label: "2024",
    getDateRange: () => {
      const startOf2024 = new Date(2024, 0, 1); // Jan 1, 2024
      const endOf2024 = new Date(2024, 11, 31); // Dec 31, 2024
      return { from: startOf2024, to: endOf2024 };
    },
  },
  {
    label: "5Y",
    getDateRange: () => {
      const today = new Date();
      const fiveYearsAgo = new Date(today);
      fiveYearsAgo.setFullYear(today.getFullYear() - 5);
      return { from: fiveYearsAgo, to: today };
    },
  },
];

interface DatePickerWithRangeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  onChange?: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  onChange,
}: DatePickerWithRangeProps) {
  // Initialize with the 7D preset
  const initialDateRange = dateRangePresets[1].getDateRange();
  const [date, setDate] = React.useState<DateRange | undefined>(
    initialDateRange,
  );

  // Track the months displayed in each calendar
  const [leftMonth, setLeftMonth] = React.useState<Date>(initialDateRange.from);
  const [rightMonth, setRightMonth] = React.useState<Date>(
    initialDateRange.to || new Date(),
  );

  // Call onChange when date changes
  React.useEffect(() => {
    onChange?.(date);
  }, [date, onChange]);

  // Handle date selection
  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);

    // Update calendar views to show the selected range
    if (newDate?.from) {
      setLeftMonth(newDate.from);
    }

    if (newDate?.to) {
      setRightMonth(newDate.to);
    } else if (newDate?.from) {
      // If only from is selected, show it in both calendars
      setRightMonth(newDate.from);
    }
  };

  // Handle preset selection
  const handlePresetSelect = (preset: (typeof dateRangePresets)[0]) => {
    const newRange = preset.getDateRange();
    setDate(newRange);

    // Update both calendars to show the start and end dates
    setLeftMonth(newRange.from);
    setRightMonth(newRange.to || newRange.from);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[250px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(calc(100vw-135px),540px)] p-0"
          align="start"
        >
          <div className="flex flex-col w-full">
            <div className="flex flex-col md:flex-row p-1 w-full gap-4">
              <div className="border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-4 flex-1 w-full">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={handleSelect}
                  month={leftMonth}
                  onMonthChange={setLeftMonth}
                  numberOfMonths={1}
                  disabled={{ after: new Date() }}
                  showOutsideDays
                  fixedWeeks
                />
              </div>
              <div className="flex-1 w-full">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={handleSelect}
                  month={rightMonth}
                  onMonthChange={setRightMonth}
                  numberOfMonths={1}
                  disabled={{ after: new Date() }}
                  showOutsideDays
                  fixedWeeks
                />
              </div>
            </div>

            <div className="flex items-center justify-center p-2 border-t">
              <div className="flex flex-wrap justify-center gap-2 px-2">
                {dateRangePresets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
