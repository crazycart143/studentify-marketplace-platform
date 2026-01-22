import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin for the adapter
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          console.error("Supabase Auth error:", error?.message);
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          image: data.user.user_metadata?.avatar_url,
        };
      }
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    schema: 'next_auth',
  } as any),
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  callbacks: {
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async signIn({ user, account }: any) {
      if (account?.provider === "credentials") {
        return true;
      }

      // For OAuth providers, ensure profile exists in public.profiles
      if (user.email) {
        try {
          const { data: profile, error: selectError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

          if (selectError) {
            console.error("[signIn callback] Select error:", selectError);
          }

          if (!profile) {
            console.log("[signIn callback] Creating profile for new user:", user.email);
            const { error: insertError } = await supabase.from("profiles").insert({
              id: user.id,
              full_name: user.name,
              avatar_url: user.image,
              username: user.email.split("@")[0],
              role: "buyer",
            });
            
            if (insertError) {
              console.error("[signIn callback] Insert error:", insertError);
            }
          }
        } catch (err) {
          console.error("[signIn callback] Unexpected error:", err);
        }
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
