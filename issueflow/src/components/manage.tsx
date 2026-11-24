"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Field, Input, Select } from "@/components/ui";
import { DEFAULT_USER_PASSWORD, ROLES, ROLE_LABEL, TAG_COLORS, type Role } from "@/lib/constants";
import { workEmail } from "@/lib/email";
import { send } from "@/lib/ui";

const companySchema = z.object({
  name: z.string().trim().min(1),
  key: z.string().trim().min(2),
});

export function CompanyCreator() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm({ resolver: zodResolver(companySchema), defaultValues: { name: "", key: "" } });
  return (
    <form className="grid gap-3 rounded-2xl border border-line bg-panel p-4 md:grid-cols-3" onSubmit={form.handleSubmit(async (values) => {
      setError("");
      try {
        await send("/api/v1/companies", { method: "POST", body: JSON.stringify(values) });
        form.reset({ name: "", key: "" });
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not add the company");
      }
    })}>
      <Field label="Company"><Input {...form.register("name")} placeholder="Mysore Minds" /></Field>
      <Field label="Code"><Input {...form.register("key")} placeholder="MM" /></Field>
      <div className="flex items-end"><Button type="submit">Add company</Button></div>
      {error ? <p className="text-sm text-danger md:col-span-3">{error}</p> : null}
    </form>
  );
}

export function TagForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState<(typeof TAG_COLORS)[number]>(TAG_COLORS[0]);
  return (
    <form className="flex flex-wrap gap-2" onSubmit={async (event) => {
      event.preventDefault();
      await send(`/api/v1/companies/${companyId}/tags`, { method: "POST", body: JSON.stringify({ name, color }) });
      setName("");
      router.refresh();
    }}>
      <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tag name" />
      <Select value={color} onChange={(event) => setColor(event.target.value as typeof color)}>
        {TAG_COLORS.map((item) => <option key={item} value={item}>{item}</option>)}
      </Select>
      <Button type="submit" variant="subtle">Add tag</Button>
    </form>
  );
}

export function TagRow({ tag }: { tag: { id: string; name: string; color: string } }) {
  const router = useRouter();
  const [name, setName] = useState(tag.name);
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full" style={{ background: tag.color }} />
      <Input value={name} onChange={(event) => setName(event.target.value)} />
      <Button variant="ghost" onClick={async () => { await send(`/api/v1/tags/${tag.id}`, { method: "PATCH", body: JSON.stringify({ name }) }); router.refresh(); }}>Rename</Button>
      <Button variant="danger" onClick={async () => { await send(`/api/v1/tags/${tag.id}`, { method: "DELETE" }); router.refresh(); }}>Delete</Button>
    </div>
  );
}

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().trim().refine((value) => workEmail(value) !== null, "Use a real company email address"),
  role: z.enum(ROLES),
});

