import { HomeContent } from "@/components/marketing/HomeContent";

/**
 * What the logo in the app header links to — the same look as the public
 * marketing homepage (monte.estate/), just rendered inside the authenticated
 * app shell (AppLayout already supplies the header/nav and the <main> tag).
 */
export default function AppHomePage() {
  return <HomeContent />;
}
