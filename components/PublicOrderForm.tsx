"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UploadDropzone } from "@/utils/uploadthing";

type UploadedFile = {
  name: string;
  url?: string;
  ufsUrl?: string;
  appUrl?: string;
  key?: string;
  size?: number;
};

type OrderForm = {
  customer_name: string;
  email: string;
  phone: string;
  country: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state_region: string;
  postal_code: string;
  carrier_preference: string;
  production_speed: string;
  needed_by_date: string;
  rush_reason: string;
  expedited_shipping_requested: boolean;
  address_confirmed_by_customer: boolean;
  notes: string;
};

const initialForm: OrderForm = {
  customer_name: "",
  email: "",
  phone: "",
  country: "United States",
  address_line1: "",
  address_line2: "",
  city: "Houston",
  state_region: "TX",
  postal_code: "",
  carrier_preference: "No preference",
  production_speed: "standard",
  needed_by_date: "",
  rush_reason: "",
  expedited_shipping_requested: false,
  address_confirmed_by_customer: false,
  notes: "",
};

function createOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MG-${stamp}-${random}`;
}

function getFileUrl(file: UploadedFile) {
  return file.url || file.ufsUrl || file.appUrl || "";
}

function priorityLabel(value: string) {
  if (value === "rush") return "Rush Production";
  if (value === "event_deadline") return "Event Deadline";
  return "Standard Production";
}

export default function PublicOrderForm() {
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const missingRequired = useMemo(() => {
    const required: (keyof OrderForm)[] = ["customer_name", "email", "country", "address_line1", "city", "state_region", "postal_code"];
    return required.filter((key) => !String(form[key] || "").trim());
  }, [form]);

  const isInternational = form.country.trim().toLowerCase() !== "united states";

  const trafficLight = useMemo(() => {
    if (missingRequired.length > 0) return { color: "red", label: "RED — Missing customer/shipping information" };
    if (!form.address_confirmed_by_customer) return { color: "red", label: "RED — Address confirmation required" };
    if (uploadedFiles.length === 0) return { color: "red", label: "RED — Missing photos" };
    if (isInternational) return { color: "yellow", label: "YELLOW — International address requires manual review" };
    if (form.production_speed === "rush") return { color: "yellow", label: "YELLOW — Rush order requires production review" };
    if (uploadedFiles.length < 12) return { color: "yellow", label: "YELLOW — Order received, waiting for batch/full sheet" };
    return { color: "green", label: "GREEN — Ready for production review" };
  }, [missingRequired.length, form.address_confirmed_by_customer, uploadedFiles.length, isInternational, form.production_speed]);

  function updateField(key: keyof OrderForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submitOrder() {
    setError(null);

    if (missingRequired.length > 0) {
      setError("Please complete name, email, country, address, city, state/region, and postal code.");
      return;
    }

    if (!form.address_confirmed_by_customer) {
      setError("Please confirm the shipping address before submitting.");
      return;
    }

    if (uploadedFiles.length === 0) {
      setError("Please upload at least one photo before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = createOrderNumber();
      const address = [form.address_line1, form.address_line2].filter(Boolean).join(", ");

      const addressStatus = isInternational ? "international_manual_review" : "customer_confirmed";

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_id: orderNumber,
          customer_name: form.customer_name,
          email: form.email,
          phone: form.phone,
          address,
          city: form.city,
          state: form.state_region,
          zip: form.postal_code,
          country: form.country,
          address_line1: form.address_line1,
          address_line2: form.address_line2 || null,
          state_region: form.state_region,
          postal_code: form.postal_code,
          carrier_preference: form.carrier_preference,
          tracking_number: null,
          product_type: "2x2 Photo Magnet",
          photo_count: uploadedFiles.length,
          priority: form.production_speed,
          deadline_date: form.needed_by_date || null,
          rush_reason: form.rush_reason || null,
          address_status: addressStatus,
          address_confirmed_by_customer: form.address_confirmed_by_customer,
          address_validation_message: isInternational ? "International address requires manual review before shipping." : "Customer confirmed address. USPS validation not connected yet.",
          order_status: "new_order",
          // Photos + format selected at submission = automatically ready to print.
          // No manual "approve" step needed; production_status goes straight to
          // ready_for_batch so AdminBatchNew picks it up without admin action.
          production_status: "ready_for_batch",
          shipping_status: "not_ready",
          traffic_light_status: trafficLight.color,
          customer_visible_status: "photos_received",
          internal_status: "new_order",
          notes: form.notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const photoRows = uploadedFiles.map((file, index) => ({
        order_id: order.id,
        order_number: orderNumber,
        photo_url: getFileUrl(file),
        photo_name: file.name || `photo-${index + 1}`,
        photo_number: index + 1,
        // Auto-approved: the customer choosing these photos + a format at
        // checkout is the approval. No separate admin review gate.
        photo_status: "approved_for_print",
        approved_for_print: true,
      }));

      const { error: photoError } = await supabase.from("order_photos").insert(photoRows);
      if (photoError) throw photoError;

      await supabase.from("order_status_events").insert([
        {
          order_id: order.id,
          order_number: orderNumber,
          status_key: "order_received",
          status_label: "Order received",
          visible_to_customer: true,
          internal_note: `Customer submitted ${uploadedFiles.length} photo(s). Priority: ${form.production_speed}.`,
        },
        {
          order_id: order.id,
          order_number: orderNumber,
          status_key: "photos_uploaded",
          status_label: "Photos uploaded",
          visible_to_customer: true,
          internal_note: "Photo URLs saved to order_photos.",
        },
      ]);

      setCreatedOrder(orderNumber);
      setForm(initialForm);
      setUploadedFiles([]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong while creating the order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdOrder) {
    return (
      <div className="card">
        <h2>Thank you — test order received</h2>
        <div className="status yellow">
          Order ID: {createdOrder}
          <br />
          Status: YELLOW — Waiting for batch / production review
        </div>
        <p>Your photos and shipping information were received. This is a Memoir Gems test order for 2x2 photo magnets.</p>
        <button onClick={() => setCreatedOrder(null)}>Create another test order</button>
      </div>
    );
  }

  return (
    <>
      <div className={`status ${trafficLight.color}`}>{trafficLight.label}</div>

      <div className="card">
        <h2>1. Customer & Shipping Information</h2>
        <div className="grid">
          <div>
            <label>Full Name *</label>
            <input value={form.customer_name} onChange={(e) => updateField("customer_name", e.target.value)} />
          </div>
          <div>
            <label>Email *</label>
            <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
          </div>
          <div>
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </div>
          <div>
            <label>Country *</label>
            <input value={form.country} onChange={(e) => updateField("country", e.target.value)} placeholder="United States, Canada, Mexico, Spain..." />
          </div>
          <div>
            <label>Address Line 1 *</label>
            <input value={form.address_line1} onChange={(e) => updateField("address_line1", e.target.value)} />
          </div>
          <div>
            <label>Address Line 2 / Apt / Unit</label>
            <input value={form.address_line2} onChange={(e) => updateField("address_line2", e.target.value)} />
          </div>
          <div>
            <label>City *</label>
            <input value={form.city} onChange={(e) => updateField("city", e.target.value)} />
          </div>
          <div>
            <label>State / Province / Region *</label>
            <input value={form.state_region} onChange={(e) => updateField("state_region", e.target.value)} />
          </div>
          <div>
            <label>ZIP / Postal Code *</label>
            <input value={form.postal_code} onChange={(e) => updateField("postal_code", e.target.value)} />
          </div>
          <div>
            <label>Carrier Preference</label>
            <select value={form.carrier_preference} onChange={(e) => updateField("carrier_preference", e.target.value)}>
              <option>No preference</option>
              <option>USPS</option>
              <option>UPS</option>
              <option>FedEx</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 14 }} className="address-review">
          <b>Shipping Address Review</b>
          <p>
            {form.customer_name || "Customer Name"}<br />
            {form.address_line1 || "Address Line 1"} {form.address_line2 ? `, ${form.address_line2}` : ""}<br />
            {form.city || "City"}, {form.state_region || "State/Region"} {form.postal_code || "Postal Code"}<br />
            {form.country || "Country"}
          </p>
          {isInternational && (
            <div className="status yellow">
              International address: manual review required before shipping.
            </div>
          )}
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.address_confirmed_by_customer}
              onChange={(e) => updateField("address_confirmed_by_customer", e.target.checked)}
            />
            I confirm this shipping address is correct.
          </label>
        </div>
      </div>

      <div className="card">
        <h2>2. Production Speed</h2>
        <div className="grid">
          <div>
            <label>Production Speed</label>
            <select value={form.production_speed} onChange={(e) => updateField("production_speed", e.target.value)}>
              <option value="standard">Standard Production</option>
              <option value="rush">Rush Production</option>
              <option value="event_deadline">Event Deadline</option>
            </select>
          </div>
          <div>
            <label>Needed By Date</label>
            <input type="date" value={form.needed_by_date} onChange={(e) => updateField("needed_by_date", e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label>Rush / Event Reason</label>
          <textarea value={form.rush_reason} onChange={(e) => updateField("rush_reason", e.target.value)} placeholder="Birthday, wedding, business event, needed before Friday..." />
        </div>
        <label className="checkbox-row" style={{ marginTop: 10 }}>
          <input
            type="checkbox"
            checked={form.expedited_shipping_requested}
            onChange={(e) => updateField("expedited_shipping_requested", e.target.checked)}
          />
          Customer may want expedited shipping. Shipping speed is separate from rush production.
        </label>
        <p className="small">
          Selected: <b>{priorityLabel(form.production_speed)}</b>. Rush production does not automatically mean overnight shipping.
        </p>
      </div>

      <div className="card">
        <h2>3. Upload Photos for 2x2 Magnets</h2>
        <p className="small">Upload 1 to 50 images. For this test, each image becomes one 2x2 photo magnet.</p>
        <UploadDropzone
          endpoint="photoUploader"
          onClientUploadComplete={(res) => setUploadedFiles(res as UploadedFile[])}
          onUploadError={(err: Error) => setError(err.message)}
        />

        {uploadedFiles.length > 0 && (
          <>
            <h3>{uploadedFiles.length} photo(s) uploaded</h3>
            <div className="photo-list">
              {uploadedFiles.map((file, index) => (
                <div className="photo-card" key={`${file.name}-${index}`}>
                  {getFileUrl(file) ? <img src={getFileUrl(file)} alt={file.name} /> : null}
                  <div className="small">{index + 1}. {file.name}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2>4. Submit Test Order</h2>
        {error && <div className="status red">{error}</div>}
        <div className="actions">
          <button disabled={isSubmitting} onClick={submitOrder}>
            {isSubmitting ? "Submitting..." : "Submit 2x2 Test Order"}
          </button>
          <span className="small">Shipping label and tracking are not purchased automatically yet. You will add tracking manually later.</span>
        </div>
      </div>
    </>
  );
}
