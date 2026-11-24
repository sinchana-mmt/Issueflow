import { redirect } from "next/navigation";
import { CompanyCreator, TeamCreator, UserRow } from "@/components/manage";
import { ROLES, ROLE_LABEL, type Role } from "@/lib/constants";
import { can } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { listCompanies } from "@/server/companies";
import { listUsers } from "@/server/users";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role === "USER") redirect("/");
  const [users, companies] = await Promise.all([listUsers(actor), listCompanies(actor)]);
  const creatable: Role[] = actor.role === "SUPERADMIN" ? [...ROLES] : ["USER"];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Team</h2>
        <p className="text-sm text-muted">Add people with their company email. A role is what they can do. Delegation lets them administer one company without being a superadmin.</p>
      </div>
      {can(actor, "company.create") ? <CompanyCreator /> : null}
      {can(actor, "user.create") ? <TeamCreator roles={creatable} /> : null}
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-faint">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Status</th>
              {can(actor, "user.update") ? <th className="px-3 py-3">Access</th> : null}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-line align-top">
                <td className="px-3 py-3">{user.name}</td>
                <td className="px-3 py-3 text-muted">{user.email}</td>
                <td className="px-3 py-3">{ROLE_LABEL[user.role]}</td>
                <td className="px-3 py-3">{user.active ? "Active" : "Inactive"}</td>
                {can(actor, "user.update") ? (
                  <td className="px-3 py-3">
                    {user.id === actor.id ? "You" : (
                      <UserRow
                        user={user}
                        companies={companies}
                        canDelete={can(actor, "user.delete")}
                        canDelegate={actor.role === "SUPERADMIN"}
                      />
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
