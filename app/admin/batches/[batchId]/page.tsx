import AdminBatchDetail from "@/components/AdminBatchDetail";
import NavBar from "@/components/NavBar";

export default async function AdminBatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  return (
    <main className="container">
      <NavBar />
      <AdminBatchDetail batchId={batchId} />
    </main>
  );
}

