"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    // Only access localStorage in browser
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "dark";
      setTheme(savedTheme);
      
      // Apply theme to document
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    }
  }, []);

  // Save theme to localStorage and update HTML class
  const toggleTheme = () => {
    if (typeof window === "undefined") return;
    
    const newTheme = theme === "dark" ? "light" : "dark";
    console.log("Toggling theme from", theme, "to", newTheme);
    
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Force update document classes immediately
    const html = document.documentElement;
    
    if (newTheme === "light") {
      html.classList.add("light");
      html.classList.remove("dark");
      console.log("Applied light theme classes");
    } else {
      html.classList.add("dark");
      html.classList.remove("light");
      console.log("Applied dark theme classes");
    }
    
    // Force a repaint
    void html.offsetHeight;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  // Return default values during SSR instead of throwing error
  if (!context) {
    return { theme: "dark", toggleTheme: () => {}, mounted: false };
  }
  return context;
}
