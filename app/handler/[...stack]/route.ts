import { stackServerApp } from "@/stack";
import { StackHandler } from "@stackframe/stack";

export const GET = StackHandler({ app: stackServerApp });
export const POST = StackHandler({ app: stackServerApp });
