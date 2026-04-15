/**
 * Generates future transaction dates based on recurrence pattern
 */
export function generateRecurrenceDates(startDate, recurrence, endType, endValue) {
  if (recurrence === 'none') {
    return [startDate];
  }

  const dates = [new Date(startDate)];
  let currentDate = new Date(startDate);
  let occurrences = 1;
  const maxOccurrences = 120; // Safety limit (10 years of monthly)

  // Determine end date based on endType
  let endDate = null;
  if (endType === 'on') {
    endDate = endValue instanceof Date ? new Date(endValue) : null;
  } else if (endType === 'after') {
    // Generate up to endValue occurrences
    const maxOccur = Math.min(endValue || 1, maxOccurrences);
    while (occurrences < maxOccur && occurrences < maxOccurrences) {
      currentDate = addRecurrenceToDate(currentDate, recurrence);
      dates.push(new Date(currentDate));
      occurrences++;
    }
    return dates;
  } else {
    // 'never' - generate up to 10 years ahead
    endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 10);
  }

  // Generate dates up to endDate
  while (occurrences < maxOccurrences) {
    currentDate = addRecurrenceToDate(currentDate, recurrence);
    if (endDate && currentDate > endDate) {
      break;
    }
    dates.push(new Date(currentDate));
    occurrences++;
  }

  return dates;
}

/**
 * Adds recurrence interval to a date
 */
function addRecurrenceToDate(date, recurrence) {
  const result = new Date(date);

  switch (recurrence) {
    case 'daily':
      result.setDate(result.getDate() + 1);
      break;
    case 'weekly':
      result.setDate(result.getDate() + 7);
      break;
    case 'biweekly':
      result.setDate(result.getDate() + 14);
      break;
    case 'monthly':
      // Handle month-end edge cases (e.g., Jan 31 -> Feb 28)
      const original = result.getDate();
      result.setMonth(result.getMonth() + 1);
      if (result.getDate() !== original) {
        result.setDate(0); // Last day of previous month
      }
      break;
    case 'yearly':
      result.setFullYear(result.getFullYear() + 1);
      break;
  }

  return result;
}

/**
 * Gets human-readable recurrence label
 */
export function getRecurrenceLabel(recurrence, endType, endValue) {
  if (recurrence === 'none') {
    return 'One-time';
  }

  const recurrenceMap = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Every 2 weeks',
    monthly: 'Monthly',
    yearly: 'Yearly'
  };

  const label = recurrenceMap[recurrence] || 'Unknown';

  if (endType === 'after') {
    const count = endValue || 1;
    return `${label} (${count} ${count === 1 ? 'time' : 'times'})`;
  } else if (endType === 'on') {
    if (endValue instanceof Date) {
      const formatted = endValue.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return `${label} until ${formatted}`;
    }
    return label;
  }

  return `${label} (ongoing)`;
}

/**
 * Checks if a transaction is part of a recurrence series
 */
export function isPartOfRecurrence(transaction) {
  return transaction.recurrence && transaction.recurrence !== 'none';
}

/**
 * Gets the next occurrence date for a recurring transaction
 */
export function getNextOccurrenceDate(lastDate, recurrence) {
  return addRecurrenceToDate(new Date(lastDate), recurrence);
}
