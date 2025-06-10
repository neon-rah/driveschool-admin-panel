"use client";

import { CourseProvider } from "@/contexts/CourseContext";
import CourseManager from "@/components/features/course/CourseManager";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";

export default function CoursesPage() {
    return (
        <CourseProvider>
            <PageBreadcrumb pageTitle="Les Cours" />
            <CourseManager/>
        </CourseProvider>
    );
}