// components/EcommerceMetrics.tsx
"use client";

import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, ArrowDownIcon, BoxIconLine, GroupIcon } from "@/icons";
import { useStatistics } from "@/contexts/StatisticsContext";

export const EcommerceMetrics = () => {
  const { totalStudents, completedTrainings, globalSuccessRate } = useStatistics();

  return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {/* Étudiants inscrits */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Étudiants inscrits
                        </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {totalStudents}
              </h4>
            </div>
            {/*<Badge color="success">*/}
            {/*  <ArrowUpIcon />*/}
            {/*  5% /!* À calculer dynamiquement si nécessaire *!/*/}
            {/*</Badge>*/}
          </div>
        </div>

        {/* Formations terminées */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Formations terminées
                        </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {completedTrainings}
              </h4>
            </div>
            {/*<Badge color="success">*/}
            {/*  <ArrowUpIcon />*/}
            {/*  2%*/}
            {/*</Badge>*/}
          </div>
        </div>

        {/* Taux de réussite global */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Taux de réussite global
                        </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {globalSuccessRate.toFixed(1)}%
              </h4>
            </div>
            {/*<Badge color="success">*/}
            {/*  <ArrowUpIcon />*/}
            {/*  3%*/}
            {/*</Badge>*/}
          </div>
        </div>
      </div>
  );
};