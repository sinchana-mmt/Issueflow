import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteFilter } from "@/components/manage";
import { getActor } from "@/lib/session";
import { listFilters } from "@/server/filters";

export const metadata = { title: "Saved filters" };

export default async function FiltersPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const filters = await listFilters(actor);
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Saved filters</h2>
      <p className="text-sm text-muted">Filters are private to your account.</p>
      <div className="space-y-2">
        {filters.length === 0 ? <p className="text-sm text-faint">Save a filter from All Issues.</p> : null}
        {filters.map((filter) => (
          <div key={filter.id} className="flex items-center justify-between rounded-2xl border border-line bg-panel px-4 py-3">
            <Link href={`/issues?${filter.queryString}`} className="text-sm">{filter.name}</Link>
            <DeleteFilter id={filter.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
