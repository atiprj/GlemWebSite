import { getFolderMedia } from "@/lib/site-assets";
import { EventsOverview } from "@/components/events/EventsOverview";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const media = await getFolderMedia("04.Events");
  return <EventsOverview media={media} />;
}
