import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getActor } from "@/lib/session";

export default async function LoginPage() {
  const actor = await getActor();
  if (actor) redirect("/");
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="w-full max-w-sm rounded-2xl border border-line bg-panel p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-faint">IssueFlow</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Accounts are created by an admin.</p>
        <LoginForm />
      </section>
    </main>
  );
}
