function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}:00 ${ampm}` : `${hour}:${pad(m)} ${ampm}`;
}

function formatSingleDate(d: Date): string {
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isMidnight(d: Date) {
  return d.getHours() === 0 && d.getMinutes() === 0;
}

export function formatEventDate(start: string, end?: string): string {
  const s = new Date(start);
  const e = end ? new Date(end) : null;

  if (!e) return formatSingleDate(s);

  const sameDay =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate();

  if (sameDay) {
    if (isMidnight(s) && isMidnight(e)) {
      // Rule 1: same day, both 00:00 → single date
      return formatSingleDate(s);
    }
    // Rule 2: same day, different times → date with time range
    return `${formatSingleDate(s)}, ${formatTime(s)} – ${formatTime(e)}`;
  }

  const sameMonthYear =
    s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth();

  if (sameMonthYear) {
    // Rule 3: same month & year → "23 – 26 Sep 2026"
    const month = s.toLocaleDateString("en-AU", { month: "short" });
    const year = s.getFullYear();
    return `${s.getDate()} – ${e.getDate()} ${month} ${year}`;
  }

  // Rule 4: different months → full date range, ignore time
  return `${formatSingleDate(s)} – ${formatSingleDate(e)}`;
}
