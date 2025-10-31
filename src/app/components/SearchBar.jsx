import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import "./searchBar.css";

export default function SearchBar({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Rechercher un jeu...",
  className = "search-bar",
  debounceMs = 250,
}) {
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [debounced, setDebounced] = useState(value);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), debounceMs);
    return () => clearTimeout(t);
  }, [value, debounceMs]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);

        let data = null;

        const res = await fetch("http://localhost:5174/api/games/getAllGames", {
          method: "GET",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();

        if (cancelled) return;

        setAllGames(Array.isArray(data) ? data : []);
        setLoadError(null);
      } catch (e) {
        if (!cancelled) setLoadError(e.message || "Erreur de chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const suggestions = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (q.length < 2) return [];
    const seen = new Set();
    const list = [];
    for (const g of allGames) {
      const title = g.title || "";
      if (title.toLowerCase().includes(q) && !seen.has(title)) {
        seen.add(title);
        list.push({ id: g.id, label: title, icon: g.cover_url });
      }
      if (list.length >= 6) break;
    }
    return list;
  }, [debounced, allGames]);

  useEffect(() => {
    setOpen(value.trim().length >= 2 && suggestions.length > 0);
    setHighlight(-1);
  }, [value, suggestions.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/") {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submitQuery = (q) => {
    if (typeof onSubmit === "function") onSubmit(q);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = value?.trim();
    if (!q) return;
    submitQuery(q);
    setOpen(false);
  };

  const handleInputKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open) {
      if (e.key === "Escape") {
        if (value) onChange?.("");
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (highlight >= 0 && suggestions[highlight]) {
        e.preventDefault();
        const q = suggestions[highlight].label;
        onChange?.(q);
        setTimeout(() => submitQuery(q), 0);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    onChange?.(suggestion.label);
    setOpen(false);
    window.location.href = `/game/${suggestion.id}`;
  };

  return (
    <form
      ref={formRef}
      className={className}
      role="search"
      aria-label="Recherche"
      onSubmit={handleSubmit}
    >
      <div className="sb-inner">
        <span className="sb-icon" aria-hidden="true">
          {/* search icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="m21 21-4.3-4.3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleInputKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            highlight >= 0 && open ? `${listboxId}-opt-${highlight}` : undefined
          }
        />
        {value ? (
          <button
            type="button"
            className="sb-clear"
            aria-label="Effacer la recherche"
            onClick={() => {
              onChange?.("");
              inputRef.current?.focus();
              setOpen(false);
            }}
          >
            {/* x icon */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : (
          <span className="sb-spacer" aria-hidden="true" />
        )}
        <button type="submit" className="sb-submit" aria-label="Rechercher">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="m21 21-4.3-4.3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {open && (
        <ul className="sb-suggestions" id={listboxId} role="listbox">
          {suggestions.map((s, idx) => (
            <li
              key={s.id}
              id={`${listboxId}-opt-${idx}`}
              role="option"
              aria-selected={idx === highlight}
              className={idx === highlight ? "active" : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault();
                selectSuggestion(s);
              }}
            >
              <img src={s.icon} alt={s.label} className="sb-suggest-icon" />
              <span className="sb-suggest-label">{s.label}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
