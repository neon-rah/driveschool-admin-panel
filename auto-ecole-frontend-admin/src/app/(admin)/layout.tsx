"use client";

import React from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { StudentProvider } from "@/contexts/StudentContext";
import { TrainingProvider } from "@/contexts/TrainingContext";
import { CourseProvider } from "@/contexts/CourseContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import {StatisticsProvider} from "@/contexts/StatisticsContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
      ? "ml-0"
      : isExpanded || isHovered
          ? "lg:ml-[290px]"
          : "lg:ml-[90px]";

  return (
      <StudentProvider>
        <TrainingProvider>
          <CourseProvider>
            <CategoryProvider>
              <StatisticsProvider>
              <div className="min-h-screen xl:flex">
                {/* Sidebar and Backdrop */}
                <AppSidebar />
                <Backdrop />
                {/* Main Content Area */}
                <div
                    className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
                >
                  {/* Header */}
                  <AppHeader />
                  {/* Page Content */}
                  <div className="p-4 mx-auto max-w-7xl md:p-6">{children}</div>
                </div>
              </div>
              </StatisticsProvider>
            </CategoryProvider>
          </CourseProvider>
        </TrainingProvider>
      </StudentProvider>
  )
}