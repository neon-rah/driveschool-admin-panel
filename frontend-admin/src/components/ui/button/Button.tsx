import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Texte ou contenu du bouton
  size?: "sm" | "md"; // Taille du bouton
  variant?: "primary" | "outline"; // Variante du bouton
  type?: "button" | "submit" | "reset"; // Type de bouton (ajouté)
  startIcon?: ReactNode; // Icône avant le texte
  endIcon?: ReactNode; // Icône après le texte
  onClick?: () => void; // Gestionnaire de clic
  disabled?: boolean; // État désactivé
  className?: string; // Classes supplémentaires
}

const Button: React.FC<ButtonProps> = ({
                                         children,
                                         size = "md",
                                         variant = "primary",
                                         type = "button", // Par défaut à "button" pour compatibilité
                                         startIcon,
                                         endIcon,
                                         onClick,
                                         className = "",
                                         disabled = false,
                                       }) => {
  // Classes pour la taille
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };

  // Classes pour la variante
  const variantClasses = {
    primary:
        "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
    outline:
        "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  };

  return (
      <button
          type={type} // Ajout de la prop type
          className={`inline-flex items-center justify-center font-medium gap-2 rounded-lg transition ${className} ${
              sizeClasses[size]
          } ${variantClasses[variant]} ${
              disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
          onClick={onClick}
          disabled={disabled}
      >
        {startIcon && <span className="flex items-center">{startIcon}</span>}
        {children}
        {endIcon && <span className="flex items-center">{endIcon}</span>}
      </button>
  );
};

export default Button;