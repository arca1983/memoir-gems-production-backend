import AdminOrderDetail from "@/components/AdminOrderDetail";
import NavBar from "@/components/NavBar";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return (
    <main className="container">
      <NavBar />
      <AdminOrderDetail orderNumber={decodeURIComponent(orderNumber)} />
    </main>
  );
}

