import React, { FC, useState } from "react";
import Label from "@/components/form/Label";

interface InputProps {
    type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
    id?: string;
    name?: string;
    placeholder?: string;
    require?: boolean;
    value?: string | number; // Valeur contrôlée
    defaultValue?: string | number; // Valeur par défaut pour cas non contrôlés
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    min?: string;
    max?: string;
    step?: number;
    disabled?: boolean;
    success?: boolean;
    error?: boolean; // État d'erreur manuel
    hint?: string; // Texte d'indication
    label?: string; // Label du deuxième composant
    regex?: RegExp | ((value: string) => boolean); // Validation via regex
    errorMessage?: string; // Message d'erreur personnalisé
    requirementMessage?: string; // Message de requis
    onValidationChange?: (isValid: boolean, value?: string) => void; // Callback de validation
}

const Input: FC<InputProps> = ({
                                   type = "text",
                                   id,
                                   name,        
                                   placeholder,
                                   value,
                                   defaultValue,
                                   onChange,
                                   className = "",
                                   min,
                                   max,
                                   step,
                                   disabled = false,
                                   success = false,
                                   error = false,
                                   hint,
                                   label,
                                   regex,
                                   errorMessage,
                                   requirementMessage,
                                   onValidationChange,
                                    require=false
                               }) => {
    const [internalValue, setInternalValue] = useState<string>(defaultValue?.toString() || "");
    const [isValid, setIsValid] = useState<boolean>(true); // Valide par défaut si pas de regex
    const [isTouched, setIsTouched] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // Utilise la valeur contrôlée si fournie, sinon la valeur interne
    const inputValue = value !== undefined ? value.toString() : internalValue;

    // Gestion des changements
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        // Si contrôlé, appelle onChange du parent
        if (onChange) {
            onChange(e);
        } else {
            setInternalValue(val);
        }
        setIsTouched(true);

        // Validation avec regex si fourni
        if (regex) {
            const valid = regex instanceof RegExp ? regex.test(val) : regex(val);
            setIsValid(valid);
            onValidationChange?.(valid, val);
        } else {
            // Si pas de regex, valide si non vide (comportement ajustable)
            setIsValid(val.length > 0);
            onValidationChange?.(val.length > 0, val);
        }
    };

    // Styles de base pour l’input (thème du composant 1)
    let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${className}`;

    // Ajout des styles en fonction de l’état
    if (disabled) {
        inputClasses += ` text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
    } else if (error || (isTouched && !isValid && regex)) {
        inputClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500`;
    } else if (success) {
        inputClasses += ` text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300 dark:text-success-400 dark:border-success-500`;
    } else {
        inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
    }

    return (
        <div className="relative w-full">
            {/* Label (optionnel) */}
            {label && (
                <Label>
                    {label}
                </Label>
            )}

            {/* Conteneur de l'input */}
            <div className="relative">
                <input
                    type={type === "password" ? (showPassword ? "text" : "password") : type}
                    id={id}
                    name={name}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={handleChange}
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                    className={inputClasses}
                    required={require}
                />

                {/* Bouton pour afficher/masquer le mot de passe */}
                {type === "password" && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <span>{showPassword ? "Hide" : "Show"}</span>
                    </button>
                )}
            </div>

            {/* Messages d’indication */}
            {isTouched && requirementMessage && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {requirementMessage}
                </p>
            )}
            {(isTouched && !isValid && regex && errorMessage) || hint ? (
                <p
                    className={`mt-1.5 text-xs ${
                        (error || (isTouched && !isValid && regex)) ? "text-error-500" : success ? "text-success-500" : "text-gray-500"
                    }`}
                >
                    {(isTouched && !isValid && regex && errorMessage) || hint}
                </p>
            ) : null}
        </div>
    );
};

export default Input;