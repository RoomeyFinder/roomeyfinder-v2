import { ContentPage } from "@/components/content-page";
import { CozySharedLivingRoom } from "@/assets/illustrations/cozy-shared-space";

export default function AboutPage() {
  return <ContentPage title="About RoomeyFinder"><div className="mb-8 overflow-hidden rounded-3xl border border-brand/10 bg-secondary/20"><CozySharedLivingRoom /></div><p>RoomeyFinder helps people in Nigeria find compatible roommates and shared homes.</p><p>We make shared living easier by combining thoughtful preferences, home listings, and consent-based connections.</p></ContentPage>;
}
