import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { runtimeEnv } from "@/lib/env";

const env = process.env;

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: runtimeEnv.authUrl(),
  trustedOrigins: [runtimeEnv.authUrl(), "http://localhost:3000"],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
        input: false,
      },
      active: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 600, max: 20 },
    },
  },
  advanced: {
    useSecureCookies: runtimeEnv.authUrl().startsWith("https://"),
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { active: true },
          });
          if (!user?.active) return false;
          return { data: session };
        },
      },
    },
  },
});
