import { intervalToDuration, formatDuration } from "date-fns";

export interface FastingStage {
    name: string;
    minHours: number;
    maxHours: number | null;
    description: string;
    color: string; // Tailwind class or hex
}

export const FASTING_STAGES: FastingStage[] = [
    {
        name: "Anabolic State",
        minHours: 0,
        maxHours: 4,
        description: "Your body is digesting food and absorbing nutrients. Insulin levels are high.",
        color: "bg-green-500",
    },
    {
        name: "Catabolic State",
        minHours: 4,
        maxHours: 8,
        description: "Blood sugars fall. Insulin levels drop. The body starts to switch to stored energy.",
        color: "bg-blue-500",
    },
    {
        name: "Fat Burning",
        minHours: 8,
        maxHours: 12,
        description: "Human Growth Hormone begins to increase. You are entering the fat burning zone.",
        color: "bg-indigo-500",
    },
    {
        name: "Ketosis",
        minHours: 12,
        maxHours: 18,
        description: "The body breaks down fat into ketones for energy. Mental clarity increases.",
        color: "bg-purple-500",
    },
    {
        name: "Autophagy",
        minHours: 18,
        maxHours: 24,
        description: "Cellular cleaning. Old and damaged cells are recycled.",
        color: "bg-pink-500",
    },
    {
        name: "Deep Fasting",
        minHours: 24,
        maxHours: null,
        description: "Significant increase in HGH. Stem cell regeneration.",
        color: "bg-red-500",
    },
];

export function getCurrentStage(elapsedHours: number): FastingStage {
    return (
        FASTING_STAGES.find(
            (stage) =>
                elapsedHours >= stage.minHours &&
                (stage.maxHours === null || elapsedHours < stage.maxHours)
        ) || FASTING_STAGES[FASTING_STAGES.length - 1]
    );
}

export function calculateDuration(start: Date, end: Date = new Date()) {
    return intervalToDuration({ start, end });
}

export function getElapsedMinutes(start: Date, end: Date = new Date()): number {
    const diff = end.getTime() - start.getTime();
    return Math.floor(diff / 1000 / 60);
}

export function getProgressInStage(elapsedHours: number, stage: FastingStage): number {
    if (stage.maxHours === null) return 100;
    const stageDuration = stage.maxHours - stage.minHours;
    const elapsedInStage = elapsedHours - stage.minHours;
    return Math.min(100, Math.max(0, (elapsedInStage / stageDuration) * 100));
}
