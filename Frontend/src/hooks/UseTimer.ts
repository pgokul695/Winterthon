import { useEffect } from "react";

export const useTimer = (minutes: number, callback: () => void) => {
  useEffect(() => {
    const id = setTimeout(callback, minutes * 60 * 1000);
    return () => clearTimeout(id);
  }, []);
};
