import { useState, useEffect } from "react";


export default function Settings() {
  
  const [theme, setTheme] = useState<"dark" | "light">("dark");
    const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
    useEffect(() => {
    document.body.className = theme;
  }, [theme]);
    return (
        <div>
            <button onClick={toggleTheme}>{`theme ${theme === "dark" ? "light" : "dark"}`}</button>
            <p>This is settings page</p>
        </div>
    );
}