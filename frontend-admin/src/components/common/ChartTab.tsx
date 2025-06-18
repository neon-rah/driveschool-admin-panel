import React, { useState } from "react";

interface ChartTabProps {
    onPeriodChange: (period: "mensuel" | "trimestriel" | "annuel") => void;
}

const ChartTab: React.FC<ChartTabProps> = ({ onPeriodChange }) => {
    const [selected, setSelected] = useState<"mensuel" | "trimestriel" | "annuel">("mensuel");

    const getButtonClass = (option: "mensuel" | "trimestriel" | "annuel") =>
        selected === option
            ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            : "text-gray-500 dark:text-gray-400";

    const handlePeriodChange = (period: "mensuel" | "trimestriel" | "annuel") => {
        setSelected(period);
        onPeriodChange(period); // Notifier le parent du changement
    };

    return (
        <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            <button
                onClick={() => handlePeriodChange("mensuel")}
                className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass("mensuel")}`}
            >
                Mensuel
            </button>
            <button
                onClick={() => handlePeriodChange("trimestriel")}
                className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass("trimestriel")}`}
            >
                Trimestriel
            </button>
            <button
                onClick={() => handlePeriodChange("annuel")}
                className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass("annuel")}`}
            >
                Annuel
            </button>
        </div>
    );
};

export default ChartTab;