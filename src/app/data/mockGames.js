export const mockGames = [
  {
    id: 1,
    title: "The Witcher 3: Wild Hunt",
    description: "Incarnez Geralt de Riv dans un monde ouvert dark fantasy...",
    genres: ["RPG", "Action", "Open World"],
    platforms: ["PC", "PS5", "Xbox Series X"],
    releaseDate: "2015-05-19",
    developer: "CD Projekt Red",
    rating: 9.5,
    price: 29.99,
    discount: 50, // en pourcentage
    tags: ["Narrative", "Choices", "Fantasy"],
    cover: "https://image.api.playstation.com/vulcan/ap/rnd/202211/0714/ojKZ7l0T2M5egR9YHIjVhI0R.png"
  },
  {
    id: 2,
    title: "Cyberpunk 2077",
    description: "Un RPG futuriste dans la métropole de Night City.",
    genres: ["RPG", "Action"],
    platforms: ["PC", "PS5", "Xbox Series X"],
    releaseDate: "2020-12-10",
    developer: "CD Projekt Red",
    rating: 8.3,
    price: 59.99,
    discount: 30,
    tags: ["Sci-Fi", "Shooter", "Story Rich"],
    cover: "https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg"
  }
];

export function getGameById(id) {
  return mockGames.find((g) => g.id === Number(id));
}
