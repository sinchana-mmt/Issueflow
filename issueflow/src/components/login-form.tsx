"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Field, Input } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
});

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setError("");
        const result = await authClient.signIn.email(values);
        if (result.error) {
          setError(result.error.message || "Those credentials were not accepted");
          return;
        }
        router.push("/");
        router.refresh();
      })}
    >
      <Field label="Email">
        <Input type="email" autoComplete="username" {...form.register("email")} />
      </Field>
      <Field label="Password">
        <Input type="password" autoComplete="current-password" {...form.register("password")} />
      </Field>
      {form.formState.errors.email || form.formState.errors.password || error ? (
        <p className="text-sm text-danger">{error || form.formState.errors.email?.message || form.formState.errors.password?.message}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
