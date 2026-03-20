import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a Price Watch account to start tracking prices and saving money.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
