import { redirect } from "next/navigation";
import { OrgSettings, PasswordForm, ProfileForm } from "@/components/manage";
import { ROLE_LABEL } from "@/lib/constants";
import { can } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { settingsView } from "@/server/settings";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const settings = await settingsView(actor);
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted">Your profile is here. Organization settings are for the superadmin.</p>
      </div>
      <section className="max-w-md space-y-4 rounded-2xl border border-line bg-panel p-4">
        <h3 className="text-sm font-medium">Profile</h3>
        <p className="text-sm text-muted">{actor.email} · {ROLE_LABEL[actor.role]}</p>
        <ProfileForm userId={actor.id} name={actor.name} />
        <h3 className="pt-2 text-sm font-medium">Password</h3>
        <PasswordForm />
      </section>
      {can(actor, "settings.update") ? (
        <section className="max-w-md rounded-2xl border border-line bg-panel p-4">
          <h3 className="mb-3 text-sm font-medium">Admin settings</h3>
          <OrgSettings organizationName={settings.organizationName} timezone={settings.timezone} />
        </section>
      ) : null}
    </div>
  );
}
