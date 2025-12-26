import { useState, useEffect, useRef } from "react";
import loadSpin from "../../../assets/progress.svg";

interface AutocompleteInputProps {
  label?: string;
  value: string;
  size?: "small" | "medium";
  onChange: (value: string) => void;
  onSearch: (query: string) => Promise<string[]>;
  placeholder?: string;
  error?: string | null;
  className?: string;
}

export function AutocompleteInput({
  label,
  value,
  size,
  onChange,
  onSearch,
  placeholder = "",
  error = null,
  className = "",
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0); // track latest request

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchSuggestions = async () => {
      const trimmed = value.trim();

      if (trimmed.length < 1) {
        setSuggestions([]);
        setShowDropdown(false);
        setSelectedIndex(-1);
        setLoading(false); // ensure loader stops when cleared
        return;
      }

      setLoading(true);
      setShowDropdown(true); // keep dropdown open while loading

      const id = ++requestIdRef.current;
      try {
        const results = await onSearch(trimmed);
        if (id !== requestIdRef.current) return; // ignore stale responses

        const filtered = results.filter(
          (item) => item.toLowerCase() !== trimmed.toLowerCase()
        );
        setSuggestions(filtered);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Search error:", err);
        setSuggestions([]);
      } finally {
        if (id === requestIdRef.current) setLoading(false);
      }
    };

    const timer = setTimeout(searchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowDropdown(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay to allow click events on dropdown items
    setTimeout(() => {
      if (document.activeElement !== inputRef.current) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    }, 200);
  };

  const RenderDropDown = () => {
    if (!showDropdown) return null;

    if (isLoading) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingBottom: "0.5rem",
            paddingTop: "0.5rem",
            justifyContent: "center",
          }}
          className="autocomplete-dropdown"
        >
          <img src={loadSpin} alt="Loading" className="spin-animation" />
        </div>
      );
    }

    if (suggestions.length > 0) {
      return (
        <div className="autocomplete-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`autocomplete-item ${
                index === selectedIndex ? "selected" : ""
              }`}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      );
    }

    // Optional: show an empty state when not loading and no suggestions
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingBottom: "0.5rem",
          paddingTop: "0.5rem",
          justifyContent: "center",
          color: "#888",
        }}
        className="autocomplete-dropdown"
      >
        No matches
      </div>
    );
  };

  return (
    <div className="form-group" ref={wrapperRef}>
      {label ? <label className="form-label">{label}</label> : ""}
      <div className="autocomplete-wrapper">
        <input
          ref={inputRef}
          className={`input input-${size ? size : "medium"} ${
            error ? "error" : ""
          } ${className}`}
          value={value}
          onChange={(e) => {
            setLoading(true);      // show spinner immediately during debounce
            setShowDropdown(true); // open dropdown while typing
            onChange(e.target.value);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder={placeholder}
          autoComplete="off"
        />
        {RenderDropDown()}
      </div>
      {error && <p className="input-error-message">{error}</p>}
    </div>
  );
}
