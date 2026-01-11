import { useEffect, useState } from "react";

export const useSelection = () => {
  const [text, setText] = useState("");

  useEffect(() => {
    const handler = () => {
      setText(window.getSelection()?.toString() || "");
    };
    document.addEventListener("mouseup", handler);
    return () => document.removeEventListener("mouseup", handler);
  }, []);

  return text;
};