export function TeamCreator({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm({ resolver: zodResolver(userSchema), defaultValues: { name: "", email: "", role: "USER" as Role } });
  return (
    <form className="grid gap-3 rounded-2xl border border-line bg-panel p-4 md:grid-cols-4" onSubmit={form.handleSubmit(async (values) => {
      setError("");
      try {
        await send("/api/v1/users", { method: "POST", body: JSON.stringify({ ...values, password: DEFAULT_USER_PASSWORD }) });
        form.reset({ name: "", email: "", role: "USER" });
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not create the user");
      }
    })}>
      <Field label="Name"><Input {...form.register("name")} /></Field>
      <Field label="Email"><Input type="email" {...form.register("email")} /></Field>
      <Field label="Role">
        <Select {...form.register("role")}>{roles.map((role) => <option key={role} value={role}>{ROLE_LABEL[role]}</option>)}</Select>
      </Field>
      <div className="flex items-end"><Button type="submit">Add person</Button></div>
      <p className="text-sm text-muted md:col-span-4">Their password is {DEFAULT_USER_PASSWORD}. They can change it in Settings.</p>
      {error ? <p className="text-sm text-danger md:col-span-4">{error}</p> : null}
    </form>
  );
}

export function UserRow({
  user,
  companies,
  canDelete,
  canDelegate,
}: {
  user: { id: string; name: string; email: string; role: string; active: boolean; companies: { companyId: string; delegated: boolean }[] };
  companies: { id: string; name: string }[];
  canDelete: boolean;
  canDelegate: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState("");
  async function run(task: () => Promise<unknown>) {
    setError("");
    try {
      await task();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update this person");
    }
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input className="h-9 max-w-56" type="email" value={email} onChange={(event) => setEmail(event.target.value)} onBlur={() => { if (email.trim().toLowerCase() !== user.email) void run(() => send(`/api/v1/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ email }) })); }} />
        <Select defaultValue={user.role} onChange={(event) => void run(() => send(`/api/v1/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ role: event.target.value }) }))}>
          {ROLES.map((role) => <option key={role} value={role}>{ROLE_LABEL[role]}</option>)}
        </Select>
        <Button variant={user.active ? "danger" : "subtle"} onClick={() => void run(() => send(`/api/v1/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ active: !user.active }) }))}>
          {user.active ? "Deactivate" : "Reactivate"}
        </Button>
        {canDelete ? <Button variant="danger" onClick={() => void run(async () => { if (!window.confirm(`Delete ${user.name}?`)) return; await send(`/api/v1/users/${user.id}`, { method: "DELETE" }); })}>Delete</Button> : null}
      </div>
      <div className="flex flex-wrap gap-3">
        {companies.map((company) => {
          const membership = user.companies.find((item) => item.companyId === company.id);
          return (
            <label key={company.id} className="flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={Boolean(membership)}
                onChange={(event) => void run(async () => {
                  if (event.target.checked) await send(`/api/v1/companies/${company.id}/members`, { method: "POST", body: JSON.stringify({ userId: user.id, delegated: false }) });
                  else await send(`/api/v1/companies/${company.id}/members/${user.id}`, { method: "DELETE" });
                })}
              />
              {company.name}
              {canDelegate && membership ? (
                <span className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={membership.delegated}
                    onChange={(event) => void run(() => send(`/api/v1/companies/${company.id}/members`, { method: "POST", body: JSON.stringify({ userId: user.id, delegated: event.target.checked }) }))}
                  />
                  Delegate
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function ProfileForm({ userId, name }: { userId: string; name: string }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [message, setMessage] = useState("");
  return (
    <form className="max-w-md space-y-3" onSubmit={async (event) => {
      event.preventDefault();
      setMessage("");
      try {
        await send(`/api/v1/users/${userId}`, { method: "PATCH", body: JSON.stringify({ name: value }) });
        setMessage("Profile saved");
        router.refresh();
      } catch (caught) {
        setMessage(caught instanceof Error ? caught.message : "Could not save your profile");
      }
    }}>
      <Field label="Your name"><Input value={value} onChange={(event) => setValue(event.target.value)} /></Field>
      <Button type="submit">Save profile</Button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </form>
  );
}

export function PasswordForm() {
  const [message, setMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  return (
    <form className="max-w-md space-y-3" onSubmit={async (event) => {
      event.preventDefault();
      setMessage("");
      try {
        await send("/api/v1/users/me/password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });
        setCurrentPassword("");
        setNewPassword("");
        setMessage("Password updated");
      } catch (caught) {
        setMessage(caught instanceof Error ? caught.message : "Could not change the password");
      }
    }}>
      <Field label="Current password"><Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></Field>
      <Field label="New password"><Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></Field>
      <Button type="submit">Change password</Button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </form>
  );
}

export function OrgSettings({ organizationName, timezone }: { organizationName: string; timezone: string }) {
  const router = useRouter();
  const [name, setName] = useState(organizationName);
  const [zone, setZone] = useState(timezone);
  const [message, setMessage] = useState("");
  return (
    <form className="max-w-md space-y-3" onSubmit={async (event) => {
      event.preventDefault();
      try {
        await send("/api/v1/settings", { method: "PATCH", body: JSON.stringify({ organizationName: name, timezone: zone }) });
        setMessage("Settings saved");
        router.refresh();
      } catch (caught) {
        setMessage(caught instanceof Error ? caught.message : "Could not save settings");
      }
    }}>
      <Field label="Organization name"><Input value={name} onChange={(event) => setName(event.target.value)} /></Field>
      <Field label="Reminder timezone"><Input value={zone} onChange={(event) => setZone(event.target.value)} placeholder="UTC" /></Field>
      <Button type="submit">Save settings</Button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </form>
  );
}

export function NotificationActions() {
  const router = useRouter();
  return <Button variant="ghost" onClick={async () => { await send("/api/v1/notifications/read", { method: "POST", body: JSON.stringify({ all: true }) }); router.refresh(); }}>Mark all read</Button>;
}

export function ReadOne({ id }: { id: string }) {
  const router = useRouter();
  return <button className="text-xs text-accent-2" onClick={async () => { await send("/api/v1/notifications/read", { method: "POST", body: JSON.stringify({ id }) }); router.refresh(); }}>Mark read</button>;
}

export function DeleteFilter({ id }: { id: string }) {
  const router = useRouter();
  return <button className="text-xs text-faint" onClick={async () => { await send(`/api/v1/filters/${id}`, { method: "DELETE" }); router.refresh(); }}>Delete</button>;
}
