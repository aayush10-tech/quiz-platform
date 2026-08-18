export const formatToIST = (date) => {
  if (!date) return null;

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(new Date(date));
};

export const formatAttemptDates = (attempt) => {
  if (!attempt) return attempt;

  return {
    ...attempt,
    startedAt: formatToIST(attempt.startedAt),
    completedAt: formatToIST(attempt.completedAt)
  };
};