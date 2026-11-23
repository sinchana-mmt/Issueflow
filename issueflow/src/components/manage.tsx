"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Field, Input, Select } from "@/components/ui";
import { DEFAULT_USER_PASSWORD, ROLES, ROLE_LABEL, TAG_COLORS, type Role } from "@/lib/constants";
import { send } from "@/lib/ui";

const projectSchema = z.object({
  name: z.string().trim().min(1),
  key: z.string().trim().min(2),
  description: z.string().optional(),
});

export function ProjectCreator() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm({ resolver: zodResolver(projectSchema), defaultValues: { name: "", key: "", description: "" } });
  return (
    <form className="grid gap-3 rounded-2xl border border-line bg-panel p-4 md:grid-cols-4" onSubmit={form.handleSubmit(async (values) => {
      setError("");
      try {
        const project = await send<{ id: string }>("/api/v1/projects", { method: "POST", body: JSON.stringify(values) });
        router.push(`/projects/${project.id}`);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not create the project");
      }
    })}>
      <Field label="Name"><Input {...form.register("name")} /></Field>
      <Field label="Key"><Input {...form.register("key")} placeholder="ECOM" /></Field>
      <Field label="Description"><Input {...form.register("description")} /></Field>
      <div className="flex items-end"><Button type="submit">Create project</Button></div>
      {error ? <p className="text-sm text-danger md:col-span-4">{error}</p> : null}
    </form>
  );
}

export function MemberControls({ projectId, users, members }: { projectId: string; users: { id: string; name: string }[]; members: { id: string }[] }) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const available = users.filter((user) => !members.some((member) => member.id === user.id));
  return (
    <div className="space-y-3">
      <form className="flex gap-2" onSubmit={async (event) => {
        event.preventDefault();
        if (!userId) return;
        await send(`/api/v1/projects/${projectId}/members`, { method: "POST", body: JSON.stringify({ userId }) });
        setUserId("");
        router.refresh();
      }}>
        <Select value={userId} onChange={(event) => setUserId(event.target.value)}>
          <option value="">Choose a person</option>
          {available.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
        </Select>
        <Button type="submit" variant="subtle">Add to project</Button>
      </form>
    </div>
  );
}

export function RemoveMember({ projectId, userId }: { projectId: string; userId: string }) {
  const router = useRouter();
  return <button className="text-xs text-faint" onClick={async () => { await send(`/api/v1/projects/${projectId}/members/${userId}`, { method: "DELETE" }); router.refresh(); }}>Remove</button>;
}

export function ArchiveProject({ projectId, archived }: { projectId: string; archived: boolean }) {
  const router = useRouter();
  return (
    <Button variant="ghost" onClick={async () => {
      await send(`/api/v1/projects/${projectId}`, { method: "PATCH", body: JSON.stringify({ status: archived ? "ACTIVE" : "ARCHIVED" }) });
      router.refresh();
    }}>{archived ? "Restore project" : "Archive project"}</Button>
  );
}

export function TagForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState<(typeof TAG_COLORS)[number]>(TAG_COLORS[0]);
  return (
    <form className="flex flex-wrap gap-2" onSubmit={async (event) => {
      event.preventDefault();
      await send(`/api/v1/projects/${projectId}/tags`, { method: "POST", body: JSON.stringify({ name, color }) });
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
  email: z.string().email(),
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

export function UserRow({ user }: { user: { id: string; name: string; role: string; active: boolean } }) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select defaultValue={user.role} onChange={async (event) => { await send(`/api/v1/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ role: event.target.value }) }); router.refresh(); }}>
        {ROLES.map((role) => <option key={role} value={role}>{ROLE_LABEL[role]}</option>)}
      </Select>
      <Button variant={user.active ? "danger" : "subtle"} onClick={async () => { await send(`/api/v1/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ active: !user.active }) }); router.refresh(); }}>
        {user.active ? "Deactivate" : "Reactivate"}
      </Button>
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
