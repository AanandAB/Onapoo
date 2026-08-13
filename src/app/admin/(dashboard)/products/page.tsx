import {
  requireAdmin,
  listProductsAdmin,
  listCategories,
  getProductById,
} from "@/lib/admin";
import { saveProduct, deleteProduct } from "@/app/admin/actions";
import { PRODUCT_UNITS, STOCK_STATUSES, type ProductRow, type CategoryRow } from "@/db/schema";
import { ImagePicker } from "@/components/image-picker";
import { formatPrice } from "@/lib/site";

const input =
  "w-full rounded-lg border border-ink/15 bg-cream px-3 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
const label = "mb-1 block text-sm font-semibold";

function stockBadge(s: string) {
  const map: Record<string, { t: string; c: string }> = {
    in_stock: { t: "In stock", c: "bg-leaf/10 text-leaf" },
    low_stock: { t: "Low stock", c: "bg-marigold/15 text-marigold-deep" },
    out_of_stock: { t: "Out of stock", c: "bg-chethi/10 text-chethi" },
  };
  const b = map[s] ?? map.in_stock;
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${b.c}`}>{b.t}</span>;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();
  const { edit } = await searchParams;
  const [products, categories] = await Promise.all([listProductsAdmin(), listCategories()]);
  const item = edit && edit !== "new" ? await getProductById(edit) : null;
  const showForm = !!edit;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted">{products.length} products</p>
        </div>
        {!showForm && (
          <a
            href="?edit=new"
            className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
          >
            + New product
          </a>
        )}
      </div>

      {showForm && (
        <ProductForm categories={categories} item={item} onCancel="/admin/products" />
      )}

      {!showForm && (
        <div className="overflow-x-auto rounded-2xl bg-paper shadow-soft">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-cream/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-cream-dark" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {p.nameEn}
                          {p.isFeatured && <span className="ml-1 text-gold">★</span>}
                        </p>
                        <p className="text-xs text-muted">{p.nameMl}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{formatPrice(p.price)}</span>
                    {p.compareAtPrice && p.compareAtPrice > p.price && (
                      <span className="ml-2 text-xs text-muted line-through">
                        {formatPrice(p.compareAtPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{stockBadge(p.stockStatus)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`?edit=${p.id}`}
                        className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold hover:bg-cream"
                      >
                        Edit
                      </a>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="rounded-full border border-chethi/30 px-3 py-1.5 text-xs font-semibold text-chethi hover:bg-chethi/5">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProductForm({
  categories,
  item,
  onCancel,
}: {
  categories: CategoryRow[];
  item: ProductRow | null;
  onCancel: string;
}) {
  const isEditing = !!item;
  return (
    <form action={saveProduct} className="mb-8 rounded-2xl bg-paper p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">
          {isEditing ? "Edit product" : "New product"}
        </h2>
        <a href={onCancel} className="text-sm text-muted hover:text-ink">
          Cancel
        </a>
      </div>

      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Name (English)</label>
          <input name="nameEn" defaultValue={item?.nameEn} required className={input} />
        </div>
        <div>
          <label className={label}>Name (Malayalam)</label>
          <input name="nameMl" defaultValue={item?.nameMl} className={input} />
        </div>
        <div>
          <label className={label}>Slug</label>
          <input name="slug" defaultValue={item?.slug} className={input} />
        </div>
        <div>
          <label className={label}>Category</label>
          <select name="categoryId" defaultValue={item?.categoryId} required className={input}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn} / {c.nameMl}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Colour (English)</label>
          <input name="colorEn" defaultValue={item?.colorEn ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Colour (Malayalam)</label>
          <input name="colorMl" defaultValue={item?.colorMl ?? ""} className={input} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Description (English)</label>
          <textarea name="descriptionEn" rows={2} defaultValue={item?.descriptionEn ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Description (Malayalam)</label>
          <textarea name="descriptionMl" rows={2} defaultValue={item?.descriptionMl ?? ""} className={input} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>Price (₹)</label>
          <input name="price" type="number" min={0} defaultValue={item?.price ?? ""} required className={input} />
        </div>
        <div>
          <label className={label}>Compare-at price (₹)</label>
          <input name="compareAtPrice" type="number" min={0} defaultValue={item?.compareAtPrice ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Sort order</label>
          <input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} className={input} />
        </div>
        <div>
          <label className={label}>Unit</label>
          <select name="unit" defaultValue={item?.unit ?? "bunch"} className={input}>
            {PRODUCT_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Stock status</label>
          <select name="stockStatus" defaultValue={item?.stockStatus ?? "in_stock"} className={input}>
            {STOCK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="isFeatured" defaultChecked={item ? item.isFeatured : false} className="h-4 w-4 accent-gold-deep" />
            Featured (★)
          </label>
        </div>
      </div>

      <div className="mt-4">
        <label className={label}>Image</label>
        <ImagePicker defaultValue={item?.image} />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="rounded-full bg-leaf px-6 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
        >
          {isEditing ? "Save changes" : "Create product"}
        </button>
        <a href={onCancel} className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold">
          Cancel
        </a>
      </div>
    </form>
  );
}
