import { useEffect, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  loading?: boolean;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Seleccione",
  onChange,
  className = "",
  defaultValue = "",
  loading = false,
  disabled = false,
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange(value);
  };

  /* LOADING */
  if (loading) {
    return (
        <div className="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 animate-pulse dark:border-gray-700 dark:bg-gray-800" />
    );
  }

  return (
      <select
          value={selectedValue}
          onChange={handleChange}
          disabled={disabled}
          className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs
      focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
      dark:border-gray-700 dark:bg-gray-900 dark:text-white/90
      ${
              selectedValue
                  ? "text-gray-800 dark:text-white"
                  : "text-gray-400 dark:text-gray-400"
          }
      ${disabled ? "opacity-60 cursor-not-allowed" : ""}
      ${className}`}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>

        {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
        ))}
      </select>
  );
};

export default Select;