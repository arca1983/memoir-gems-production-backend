import { redirect } from "next/navigation";

// This is the internal Memoir Gems production backend — not customer-facing.
// The customer order form lives on the real website (memoirgems.com), not here.
// Visiting the backend root sends you straight to the admin login.
export default function Home() {
  redirect("/admin");
}
