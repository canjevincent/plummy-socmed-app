export const useSessionRefresh = () => {
  // Create a global state to track if the session should be refreshed
  const shouldRefreshSession = useState<boolean>('shouldRefreshSession', () => false);

  // Function to trigger a session refresh
  const refreshSession = async () => {
    // Add your session refresh logic here
    console.log('Refreshing session...');
    // Example: Call an API or update state
    shouldRefreshSession.value = true; // Set the state to true
  };

  // Function to reset the refresh state
  const resetRefreshSession = () => {
    shouldRefreshSession.value = false;
  };

  return {
    shouldRefreshSession,
    refreshSession,
    resetRefreshSession,
  };
};