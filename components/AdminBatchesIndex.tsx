"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProductionBatch, statusBadgeClass, statusLabel } from "@/lib/productionBackend";

export default function AdminBatchesIndex() {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [message, setMessage] = useState("");

  async function loadData() {
    const { data, error } = await supabase
      .from("production_batches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setMessage(`${error.message}. Create production_batches from the SQL migration if this table is missing.`);
    else {
      setBatches((data || []) as ProductionBatch[]);
      setMessage("");
    }
  }

  useEffect(() => { loadData(); }, []);

  return (
    <>
      <div className="admin-header-row no-print">
        <div>
          <h1>Production Batches</h1>
          <p>Batch-based print jobs for paid and approved 2x2 photo magnets.</p>
        </div>
        <div className="actions">
          <Link className="button" href="/admin/batches/new">Create New Batch</Link>
          <button className="secondary" onClick={loadData}>Refresh</button>
        </div>
      </div>

      {message && <div className="status yellow">{message}</div>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Batch</th>
              <th>Total Orders</th>
              <th>Total Photos</th>
              <th>Total Sheets</th>
              <th>Photo Paper Needed</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id}>
                <td><b>{batch.batch_number}</b></td>
                <td>{batch.total_orders}</td>
                <td>{batch.total_photos}</td>
                <td>{batch.total_sheets}</td>
                <td>{batch.photo_paper_needed}</td>
                <td><span className={statusBadgeClass(batch.batch_status)}>{statusLabel(batch.batch_status)}</span></td>
                <td>{new Date(batch.created_at).toLocaleString()}</td>
                <td><Link className="button secondary" href={`/admin/batches/${batch.id}`}>View Batch</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {batches.length === 0 && <p>No batches yet.</p>}
      </div>
    </>
  );
}

