"use client";

import { useState } from "react";
import { DatePickerWithRange } from "@/components/date_picker/date-picker-with-range";
import type { DateRange } from "react-day-picker";

export default function Test() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Date Range Picker Test</h1>

      <div>
        <DatePickerWithRange onChange={(date) => setDateRange(date)} />
      </div>

      {dateRange && (
        <div className="mt-4 p-4 border rounded-md">
          <h2 className="font-semibold mb-2">Selected Date Range:</h2>
          <p>From: {dateRange.from?.toLocaleDateString()}</p>
          <p>To: {dateRange.to?.toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
