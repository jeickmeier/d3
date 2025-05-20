export function formatDisplayDate(dateString: string | undefined): string {
  if (!dateString) {
    return "Pick a date";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

  const elementDate = new Date(dateString);
  elementDate.setHours(0, 0, 0, 0); // Normalize elementDate to the start of the day

  const todayTime = today.getTime();
  const elementDateTime = elementDate.getTime();

  if (elementDateTime === todayTime) {
    return "Today";
  }

  const yesterday = new Date(todayTime);
  yesterday.setDate(today.getDate() - 1);
  if (elementDateTime === yesterday.getTime()) {
    return "Yesterday";
  }

  const tomorrow = new Date(todayTime);
  tomorrow.setDate(today.getDate() + 1);
  if (elementDateTime === tomorrow.getTime()) {
    return "Tomorrow";
  }

  return elementDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
