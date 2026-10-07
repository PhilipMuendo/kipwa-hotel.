import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Rooms from "@/components/Rooms";
import DayAtKipwa from "@/components/DayAtKipwa";
import Dining from "@/components/Dining";
import Experiences from "@/components/Experiences";
import PolePole from "@/components/PolePole";
import Voices from "@/components/Voices";
import Location from "@/components/Location";
import Booking from "@/components/Booking";
import Finale from "@/components/Finale";
import Footer from "@/components/Footer";
import MobileBookBar from "@/components/MobileBookBar";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Intro />
        <Rooms />
        <DayAtKipwa />
        <Dining />
        <Experiences />
        <PolePole />
        <Voices />
        <Location />
        <Booking />
        <Finale />
      </main>
      <Footer />
      <MobileBookBar />
    </>
  );
}
