"use client";

import React, { useState, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import dynamic from "next/dynamic";
import { useStatistics } from "@/contexts/StatisticsContext";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function SuccessRateChart() {
  const { monthlySuccessRates } = useStatistics();
  const [period, setPeriod] = useState<"mensuel" | "trimestriel" | "annuel">("mensuel");
  const [chartData, setChartData] = useState<number[]>(monthlySuccessRates);
  const [chartCategories, setChartCategories] = useState<string[]>([
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
  ]);

  // Fonction pour regrouper les données selon la période
  useEffect(() => {
    if (period === "mensuel") {
      // Afficher les données mensuelles telles quelles
      setChartData(monthlySuccessRates);
      setChartCategories(["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]);
    } else if (period === "trimestriel") {
      // Regrouper les données par trimestre (moyenne des 3 mois)
      const quarterlyData = [];
      const quarterlyCategories = ["T1", "T2", "T3", "T4"];
      for (let i = 0; i < 12; i += 3) {
        const quarterValues = monthlySuccessRates.slice(i, i + 3);
        const average = quarterValues.length > 0 ? quarterValues.reduce((a, b) => a + b, 0) / quarterValues.length : 0;
        quarterlyData.push(Math.round(average * 100) / 100); // Arrondir à 2 décimales
      }
      setChartData(quarterlyData);
      setChartCategories(quarterlyCategories);
    } else if (period === "annuel") {
      // Calculer la moyenne annuelle
      const annualAverage =
          monthlySuccessRates.length > 0
              ? monthlySuccessRates.reduce((a, b) => a + b, 0) / monthlySuccessRates.length
              : 0;
      setChartData([Math.round(annualAverage * 100) / 100]); // Arrondir à 2 décimales
      setChartCategories(["Année"]);
    }
  }, [period, monthlySuccessRates]);

  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "straight",
      width: [2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        formatter: (val, { dataPointIndex }) => chartCategories[dataPointIndex], // Afficher le nom de la période
      },
      y: {
        formatter: (val) => `${val}%`, // Afficher le taux de réussite avec le symbole %
      },
    },
    xaxis: {
      type: "category",
      categories: chartCategories, // Utiliser les catégories dynamiques
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (val) => `${val}%`,
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Taux de réussite",
      data: chartData,
    },
  ];

  return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Évolution du taux de réussite
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Taux de réussite {period} sur l'année
            </p>
          </div>
          <div className="flex items-start w-full gap-3 sm:justify-end">
            <ChartTab onPeriodChange={setPeriod} />
          </div>
        </div>
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px] xl:min-w-full">
            <ReactApexChart options={options} series={series} type="area" height={310} />
          </div>
        </div>
      </div>
  );
}