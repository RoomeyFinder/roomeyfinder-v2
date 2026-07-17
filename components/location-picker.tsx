"use client";

import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestCurrentLocation,
  searchLocations,
  type LocationSelection,
} from "@/lib/location";

type LocationPickerProps = {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  value: LocationSelection | null;
  onChange: (location: LocationSelection | null) => void;
};

export function LocationPicker({
  id,
  label,
  hint,
  required = false,
  value,
  onChange,
}: LocationPickerProps) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<LocationSelection[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentLoading, setCurrentLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (value || trimmedQuery.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearching(true);
      setError("");
      try {
        setResults(await searchLocations(trimmedQuery, controller.signal));
      } catch (searchError) {
        if (!controller.signal.aborted) {
          setResults([]);
          setError(
            searchError instanceof Error
              ? searchError.message
              : "Unable to search for that location.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
      setSearching(false);
    };
  }, [query, value]);

  async function handleUseCurrentLocation() {
    setCurrentLoading(true);
    setError("");
    try {
      const coordinates = await requestCurrentLocation();
      const selection = { ...coordinates, label: "Current location" };
      setQuery(selection.label);
      setResults([]);
      onChange(selection);
    } catch (locationError) {
      setError(
        locationError instanceof Error
          ? locationError.message
          : "Unable to use your current location.",
      );
    } finally {
      setCurrentLoading(false);
    }
  }

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery);
    setError("");
    if (value) onChange(null);
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          required={required}
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Search an area, city, or address"
          className="pl-9"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={`${id}-results`}
        />
        {results.length > 0 ? (
          <div
            id={`${id}-results`}
            role="listbox"
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-brand-md border bg-card shadow-lg"
          >
            {results.map((result) => (
              <button
                key={`${result.providerId ?? result.label}-${result.latitude}`}
                type="button"
                role="option"
                aria-selected={false}
                className="flex w-full items-start gap-2 px-3 py-3 text-left text-sm hover:bg-secondary"
                onClick={() => {
                  setQuery(result.label);
                  setResults([]);
                  setError("");
                  onChange(result);
                }}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>{result.label}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleUseCurrentLocation()}
          disabled={currentLoading}
        >
          {currentLoading ? (
            <Loader2 className="animate-spin" />
          ) : value?.label === "Current location" ? (
            <CheckCircle2 className="text-emerald-600" />
          ) : (
            <MapPin />
          )}
          {currentLoading
            ? "Finding you..."
            : value?.label === "Current location"
              ? "Current location selected"
              : "Use my current location"}
        </Button>
        {searching ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Searching
          </span>
        ) : null}
        {value ? (
          <span className="flex items-center gap-1 text-xs text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Location selected
          </span>
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
