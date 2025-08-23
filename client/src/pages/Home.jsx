import React from 'react';

const Home = () => (
  <section className="text-center">
    <img
      src="/homepage_pic.jpg"
      alt="Polo Horse Banner"
      className="w-full h-[300px] object-cover mb-8"
    />
   <h2 className="text-4xl font-semibold mb-4">Welcome to Polo Prospect</h2>
    <p className="text-lg text-gray-600 mb-10">
     Exclusively Polo. Unmatched Quality.
    </p>

    <div className="max-w-4xl mx-auto text-left space-y-6 px-4 md:px-0">
      <p>
        Polo is often called the “sport of kings” — and for good reason. Combining precision, teamwork, speed, and elegance, polo is a game where horse and rider perform in complete harmony. With deep roots in royal and military traditions dating back over 2,000 years, it is one of the oldest equestrian sports in the world. Whether played on lush grass fields or arenas, polo remains a global symbol of athleticism and prestige.
      </p>

      <p>
        Yet for a sport so rich in tradition, buying and selling polo horses has remained surprisingly fragmented — until now. Polo Prospects is the first platform dedicated exclusively to the buying and listing of polo horses. Our mission is to simplify and modernize the way players, trainers, and breeders connect over the perfect mount. Whether you're looking for your next tournament-ready partner or selling a promising young prospect, you’ve found the right place.
      </p>

      <p>
        Unlike generic horse sale sites, Polo Prospects focuses solely on the needs of the polo community. We understand the game, we know the horses, and we’ve built this platform with your priorities in mind. No noise, no clutter — just high-quality listings from around the world, tailored to the sport we all love. This is more than a marketplace; it’s a community hub for the modern polo player.
      </p>
    </div>
  </section>
)

export default Home;