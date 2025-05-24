import { useState, useEffect, useCallback } from 'react';

// Hook to manage data in chrome.storage.local
// K: Key type, T: Value type
export const useStorage = <K extends string, T>(
  key: K, 
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => Promise<void>, boolean, Error | null] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial value from storage
  useEffect(() => {
    setIsLoading(true);
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        console.error(`Error getting item ${key} from storage:`, chrome.runtime.lastError);
        setError(chrome.runtime.lastError);
        setStoredValue(initialValue); // Fallback to initial value
      } else if (result[key] !== undefined) {
        setStoredValue(result[key] as T);
      } else {
        // If not in storage, set it with initialValue (optional, depends on desired behavior)
        // chrome.storage.local.set({ [key]: initialValue }, () => {
        //   if (chrome.runtime.lastError) {
        //     console.error(`Error setting initial item ${key} in storage:`, chrome.runtime.lastError);
        //     setError(chrome.runtime.lastError);
        //   }
        // });
        setStoredValue(initialValue); // Use initial value if not found
      }
      setIsLoading(false);
    });
  }, [key, initialValue]);

  // Function to update the value both in state and chrome.storage
  const setValue = useCallback(async (value: T | ((prev: T) => T)) => {
    setIsLoading(true);
    setError(null);
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ [key]: valueToStore }, () => {
          if (chrome.runtime.lastError) {
            console.error(`Error setting item ${key} in storage:`, chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            setStoredValue(valueToStore);
            resolve();
          }
        });
      });
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, isLoading, error];
};

// Example usage for a specific setting (e.g., theme)
// export const useTheme = () => {
//   return useStorage<'theme', 'light' | 'dark'>('theme', 'light');
// };

export default useStorage;
