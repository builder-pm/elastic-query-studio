import { useStorage } from './useStorage';

export const useDebugMode = () => {
  const [isDebugMode, setIsDebugMode, isLoading, error] = useStorage<string, boolean>(
    'debugMode', 
    false // Default debug mode to false
  );

  // Potentially add functions here to inform the background script about debug mode changes
  // if direct storage watching isn't sufficient or if other actions need to be triggered.

  return { isDebugMode, setIsDebugMode, isLoadingDebugMode: isLoading, debugModeError: error };
};

export default useDebugMode;
