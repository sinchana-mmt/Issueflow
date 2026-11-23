import { redirect } from "next/navigation";
import { TeamCreator, UserRow } from "@/components/manage";
import { ROLES, ROLE_LABEL, type Role } from "@/lib/constants";
import { can } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { listUsers } from "@/server/users";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role === "USER") redirect("/");
  const users = await listUsers(actor);
  const creatable: Role[] = actor.role === "SUPERADMIN" ? [...ROLES] : ["USER"];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Team</h2>
        <p className="text-sm text-muted">Add a person here, then add them to a project. A role is their access. A project membership is which work they can see.</p>
      </div>
      {can(actor, "user.create") ? <TeamCreator roles={creatable} /> : null}
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-faint">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Status</th>
              {can(actor, "user.update") ? <th className="px-3 py-3">Change role</th> : null}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-line">
                <td className="px-3 py-3">{user.name}</td>
                <td className="px-3 py-3 text-muted">{user.email}</td>
                <td className="px-3 py-3">{ROLE_LABEL[user.role]}</td>
                <td className="px-3 py-3">{user.active ? "Active" : "Inactive"}</td>
                {can(actor, "user.update") ? <td className="px-3 py-3">{user.id === actor.id ? "You" : <UserRow user={user} />}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
