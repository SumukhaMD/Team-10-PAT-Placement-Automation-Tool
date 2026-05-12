/**
 * Safely converts a backend field that may be a string, array, or nullish
 * value into a proper string array suitable for .map()/.filter() calls.
 *
 * Backend strings may arrive as:
 *  - A real JS array (e.g. ["CSE", "IT"])
 *  - A comma-separated string (e.g. "CSE,IT")
 *  - A newline-separated string (e.g. "CSE\nIT")
 *  - null / undefined
 */
export const toArray = (val: any): string[] => {
  if (!val) return []
  if (Array.isArray(val)) return val
  return String(val)
    .split(/,|\n/)
    .map((s: string) => s.trim())
    .filter(Boolean)
}
