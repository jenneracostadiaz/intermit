"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteFastingSession, updateFastingSession } from "@/app/actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Session = {
    id: string;
    startTime: Date;
    endTime: Date | null;
    duration: number | null;
};

export function HistoryList({ sessions }: { sessions: Session[] }) {
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (sessions.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                No history available yet. Complete your first fast!
            </div>
        );
    }

    const handleDelete = async () => {
        if (!deletingId) return;
        setIsLoading(true);
        try {
            await deleteFastingSession(deletingId);
            setDeletingId(null);
        } catch (error) {
            console.error("Failed to delete session:", error);
            // Ideally show toast error
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingSession) return;
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const startDate = formData.get("startDate") as string;
        const startTime = formData.get("startTime") as string;
        const endDate = formData.get("endDate") as string;
        const endTime = formData.get("endTime") as string;

        try {
            // Combine date and time strings
            const startDateTime = new Date(`${startDate}T${startTime}`);
            const endDateTime = new Date(`${endDate}T${endTime}`);

            await updateFastingSession(editingSession.id, {
                startTime: startDateTime,
                endTime: endDateTime,
            });
            setEditingSession(null);
        } catch (error) {
            console.error("Failed to update session:", error);
            // Ideally show toast error
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to format date for input type="date" (YYYY-MM-DD)
    const formatDateInput = (date: Date) => format(date, "yyyy-MM-dd");
    // Helper to format time for input type="time" (HH:mm)
    const formatTimeInput = (date: Date) => format(date, "HH:mm");

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
                        <TableHead className="w-[50px]"></TableHead>
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
                                {session.endTime
                                    ? session.duration !== null
                                        ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}m`
                                        : "0h 0m"
                                    : "Active"}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => setEditingSession(session)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => setDeletingId(session.id)}
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Edit Dialog */}
            <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Session</DialogTitle>
                        <DialogDescription>
                            Make changes to your fasting session here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    {editingSession && (
                        <form onSubmit={handleUpdate}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right col-span-4 text-left font-semibold">Start</Label>
                                    <Label htmlFor="startDate" className="text-right">
                                        Date
                                    </Label>
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        defaultValue={formatDateInput(new Date(editingSession.startTime))}
                                        className="col-span-3"
                                        required
                                    />
                                    <Label htmlFor="startTime" className="text-right">
                                        Time
                                    </Label>
                                    <Input
                                        id="startTime"
                                        name="startTime"
                                        type="time"
                                        defaultValue={formatTimeInput(new Date(editingSession.startTime))}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right col-span-4 text-left font-semibold">End</Label>
                                    <Label htmlFor="endDate" className="text-right">
                                        Date
                                    </Label>
                                    <Input
                                        id="endDate"
                                        name="endDate"
                                        type="date"
                                        defaultValue={
                                            editingSession.endTime
                                                ? formatDateInput(new Date(editingSession.endTime))
                                                : formatDateInput(new Date())
                                        }
                                        className="col-span-3"
                                        required
                                    />
                                    <Label htmlFor="endTime" className="text-right">
                                        Time
                                    </Label>
                                    <Input
                                        id="endTime"
                                        name="endTime"
                                        type="time"
                                        defaultValue={
                                            editingSession.endTime
                                                ? formatTimeInput(new Date(editingSession.endTime))
                                                : formatTimeInput(new Date())
                                        }
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingSession(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Saving..." : "Save changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this fasting session from our
                            servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLoading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
