import { findOrderForTracking } from "@/lib/queries";
import { TrackView } from "@/components/track-view";

export const dynamic = "force-dynamic";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; phone?: string }>;
}) {
  const { order, phone } = await searchParams;
  const result = order && phone ? await findOrderForTracking(order.trim(), phone.trim()) : null;
  const searched = Boolean(order && phone);

  return <TrackView orderNumber={order} phone={phone} result={result} searched={searched} />;
}
