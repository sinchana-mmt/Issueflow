import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">That page is not available</h1>
        <Link href="/" className="mt-3 inline-block text-sm text-accent-2">Back to overview</Link>
      </div>
    </main>
  );
}
