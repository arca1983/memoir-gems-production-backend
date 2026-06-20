import AdminOrdersBackend from "@/components/AdminOrdersBackend";
import NavBar from "@/components/NavBar";

export default function AdminOrdersPage() {
  return (
    <main className="container">
      <NavBar />
      <AdminOrdersBackend />
    </main>
  );
}

