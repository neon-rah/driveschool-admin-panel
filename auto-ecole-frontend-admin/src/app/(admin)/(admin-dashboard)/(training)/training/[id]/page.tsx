"use client";

import React from "react";
import TrainingDetail from "./TrainingDetail";

export default function TrainingPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params); // Déballer la Promise avec React.use()
    const trainingId = parseInt(resolvedParams.id, 10);

    if (isNaN(trainingId)) {
        return <div>Erreur : ID invalide</div>;
    }

    return <TrainingDetail trainingId={trainingId} />;
}