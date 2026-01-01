"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

type Session = {
    id: string;
    startTime: Date;
    endTime: Date | null;
    duration: number | null;
};

export function HistoryList({ sessions }: { sessions: Session[] }) {
    if (sessions.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                No history available yet. Complete your first fast!
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableCaption>A list of your recent fasting sessions.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.map((session) => (
                        <TableRow key={session.id}>
                            <TableCell className="font-medium">
                                {format(new Date(session.startTime), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                                {format(new Date(session.startTime), "h:mm a")}
                            </TableCell>
                            <TableCell>
                                {session.endTime ? format(new Date(session.endTime), "h:mm a") : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                                {session.duration ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}m` : "Active"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
