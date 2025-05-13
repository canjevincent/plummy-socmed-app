/**
 * Formats a date as a relative time string (e.g., "5m ago", "2h ago")
 * @param dateString - The date string to format
 * @returns A formatted relative time string
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return 'just now'
    }
    
    // Less than an hour
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    }
    
    // Less than a day
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }
    
    // Less than a month
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `${diffInDays}d ago`
    }
    
    // Less than a year
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
      return `${diffInMonths}mo ago`
    }
    
    // More than a year
    const diffInYears = Math.floor(diffInMonths / 12)
    return `${diffInYears}y ago`
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString // Return the original string if there's an error
  }
}

/**
 * Formats a date as a standard date string (e.g., "Jan 1, 2023")
 * @param dateString - The date string to format
 * @returns A formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}