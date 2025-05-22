export function formatEmojiName(shortName: string): string {
  // Replace underscores with spaces
  const spaced = shortName.replace(/_/g, ' ');
  
  // Capitalize first letter if it's an alphabet
  return spaced.replace(/^([a-z])/, (match) => match.toUpperCase());
}
