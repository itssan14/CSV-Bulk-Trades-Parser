import { useState, useEffect } from 'react';

export default function useDebounce(value: string, delay: number = 500) {
  const [debouncedValue, setDebounceValue] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
