import { getActiveFastingSession, getFastingHistory, getUser } from "./actions";
import { FastingCard } from "@/components/fasting-card";
import { HistoryList } from "@/components/history-list";
import { stackServerApp } from "@/stack";
import { UserButton } from "@stackframe/stack";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getUser();
  // We can also use stackServerApp.getUser() directly but using helper action ensures we have DB logic if needed later

  if (!user) {
    // If no user, StackProvider should show login or we can redirect
    // But Stack Auth usually handles auth protection if configured or we just show a landing page
    // For now, let's assume if no user, show a simple landing.
    // However, StackProvider wraps layout, so authentication state interacts with client.
    // For server rendering, we check user.
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground space-y-4">
        <h1 className="text-4xl font-bold">Intermittent Fasting</h1>
        <p className="text-lg text-muted-foreground">Sign in to start tracking.</p>
        {/* Stack Auth provides UI components for signin but usually via handler/link */}
        <div className="p-4 border rounded">
          Please sign in using the Stack Auth UI (usually redirects automatically or available at /handler/sign-in)
        </div>
        {/* In Stack Auth, usually we use UserButton or just redirect to sign-in */}
      </div>
    );
  }

  const activeSession = await getActiveFastingSession();
  const history = await getFastingHistory();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl">Intermittent<span className="text-primary">Fasting</span></div>
          <div className="flex items-center gap-4">
            {/* Stack Auth User Button */}
            <UserButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        <section className="flex justify-center">
          <FastingCard activeSession={activeSession} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Recent History</h2>
          <HistoryList sessions={history} />
        </section>
      </main>
    </div>
  );
}
