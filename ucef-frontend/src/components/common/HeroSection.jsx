import AnimatedBackground from "./AnimatedBackground";

export default function HeroSection({ search, setSearch }) {
  return (
    <section className="relative h-[95vh] flex flex-col justify-center items-center text-center text-white overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Foreground Content */}
      <div className="relative z-10 px-6">
        <h1 className="text-5xl md:text-7xl font-extrabold drop-shadow-lg">
          THE UNIFIED <br /> CAMPUS EVENTS
        </h1>

        <p className="mt-4 text-lg md:text-xl text-gray-200">
          Explore and Register Your Favorite Clubs Events
        </p>

        {/* Search Bar */}
        <div className="mt-10 flex w-[90%] md:w-[650px] mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-full overflow-hidden shadow-xl">
          <input
            type="text"
            placeholder="Search clubs and events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-4 text-white placeholder-gray-300 bg-transparent outline-none"
          />

          <button className="bg-blue-600 px-8 text-white font-semibold hover:bg-blue-700 transition">
            Search
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex gap-6 justify-center flex-wrap">
          <button className="px-8 py-3 bg-blue-600 rounded-full font-semibold hover:bg-blue-700 transition">
            Explore Clubs
          </button>

          <button className="px-8 py-3 bg-white/10 border border-white/20 rounded-full font-semibold hover:bg-white/20 transition">
            Upcoming Events
          </button>
        </div>
      </div>
    </section>
  );
}
