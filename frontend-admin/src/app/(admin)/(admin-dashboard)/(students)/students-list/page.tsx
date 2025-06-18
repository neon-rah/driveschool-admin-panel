"use client";


import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import StudentManager from "@/components/features/student/StudentManager";

export default function StudentListePage() {
    return (
        <>
            <PageBreadcrumb pageTitle="Liste des étudiants" />
        <StudentManager/>
        </>
    );
}