import { Suspense } from "react";
import TemplateProductionClient from "@/components/TemplateProductionClient";

export default function TemplateProductionPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "#ccc" }}>Loading print map…</div>}>
      <TemplateProductionClient />
    </Suspense>
  );
}
