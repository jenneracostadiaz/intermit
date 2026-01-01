import { stackServerApp } from "@/stack";
import { StackHandler } from "@stackframe/stack";
import { Suspense } from "react";

export default function Handler(props: any) {
    return (
        <Suspense>
            <StackHandler fullPage app={stackServerApp} {...props} />
        </Suspense>
    );
}
