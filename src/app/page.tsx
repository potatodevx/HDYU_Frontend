import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import {
  VisionSection,
  EarnSection,
  UtilitySection,
  TokenSection,
  RoadmapSection,
  CtaSection,
} from "@/components/site/sections";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <VisionSection />
        <EarnSection />
        <UtilitySection />
        <TokenSection />
        <RoadmapSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
