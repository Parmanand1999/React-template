import React, { useMemo, useEffect, useState } from "react";
import { Country, State, City } from "country-state-city";
import SearchableSelect from "./SearchableSelect";

const CountryStateCitySelect = ({
  country = "",
  state = "",
  city = "",
  onCountryChange, // (countryName) => void
  onStateChange,   // (stateName) => void
  onCityChange,    // (cityName) => void
  required = false,
  errors = {},
}) => {
  // All countries cached in memory
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const countryOptions = useMemo(
    () =>
      allCountries.map((c) => ({
        label: c.name,
        name: c.name,
        value: c.name,
        isoCode: c.isoCode,
        flag: c.flag,
        currency: c.currency,
      })),
    [allCountries]
  );

  // Active ISO codes for cascading queries
  const [activeCountryIso, setActiveCountryIso] = useState("");
  const [activeStateIso, setActiveStateIso] = useState("");

  // Sync activeCountryIso when country prop changes or on mount
  useEffect(() => {
    if (country) {
      const match = allCountries.find(
        (c) =>
          c.name.toLowerCase() === country.toLowerCase() ||
          c.isoCode.toLowerCase() === country.toLowerCase()
      );
      if (match) {
        setActiveCountryIso(match.isoCode);
      }
    } else {
      setActiveCountryIso("");
    }
  }, [country, allCountries]);

  // States of currently active country
  const stateOptions = useMemo(() => {
    if (!activeCountryIso) return [];
    return State.getStatesOfCountry(activeCountryIso).map((s) => ({
      label: s.name,
      value: s.name,
      isoCode: s.isoCode,
    }));
  }, [activeCountryIso]);

  // Sync activeStateIso when state prop changes
  useEffect(() => {
    if (activeCountryIso && state) {
      const match = State.getStatesOfCountry(activeCountryIso).find(
        (s) =>
          s.name.toLowerCase() === state.toLowerCase() ||
          s.isoCode.toLowerCase() === state.toLowerCase()
      );
      if (match) {
        setActiveStateIso(match.isoCode);
      }
    } else {
      setActiveStateIso("");
    }
  }, [activeCountryIso, state]);

  // Cities of currently active country and state
  const cityOptions = useMemo(() => {
    if (!activeCountryIso || !activeStateIso) return [];
    return City.getCitiesOfState(activeCountryIso, activeStateIso).map((c) => ({
      label: c.name,
      value: c.name,
    }));
  }, [activeCountryIso, activeStateIso]);

  // Handlers
  const handleCountrySelect = (countryName, opt) => {
    onCountryChange(countryName, opt);
    setActiveCountryIso(opt?.isoCode || "");

    // Reset dependent state and city
    onStateChange("");
    onCityChange("");
    setActiveStateIso("");
  };

  const handleStateSelect = (stateName, opt) => {
    onStateChange(stateName, opt);
    setActiveStateIso(opt?.isoCode || "");

    // Reset dependent city
    onCityChange("");
  };

  const handleCitySelect = (cityName) => {
    onCityChange(cityName);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {/* 1. Country Select */}
      <SearchableSelect
        label="Country"
        placeholder="Select Country"
        options={countryOptions}
        value={country}
        onChange={handleCountrySelect}
        required={required}
        error={errors.country}
      />

      {/* 2. State Select */}
      <SearchableSelect
        label="State / Province"
        placeholder={
          !activeCountryIso
            ? "First select country"
            : stateOptions.length === 0
            ? "No states available"
            : "Select State"
        }
        options={stateOptions}
        value={state}
        onChange={handleStateSelect}
        disabled={!activeCountryIso || stateOptions.length === 0}
        required={required}
        error={errors.state}
      />

      {/* 3. City Select */}
      <SearchableSelect
        label="City"
        placeholder={
          !activeStateIso
            ? "First select state"
            : cityOptions.length === 0
            ? "No cities available"
            : "Select City"
        }
        options={cityOptions}
        value={city}
        onChange={handleCitySelect}
        disabled={!activeStateIso || cityOptions.length === 0}
        required={required}
        error={errors.city}
      />
    </div>
  );
};

export default CountryStateCitySelect;
