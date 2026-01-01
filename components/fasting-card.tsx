"use client";

import { useTransition, useState, useEffect } from "react";
import { startFastingSession, stopFastingSession } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FastingStage, getCurrentStage, getElapsedMinutes, getProgressInStage } from "@/lib/fasting";
import { formatDuration, intervalToDuration } from "date-fns";

type Session = {
    id: string;
    startTime: Date;
    endTime: Date | null;
    duration: number | null;
} | null;

export function FastingCard({ activeSession }: { activeSession: Session }) {
    const [isPending, startTransition] = useTransition();
    const [elapsedMinutes, setElapsedMinutes] = useState(0);

    // Update timer
    useEffect(() => {
        if (!activeSession) {
            setElapsedMinutes(0);
            return;
        }

        const update = () => {
            setElapsedMinutes(getElapsedMinutes(new Date(activeSession.startTime)));
        };

        update();
        const interval = setInterval(update, 1000 * 60); // Update every minute
        return () => clearInterval(interval);
    }, [activeSession]);

    const elapsedHours = elapsedMinutes / 60;
    const currentStage = getCurrentStage(elapsedHours);
    const stageProgress = getProgressInStage(elapsedHours, currentStage);

    const handleStart = () => {
        startTransition(async () => {
            await startFastingSession();
        });
    };

    const handleStop = () => {
        startTransition(async () => {
            await stopFastingSession();
        });
    };

    // Format Duration string
    const durationObj = intervalToDuration({ start: 0, end: elapsedMinutes * 60 * 1000 });
    const timeString = `${durationObj.hours ?? 0}h ${durationObj.minutes ?? 0}m`;

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-2">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                    {activeSession ? "You are Fasting" : "Ready to Fast?"}
                </CardTitle>
                <CardDescription>
                    {activeSession
                        ? `Started at ${new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : "Start a new session to track your progress."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {activeSession ? (
                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="text-5xl font-mono font-bold tracking-wider text-primary">
                                {timeString}
                            </div>
                            <p className="text-muted-foreground mt-2 text-sm">Elapsed Time</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>{currentStage.name}</span>
                                <span className="text-muted-foreground">{Math.round(stageProgress)}%</span>
                            </div>
                            <Progress value={stageProgress} className={`h-3 ${currentStage.color}`} />
                            <p className="text-xs text-muted-foreground">{currentStage.description}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Press start to begin your journey.
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
                {activeSession ? (
                    <Button
                        variant="destructive"
                        size="lg"
                        onClick={handleStop}
                        disabled={isPending}
                        className="w-full"
                    >
                        {isPending ? "Stopping..." : "End Fast"}
                    </Button>
                ) : (
                    <Button
                        variant="default"
                        size="lg"
                        onClick={handleStart}
                        disabled={isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                    >
                        {isPending ? "Starting..." : "Start Fast"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
