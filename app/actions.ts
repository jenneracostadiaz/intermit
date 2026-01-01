"use server";

import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack";
import { revalidatePath } from "next/cache";

export async function getUser() {
    return await stackServerApp.getUser();
}

export async function getActiveFastingSession() {
    const user = await getUser();
    if (!user) return null;

    // Find a session created by this user that has no end time
    const session = await prisma.fastingSession.findFirst({
        where: {
            userId: user.id,
            endTime: null,
        },
        orderBy: {
            startTime: "desc",
        },
    });

    return session;
}

export async function startFastingSession(startTime: Date = new Date()) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    // Check if active session exists
    const active = await getActiveFastingSession();
    if (active) throw new Error("A fasting session is already active.");

    // Check if user exists in DB, if not create (sync with Stack Auth)
    // Or assume we sync on login or just lazy create
    // Prudent to upsert or check. Stack Auth 'user.id' is stable.
    // We'll try to find the user in our DB first
    let dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
        dbUser = await prisma.user.create({
            data: {
                id: user.id,
                email: user.primaryEmail || "", // Stack Auth user has primaryEmail
            },
        });
    }

    const session = await prisma.fastingSession.create({
        data: {
            userId: user.id,
            startTime: startTime,
        },
    });

    revalidatePath("/");
    return session;
}

export async function stopFastingSession() {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const active = await getActiveFastingSession();
    if (!active) throw new Error("No active session found.");

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - active.startTime.getTime()) / 1000 / 60);

    const session = await prisma.fastingSession.update({
        where: { id: active.id },
        data: {
            endTime,
            duration,
        },
    });

    revalidatePath("/");
    return session;
}

export async function getFastingHistory() {
    const user = await getUser();
    if (!user) return [];

    return await prisma.fastingSession.findMany({
        where: {
            userId: user.id,
            endTime: { not: null },
        },
        orderBy: {
            startTime: "desc",
        },
    });
}

export async function deleteFastingSession(sessionId: string) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.fastingSession.delete({
        where: {
            id: sessionId,
            userId: user.id, // Ensure user owns the session
        },
    });

    revalidatePath("/");
}

export async function updateFastingSession(
    sessionId: string,
    data: { startTime: Date; endTime: Date }
) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const duration = Math.floor(
        (data.endTime.getTime() - data.startTime.getTime()) / 1000 / 60
    );

    if (duration < 0) {
        throw new Error("End time cannot be before start time");
    }

    await prisma.fastingSession.update({
        where: {
            id: sessionId,
            userId: user.id,
        },
        data: {
            startTime: data.startTime,
            endTime: data.endTime,
            duration,
        },
    });

    revalidatePath("/");
}
