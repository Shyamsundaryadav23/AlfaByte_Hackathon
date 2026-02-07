import { useState } from "react";
import Navbar from "../../components/common/Navbar";
import HeroSection from "../../components/common/HeroSection";
import ClubsSection from "../../components/common/ClubSection";
import Footer from "../../components/common/Footer";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  return (
    <>
      <Navbar />
      <HeroSection search={search} setSearch={setSearch} />
      <ClubsSection
        search={search}
        filter={filter}
        setFilter={setFilter}
      />
      <Footer />
    </>
  );
}
