import { Hero } from "@/components/sections/Hero";
import { Flavour } from "@/components/sections/Flavour";
import { Signatures } from "@/components/sections/Signatures";
import { Immersive } from "@/components/sections/Immersive";
import { MenuPreview } from "@/components/sections/MenuPreview";
import { StoryTeaser } from "@/components/sections/StoryTeaser";
import { Location } from "@/components/sections/Location";
import { Preloader } from "@/components/ui/Preloader";

export default function HomePage() {
  return (
    <>
      <Preloader />
      <Hero />
      <Flavour />
      <Signatures />
      <Immersive />
      <MenuPreview />
      <StoryTeaser />
      <Location />
    </>
  );
}
