import { requireAdmin } from "@/lib/admin";
import { getStoreSettings } from "@/lib/queries";
import { saveSettings } from "@/app/admin/actions";

const input =
  "w-full rounded-lg border border-ink/15 bg-cream px-3 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
const label = "mb-1 block text-sm font-semibold";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getStoreSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-muted">Store-wide settings shown on the website.</p>

      <form action={saveSettings} className="mt-6 space-y-4 rounded-2xl bg-paper p-6 shadow-soft">
        <div>
          <label className={label}>Ordering opens from</label>
          <input
            type="date"
            name="orderingStart"
            defaultValue={settings.orderingStart ?? ""}
            className={input}
          />
          <p className="mt-1 text-xs text-muted">
            Customers can browse always, but ordering is blocked until this date. Leave empty to use the default (21 Aug 2026).
          </p>
        </div>

        <div>
          <label className={label}>Top announcement (English)</label>
          <input
            name="announcementEn"
            defaultValue={settings.announcementEn ?? ""}
            className={input}
            placeholder="Rates change every day · Ordering opens 21 August"
          />
        </div>

        <div>
          <label className={label}>Top announcement (Malayalam)</label>
          <input
            name="announcementMl"
            defaultValue={settings.announcementMl ?? ""}
            className={input}
            placeholder="നിരക്കുകൾ ദിവസവും മാറുന്നു · ഓർഡറുകൾ ആഗസ്റ്റ് 21 മുതൽ"
          />
        </div>

        <button className="rounded-full bg-leaf px-6 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5">
          Save settings
        </button>
      </form>
    </div>
  );
}
