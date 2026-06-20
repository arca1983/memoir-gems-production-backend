import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="navbar no-print">
      <Link className="button secondary" href="/admin">Company Admin</Link>
      <Link className="button secondary" href="/admin/orders">Orders</Link>
      <Link className="button secondary" href="/admin/batches">Batches</Link>
      <Link className="button secondary" href="/admin/inventory">Inventory</Link>
      <Link className="button secondary" href="/admin/formats">Formats</Link>
    </nav>
  );
}
