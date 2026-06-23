"use client";

import { useState } from "react";

import { usePageTitle } from "~/lib/use-page-title";
import { api } from "~/trpc/react";

// Hard-coded password gate — in production this should be replaced with proper
// server-side auth (e.g. checking the authenticated user's role === "admin")
const ADMIN_PASSWORD = "password";

/** Root admin page component with a password gate.
 *  On successful login the "admin_authed" flag is persisted in sessionStorage
 *  so the user does not have to re-enter the password on navigation. */
export default function AdminPage() {
  usePageTitle("Admin");
  // Check sessionStorage on mount so a page refresh does not lose the authenticated state
  // Guarded against server-side rendering where sessionStorage is not available
  const [authed, setAuthed] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("admin_authed") === "true",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Validate the entered password against the hard-coded ADMIN_PASSWORD
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authed", "true");
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  // Password gate UI — only render the dashboard once authenticated
  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-4 font-serif text-3xl tracking-tight md:text-4xl">Admin</h1>
          <p className="mb-8 text-xs tracking-[0.3em] text-neutral-400 uppercase">
            Enter password to access
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className="mb-4 w-full border border-neutral-200 bg-transparent px-4 py-3 text-sm focus:outline-none dark:border-neutral-800"
          />
          {error && <p className="mb-4 text-xs text-red-500">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-neutral-950 px-8 py-3 text-sm font-medium tracking-widest text-neutral-50 uppercase transition-colors hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

/** Dashboard shell with tab navigation between the Products and Orders views. */
function AdminDashboard() {
  // Active tab state — controls which subsection is rendered below the tab buttons
  const [tab, setTab] = useState<"products" | "orders">("products");

  return (
    <div className="min-h-screen pt-32 pb-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <p className="mb-3 text-xs tracking-[0.3em] text-neutral-400 uppercase">Dashboard</p>
            <h1 className="font-serif text-3xl leading-tight tracking-tight md:text-5xl">
              Admin Panel
            </h1>
          </div>
          {/* Sign out button — clears the sessionStorage flag and reloads to return to the password gate */}
          <button
            onClick={() => {
              sessionStorage.removeItem("admin_authed");
              window.location.reload();
            }}
            className="text-xs tracking-widest text-neutral-400 uppercase transition-colors hover:text-neutral-950 dark:hover:text-neutral-50"
          >
            Sign Out
          </button>
        </div>

        {/* Tab switcher — toggles between the Products management view and the Orders management view */}
        <div className="mb-12 flex gap-4">
          <button
            onClick={() => setTab("products")}
            className={`border px-4 py-2 text-xs tracking-widest uppercase transition-colors ${
              tab === "products"
                ? "bg-neutral-950 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
                : "border-neutral-200 dark:border-neutral-800"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`border px-4 py-2 text-xs tracking-widest uppercase transition-colors ${
              tab === "orders"
                ? "bg-neutral-950 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
                : "border-neutral-200 dark:border-neutral-800"
            }`}
          >
            Orders
          </button>
        </div>

        {/* Conditionally render the active tab's content */}
        {tab === "products" ? <AdminProducts /> : <AdminOrders />}
      </div>
    </div>
  );
}

/** Convert any string into a URL-friendly slug: lowercase, spaces → hyphens, strip special chars. */
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Products list view — fetches all products with their categories,
 *  allows inline editing, deletion, and toggling the create-product form. */
function AdminProducts() {
  // Fetch the full product list and all categories for the form dropdowns
  const { data: products, isLoading } = api.admin.products.list.useQuery();
  const { data: categories } = api.admin.categories.list.useQuery();
  const utils = api.useUtils();
  // Track which product is currently being edited (null = no active edit)
  const [editingId, setEditingId] = useState<number | null>(null);
  // Toggle for the "New Product" creation form
  const [showCreate, setShowCreate] = useState(false);

  // Delete mutation — invalidates the product list on success to refresh the UI
  const deleteProduct = api.admin.products.delete.useMutation({
    onSuccess: () => utils.admin.products.list.invalidate(),
  });

  if (isLoading) return <div className="text-sm text-neutral-400">Loading...</div>;

  return (
    <div>
      {/* Toggle button for the new-product creation form */}
      <button
        onClick={() => setShowCreate(!showCreate)}
        className="mb-8 border border-neutral-200 px-6 py-3 text-xs tracking-widest uppercase transition-colors hover:bg-neutral-950 hover:text-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-50 dark:hover:text-neutral-950"
      >
        {showCreate ? "Cancel" : "+ New Product"}
      </button>

      {/* Inline create form — shown when the user clicks "+ New Product" */}
      {showCreate && (
        <ProductForm
          categories={categories ?? []}
          onDone={() => {
            setShowCreate(false);
            void utils.admin.products.list.invalidate();
          }}
        />
      )}

      {/* Product list — each card can either show an edit form or display the product summary */}
      <div className="space-y-4">
        {products?.map((p) => (
          <div key={p.id} className="border border-neutral-200 p-6 dark:border-neutral-800">
            {editingId === p.id ? (
              // Inline edit form for the selected product
              <ProductForm
                product={p}
                categories={categories ?? []}
                onDone={() => {
                  setEditingId(null);
                  void utils.admin.products.list.invalidate();
                }}
              />
            ) : (
              // Summary card with product info, edit, and delete actions
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-serif text-lg">{p.name}</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    ${(p.price / 100).toFixed(2)} — Stock: {p.stock}
                  </p>
                  {p.category && <p className="mt-1 text-xs text-neutral-500">{p.category.name}</p>}
                </div>
                <div className="flex items-center gap-3">
                  {/* Badge indicating whether the product is featured or standard */}
                  <span
                    className={`text-xs tracking-wider uppercase ${p.isFeatured ? "text-green-600" : "text-neutral-400"}`}
                  >
                    {p.isFeatured ? "Featured" : "Standard"}
                  </span>
                  {/* Switch to edit mode for this product */}
                  <button
                    onClick={() => setEditingId(p.id)}
                    className="text-xs tracking-widest text-neutral-400 uppercase transition-colors hover:text-neutral-950 dark:hover:text-neutral-50"
                  >
                    Edit
                  </button>
                  {/* Delete the product after a confirmation dialog */}
                  <button
                    onClick={() => {
                      if (confirm("Delete this product?")) {
                        deleteProduct.mutate({ id: p.id });
                      }
                    }}
                    className="text-xs tracking-widest text-red-400 uppercase transition-colors hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Reusable form for creating and editing products.
 *  When `product` is provided the form works in "edit" mode; without it the form
 *  starts empty for creating a brand-new product. */
function ProductForm({
  product,
  categories,
  onDone,
}: {
  product?: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    sizes: { ml: number; price: number }[];
    scentNotes: string | null;
    categoryId: number | null;
    stock: number;
    isFeatured: boolean;
  };
  categories: { id: number; name: string }[];
  onDone: () => void;
}) {
  // Derive mode from whether an existing product was passed in
  const isEdit = !!product;
  // Initialise every field from the product prop (or empty defaults for create mode)
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [scentNotes, setScentNotes] = useState(product?.scentNotes ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? null);
  const [stock, setStock] = useState(product ? String(product.stock) : "0");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  // Sizes are stored as comma-separated "ml:price" pairs for simple text input
  const [sizesStr, setSizesStr] = useState(
    product ? product.sizes.map((s) => `${s.ml}:${s.price}`).join(", ") : "",
  );

  const utils = api.useUtils();

  // Create mutation — fires when submitting the form in create mode
  const createMutation = api.admin.products.create.useMutation({
    onSuccess: () => {
      void utils.admin.products.list.invalidate();
      onDone();
    },
  });

  // Update mutation — fires when submitting the form in edit mode
  const updateMutation = api.admin.products.update.useMutation({
    onSuccess: () => {
      void utils.admin.products.list.invalidate();
      onDone();
    },
  });

  /** Parse the comma-separated sizes string into structured objects and call the
   *  appropriate tRPC mutation (create vs update). */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse the "ml:price, ml:price" string into an array of { ml, price } objects
    const sizes = sizesStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const [ml, p] = s.split(":");
        return { ml: Number(ml), price: Number(p) };
      });

    // Build the payload — use the auto-generated slug if the user left the slug field blank
    const data = {
      name,
      slug: slug || slugify(name),
      description: description || undefined,
      price: Number(price),
      sizes,
      scentNotes: scentNotes || undefined,
      categoryId: categoryId ?? undefined,
      stock: Number(stock),
      isFeatured,
    };

    // Choose the correct mutation based on the current mode
    if (isEdit) {
      updateMutation.mutate({ id: product.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 space-y-4 border border-neutral-200 p-6 dark:border-neutral-800"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Product name — required field */}
        <div>
          <label className="mb-1 block text-xs tracking-widest text-neutral-400 uppercase">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
          />
        </div>
        {/* URL slug — auto-populated from name via slugify if left empty */}
        <div>
          <label className="mb-1 block text-xs tracking-widest text-neutral-400 uppercase">
            Slug
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
          />
        </div>
      </div>

      {/* Description — multi-line textarea */}
      <div>
        <label className="mb-1 block text-xs tracking-widest text-neutral-400 uppercase">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full resize-none border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Price stored in cents (e.g. 9500 = $95.00) — required */}
        <div>
          <label className="mb-1 block text-xs tracking-widest text-neutral-400 uppercase">
            Price (cents)
          </label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            type="number"
            className="w-full border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
          />
        </div>
        {/* Available stock count */}
        <div>
          <label className="mb-1 block text-xs tracking-widest text-neutral-400 uppercase">
            Stock
          </label>
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            type="number"
            className="w-full border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
          />
        </div>
        {/* Category selector — dropdown populated from the categories query */}
        <div>
          <label className="mb-1 block text-xs tracking-widest text-neutral-400 uppercase">
            Category
          </label>
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scent notes (free text, e.g. "Bergamot, Lavender, Sandalwood") */}
      <div>
        <label className="mb-1 block text-xs tracking-widest text-neutral-400 uppercase">
          Scent Notes
        </label>
        <input
          value={scentNotes}
          onChange={(e) => setScentNotes(e.target.value)}
          className="w-full border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
        />
      </div>

      {/* Size variants — comma-separated "ml:price in cents" pairs */}
      <div>
        <label className="mb-1 block text-xs tracking-widest text-neutral-400 uppercase">
          Sizes (format: ml:price, e.g. 50:9500, 100:14500)
        </label>
        <input
          value={sizesStr}
          onChange={(e) => setSizesStr(e.target.value)}
          className="w-full border border-neutral-200 bg-transparent px-3 py-2 text-sm focus:outline-none dark:border-neutral-800"
        />
      </div>

      {/* Featured toggle — flags the product for special placement on the storefront */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="accent-neutral-950 dark:accent-neutral-50"
        />
        <span className="text-xs tracking-widest text-neutral-400 uppercase">Featured</span>
      </label>

      {/* Form actions: submit (create/update) and cancel */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-neutral-950 px-6 py-3 text-xs tracking-widest text-neutral-50 uppercase transition-colors hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          {isEdit ? "Update" : "Create"} Product
        </button>
        <button
          type="button"
          onClick={onDone}
          className="border border-neutral-200 px-6 py-3 text-xs tracking-widest uppercase transition-colors dark:border-neutral-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/** Orders list view — fetches all orders with their items and user info,
 *  and provides an inline dropdown to update the order status. */
function AdminOrders() {
  // Fetch all orders (with nested items and user) from the admin API
  const { data: orders, isLoading } = api.admin.orders.list.useQuery();
  const utils = api.useUtils();

  // Status update mutation — refreshes the order list on success
  const updateStatus = api.admin.orders.updateStatus.useMutation({
    onSuccess: () => utils.admin.orders.list.invalidate(),
  });

  if (isLoading) return <div className="text-sm text-neutral-400">Loading...</div>;

  return (
    <div className="space-y-4">
      {orders?.map((o) => (
        <div key={o.id} className="border border-neutral-200 p-6 dark:border-neutral-800">
          <div className="mb-4 flex items-center justify-between">
            {/* Order summary: ID, customer name/email, and creation date */}
            <div>
              <p className="text-sm font-medium">Order #{o.id}</p>
              <p className="text-xs text-neutral-400">
                {o.user?.name ?? o.user?.email} — {new Date(o.createdAt).toLocaleDateString()}
              </p>
            </div>
            {/* Status dropdown — changing the selection immediately fires the update mutation */}
            <div className="flex items-center gap-3">
              <select
                value={o.status}
                onChange={(e) =>
                  updateStatus.mutate({
                    id: o.id,
                    status: e.target.value as
                      | "pending"
                      | "paid"
                      | "shipped"
                      | "delivered"
                      | "cancelled",
                  })
                }
                className="border border-neutral-200 bg-transparent px-3 py-1 text-xs tracking-wider uppercase dark:border-neutral-800"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          {/* Order line items summary */}
          <div className="text-xs text-neutral-500">
            {o.items.map((i) => `${i.productName} (${i.size}ml) × ${i.quantity}`).join(", ")}
          </div>
          {/* Total amount formatted as dollars */}
          <div className="mt-2 text-sm font-medium">${(o.totalAmount / 100).toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
