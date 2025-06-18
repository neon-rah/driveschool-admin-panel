"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
// import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.ComponentProps<"input"> {
    label?: string;
    regex?: RegExp | ((value: string) => boolean);
    errorMessage?: string;
    requirementMessage?: string;
    onValidationChange?: (isValid: boolean, value?: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type,
            label,
            regex,
            errorMessage,
            requirementMessage,
            onValidationChange,
            value: controlledValue,
            onChange: controlledOnChange,
            ...props
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = useState("");
        const [isValid, setIsValid] = useState(true); // Default to true if no regex
        const [isTouched, setIsTouched] = useState(false);
        const [showPassword, setShowPassword] = useState(false);

        // Use controlled value if provided, otherwise internal state
        const value = controlledValue !== undefined ? controlledValue : internalValue;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;

            // If controlled, call parent's onChange
            if (controlledOnChange) {
                controlledOnChange(e);
            } else {
                setInternalValue(val);
            }
            setIsTouched(true);

            // Only validate if regex is provided
            if (regex) {
                const valid =
                    regex instanceof RegExp ? regex.test(val) : regex(val);
                setIsValid(valid);
                onValidationChange?.(valid, val);
            } else {
                // If no regex, consider it valid unless empty (optional behavior)
                setIsValid(val.length > 0); // Valid if value exists, adjust as needed
                onValidationChange?.(val.length > 0, val);
            }
        };

        return (
            <div className="w-full relative">
                {label && (
                    <label className="block pl-1 text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        name={props.name}
                        type={
                            type === "password" ? (showPassword ? "text" : "password") : type
                        }
                        value={value}
                        className={cn(
                            "flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500",
                            !isValid && isTouched && regex
                                ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                                : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300",
                            className
                        )}
                        ref={ref}
                        onChange={handleChange}
                        {...props}
                    />
                    {type === "password" && (
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {/* {showPassword ? <EyeOff size={20} /> : <Eye size={20} />} */}
                            {/* Placeholder for icon */}
                            <span>{showPassword ? "Hide" : "Show"}</span>
                        </button>
                    )}
                </div>
                {isTouched && requirementMessage && (
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {requirementMessage}
                    </p>
                )}
                {isTouched && !isValid && regex && errorMessage && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errorMessage}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };