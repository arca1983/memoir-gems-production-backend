"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Order = {
  id: string;
  order_id: string;
  customer_name: string;
  email: string;
  phone: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  carrier_preference: string | null;
  tracking_number: string | null;
  product_type: string | null;
  photo_count: number;
  order_status: string;
  production_status: string;
  shipping_status: string;
  traffic_light_status: string;
  priority?: string;
  deadline_date?: string | null;
  rush_reason?: string | null;
  address_status?: string | null;
  created_at: string;
};

type Photo = {
  id: string;
  order_id: string;
  order_number: string;
  photo_url: string;
  photo_name: string | null;
  photo_number: number;
  photo_status: string;
};

function badgeClass(status: string) {
  if (status === "green") return "badge green";
  if (status === "red") return "badge red";
  return "badge yellow";
}

function priorityClass(priority?: string) {
  if (priority === "rush") return "pill rush";
  if (priority === "event_deadline") return "pill event_deadline";
  return "pill standard";
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: photosData, error: photosError } = await supabase
      .from("order_photos")
      .select("*")
      .order("created_at", { ascending: true });

    if (ordersError || photosError) {
      setMessage(ordersError?.message || photosError?.message || "Error loading data");
    } else {
      setOrders((ordersData || []) as Order[]);
      setPhotos((photosData || []) as Photo[]);
      setMessage("");
    }

    setLoading(false);
  }

  async function updateTracking(order: Order) {
    const tracking = window.prompt(`Enter tracking number for ${order.order_id}`, order.tracking_number || "");
    if (tracking === null) return;

    const carrier = window.prompt("Carrier? USPS / UPS / FedEx", order.carrier_preference || "USPS");
    if (carrier === null) return;

    const { error } = await supabase
      .from("orders")
      .update({
        tracking_number: tracking,
        carrier_preference: carrier,
        shipping_status: tracking ? "tracking_added" : "tracking_pending",
        traffic_light_status: tracking ? "green" : order.traffic_light_status,
      })
      .eq("id", order.id);

    if (!error && tracking) {
      await supabase.from("order_status_events").insert({
        order_id: order.id,
        order_number: order.order_id,
        status_key: "tracking_added",
        status_label: "Shipping label / tracking added",
        visible_to_customer: true,
        internal_note: `${carrier}: ${tracking}`,
      });
    }

    if (error) setMessage(error.message);
    else await loadData();
  }

  useEffect(() => { loadData(); }, []);

  const photosByOrder = photos.reduce<Record<string, Photo[]>>((acc, photo) => {
    acc[photo.order_number] ||= [];
    acc[photo.order_number].push(photo);
    return acc;
  }, {});

  const stats = useMemo(() => {
    return {
      total: orders.length,
      rush: orders.filter(o => o.priority === "rush").length,
      event: orders.filter(o => o.priority === "event_deadline").length,
      trackingPending: orders.filter(o => !o.tracking_number).length,
    };
  }, [orders]);

  return (
    <>
      <div className="stat-grid">
        <div className="stat-card"><b>{stats.total}</b><span>Total orders</span></div>
        <div className="stat-card"><b>{stats.rush}</b><span>Rush orders</span></div>
        <div className="stat-card"><b>{stats.event}</b><span>Event deadlines</span></div>
        <div className="stat-card"><b>{stats.trackingPending}</b><span>Tracking pending</span></div>
      </div>

      <div className="card">
        <div className="actions" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Company Admin</h2>
          <button onClick={loadData}>Refresh</button>
        </div>
        <p className="small">
          Internal company view. Review orders, rush/event status, address status, uploaded photos, and tracking.
        </p>

        {loading && <p>Loading...</p>}
        {message && <div className="status red">{message}</div>}

        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer / Address</th>
              <th>Photos</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Carrier / Tracking</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const orderPhotos = photosByOrder[order.order_id] || [];
              return (
                <tr key={order.id}>
                  <td>
                    <b>{order.order_id}</b>
                    <br />
                    <span className="small">{new Date(order.created_at).toLocaleString()}</span>
                  </td>
                  <td>
                    <b>{order.customer_name}</b>
                    <br />
                    {order.email}
                    <br />
                    {order.phone}
                    <br />
                    <span className="small">
                      {order.address}, {order.city}, {order.state} {order.zip}<br />
                      {order.country || "United States"}<br />
                      Address: {order.address_status || "not set"}
                    </span>
                  </td>
                  <td>
                    <b>{orderPhotos.length}</b> uploaded
                    <div className="photo-list" style={{ gridTemplateColumns: "repeat(3, 56px)", gap: 6 }}>
                      {orderPhotos.slice(0, 6).map((photo) => (
                        <a key={photo.id} href={photo.photo_url} target="_blank">
                          <img src={photo.photo_url} alt={photo.photo_name || "photo"} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} />
                        </a>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={priorityClass(order.priority)}>{order.priority || "standard"}</span>
                    <br />
                    <span className="small">{order.deadline_date || "No deadline"}</span>
                    <br />
                    <span className="small">{order.rush_reason || ""}</span>
                  </td>
                  <td>
                    <span className={badgeClass(order.traffic_light_status)}>{order.traffic_light_status}</span>
                    <br />
                    <span className="small">{order.production_status}</span>
                    <br />
                    <span className="small">{order.shipping_status}</span>
                  </td>
                  <td>
                    <b>{order.carrier_preference || "No preference"}</b>
                    <br />
                    <span className="small">{order.tracking_number || "Tracking pending"}</span>
                  </td>
                  <td><button onClick={() => updateTracking(order)}>Add tracking</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && orders.length === 0 && <p>No orders yet.</p>}
      </div>
    </>
  );
}
