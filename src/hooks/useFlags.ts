import { useCallback, useEffect, useState } from "react";

interface UseTableFiltersProps {
  namespace: string;
}

export const useFlags = ({ namespace }: UseTableFiltersProps) => {
  const [flags, setFlags] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${namespace}-flags`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`${namespace}-flags`, JSON.stringify(flags));
  }, [flags, namespace]);

  const toggleFlag = useCallback((key: string) => {
    setFlags((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }, []);

  return [flags, toggleFlag] as const;
};
