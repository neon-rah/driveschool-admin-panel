"use client";


import TrainingManager from "@/components/features/training/TrainingManager";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";

export default function TrainingsPage() {
    return (
        <>
            <PageBreadcrumb pageTitle="Formations"/>
            <TrainingManager/>
        </>

    );
}