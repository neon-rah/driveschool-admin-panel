import React, { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  value?: string; // Ajout de la prop value (optionnelle)
  onValidationChange?: (isValid: boolean) => void; // Ajout pour gérer la validation (optionnelle)
  className?: string;
  defaultValue?: string;
}

const Select: React.FC<SelectProps> = ({
                                         options,
                                         placeholder = "Select an option",
                                         onChange,
                                         value, // Ajout dans les props
                                         onValidationChange,
                                         className = "",
                                         defaultValue = "",
                                       }) => {
  // Si value est fourni (contrôlé par le parent), on l'utilise ; sinon, on utilise l'état interne
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const selectedValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue); // Gère l'état interne si non contrôlé
    }
    onChange(newValue); // Appelle toujours la fonction onChange du parent
    if (onValidationChange) {
      onValidationChange(!!newValue); // Appelle onValidationChange si défini
    }
  };

  return (
      <select
          className={`h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
              selectedValue
                  ? "text-gray-800 dark:text-white/90"
                  : "text-gray-400 dark:text-gray-400"
          } ${className}`}
          value={selectedValue}
          onChange={handleChange}
      >
        <option
            value=""
            disabled
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {placeholder}
        </option>
        {options.map((option) => (
            <option
                key={option.value}
                value={option.value}
                className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              {option.label}
            </option>
        ))}
      </select>
  );
};

export default Select;