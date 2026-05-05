import type React from "react";

interface CheckboxProps {
  label?: string;
  checked: boolean;
  className?: string;
  id?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  id,
  onChange,
  className = "",
  disabled = false,
  size = "md",
}) => {
  const sizeMap = {
    sm: { box: "w-4 h-4", icon: "w-3 h-3", },
    md: { box: "w-5 h-5", icon: "w-3.5 h-3.5", },
    lg: { box: "w-10 h-10", icon: "w-6 h-6", },
  };
  const currentSize = sizeMap[size];
  return (
    <label
      className={`flex items-center space-x-3 group cursor-pointer ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      <div className={`relative ${currentSize.box}`}>
        <input
          id={id}
          type="checkbox"
          className={`appearance-none cursor-pointer border border-gray-300 rounded-md checked:bg-brand-500 checked:border-transparent dark:border-gray-700 disabled:opacity-60 
          ${currentSize.box} ${className}`}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        {checked && (
          <svg
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none ${currentSize.icon}`}
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {disabled && (
          <svg
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none ${currentSize.icon}`}
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="#E4E7EC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
