import { Genre, Product } from './models';
import { getRandomInteger } from './utils';

interface GameData {
  name: string;
  genre: Genre;
  description: string;
}

const snesGames: GameData[] = [
  {
    name: 'Super Mario World',
    genre: 'platformer',
    description:
      'Side-scrolling platformer where Mario explores Dinosaur Land to rescue Princess Peach from Bowser.',
  },
  {
    name: 'F-Zero',
    genre: 'racing',
    description:
      'Futuristic high-speed racing game set in the year 2560 featuring Captain Falcon.',
  },
  {
    name: 'Pilotwings',
    genre: 'action',
    description:
      'Flight simulation game where players complete skydiving, hang gliding, and rocket belt missions.',
  },
  {
    name: 'SimCity',
    genre: 'puzzle',
    description:
      'City-building simulation where players design and manage a growing metropolis.',
  },
  {
    name: 'Super Tennis',
    genre: 'sports',
    description:
      'Tennis simulation featuring multiple court surfaces and tournament modes.',
  },
  {
    name: 'Mario Paint',
    genre: 'puzzle',
    description:
      'Creative suite for drawing, animating, and composing music with Mario-themed tools.',
  },
  {
    name: 'Super Mario Kart',
    genre: 'racing',
    description:
      'Kart racing game featuring Mario characters competing on Mode 7 tracks.',
  },
  {
    name: 'Super Scope 6',
    genre: 'action',
    description: 'Light gun game collection featuring six shooting mini-games.',
  },
  {
    name: 'BattleClash',
    genre: 'action',
    description:
      'First-person mech combat game using the Super Scope light gun.',
  },
  {
    name: 'The Legend of Zelda: A Link to the Past',
    genre: 'adventure',
    description:
      'Top-down action-adventure where Link travels between Light and Dark Worlds to rescue Princess Zelda.',
  },
  {
    name: 'Super Play Action Football',
    genre: 'sports',
    description:
      'American football simulation with multiple teams and play strategies.',
  },
  {
    name: 'NCAA Basketball',
    genre: 'sports',
    description:
      'College basketball simulation featuring real NCAA teams and tournament play.',
  },
  {
    name: 'Super Soccer',
    genre: 'sports',
    description:
      'International soccer game with multiple national teams and tournament modes.',
  },
  {
    name: 'Star Fox',
    genre: 'action',
    description:
      'Rail shooter where Fox McCloud pilots an Arwing to defend the Lylat system from Andross.',
  },
  {
    name: 'Super Mario All-Stars',
    genre: 'platformer',
    description:
      'Compilation of remastered NES Mario games with enhanced 16-bit graphics.',
  },
  {
    name: "Yoshi's Safari",
    genre: 'action',
    description:
      'Light gun rail shooter where Mario rides Yoshi through Jewelry Land.',
  },
  {
    name: 'Vegas Stakes',
    genre: 'puzzle',
    description:
      'Casino simulation featuring blackjack, poker, slots, and roulette in Las Vegas.',
  },
  {
    name: "Metal Combat: Falcon's Revenge",
    genre: 'action',
    description:
      'Mech battle game using the Super Scope where players fight enemy Standing Tanks.',
  },
  {
    name: 'NHL Stanley Cup',
    genre: 'sports',
    description:
      'Ice hockey simulation featuring NHL teams competing for the Stanley Cup.',
  },
  {
    name: 'Mario & Wario',
    genre: 'puzzle',
    description:
      'Puzzle platformer where a fairy guides Mario through obstacle courses using a mouse.',
  },
  {
    name: "Yoshi's Cookie",
    genre: 'puzzle',
    description:
      'Tile-matching puzzle game where players align rows and columns of cookies.',
  },
  {
    name: 'Super Metroid',
    genre: 'adventure',
    description:
      'Atmospheric action-adventure where bounty hunter Samus Aran infiltrates planet Zebes.',
  },
  {
    name: 'Stunt Race FX',
    genre: 'racing',
    description:
      'Polygon-based racing game featuring vehicles with cartoon-like eyes and expressions.',
  },
  {
    name: 'Donkey Kong Country',
    genre: 'platformer',
    description:
      'Side-scrolling platformer where Donkey Kong and Diddy Kong reclaim their stolen banana hoard.',
  },
  {
    name: 'Ken Griffey Jr. Presents Major League Baseball',
    genre: 'sports',
    description: 'Baseball simulation featuring MLB players and stadiums.',
  },
  {
    name: 'Super Pinball: Behind the Mask',
    genre: 'puzzle',
    description:
      'Pinball simulation with three uniquely themed tables and bonus stages.',
  },
  {
    name: 'Super Punch-Out!!',
    genre: 'fighting',
    description:
      'Boxing game where players fight through circuits of increasingly tough opponents.',
  },
  {
    name: 'Tin Star',
    genre: 'action',
    description:
      'Light gun western shooter where a robot sheriff defends a frontier town.',
  },
  {
    name: 'Tetris 2',
    genre: 'puzzle',
    description:
      'Block-stacking puzzle game with color-matching mechanics and competitive multiplayer.',
  },
  {
    name: 'Tetris & Dr. Mario',
    genre: 'puzzle',
    description:
      'Two-in-one puzzle compilation combining classic Tetris with Dr. Mario.',
  },
  {
    name: 'Uniracers',
    genre: 'racing',
    description:
      'Unicycle racing game featuring stunts and tricks on side-scrolling tracks.',
  },
  {
    name: "Wario's Woods",
    genre: 'puzzle',
    description:
      'Action puzzle game where Toad arranges bombs and monsters to clear stages.',
  },
  {
    name: 'Super Mario All Stars',
    genre: 'platformer',
    description:
      'Enhanced collection of classic NES Mario adventures with updated visuals.',
  },
  {
    name: 'Super Mario World',
    genre: 'platformer',
    description:
      "Mario's adventure through Dinosaur Land with new cape and Yoshi mechanics.",
  },
  {
    name: 'Illusion of Gaia',
    genre: 'rpg',
    description:
      'Action RPG following a boy named Will who explores ancient ruins with psychic powers.',
  },
  {
    name: 'Fire Emblem: Monshou no Nazo',
    genre: 'rpg',
    description:
      'Tactical RPG featuring strategic grid-based battles in the continent of Archanea.',
  },
  {
    name: 'Mega Man 6',
    genre: 'action',
    description:
      'Side-scrolling action game where Mega Man battles Robot Masters in a world tournament.',
  },
  {
    name: 'EarthBound',
    genre: 'rpg',
    description:
      'Quirky RPG where a boy named Ness and friends save the world from an alien invasion.',
  },
  {
    name: "Kirby's Dream Course",
    genre: 'puzzle',
    description:
      'Miniature golf game where Kirby is the ball on surreal floating courses.',
  },
  {
    name: "Super Mario World 2: Yoshi's Island",
    genre: 'platformer',
    description:
      'Platformer where Yoshi carries Baby Mario through hand-drawn styled worlds.',
  },
  {
    name: "Donkey Kong Country 2: Diddy's Kong Quest",
    genre: 'platformer',
    description:
      'Platformer where Diddy and Dixie Kong rescue Donkey Kong from Kaptain K. Rool.',
  },
  {
    name: "Kirby's Avalanche",
    genre: 'puzzle',
    description:
      'Competitive falling-block puzzle game featuring Kirby characters.',
  },
  {
    name: 'Killer Instinct',
    genre: 'fighting',
    description:
      'Combo-heavy fighting game featuring a diverse roster of fighters in a tournament.',
  },
  {
    name: "Mario's Super Picross",
    genre: 'puzzle',
    description:
      'Nonogram puzzle game where players reveal hidden pictures by solving number clues.',
  },
  {
    name: 'Panel de Pon',
    genre: 'puzzle',
    description:
      'Fast-paced block-swapping puzzle game with chain reaction combos.',
  },
  {
    name: 'Super Mario RPG: Legend of the Seven Stars',
    genre: 'rpg',
    description:
      'RPG blending Mario platforming with turn-based combat and timed button presses.',
  },
  {
    name: 'Kirby Super Star',
    genre: 'platformer',
    description:
      'Collection of platforming sub-games starring Kirby with unique copy abilities.',
  },
  {
    name: "Donkey Kong Country 3: Dixie Kong's Double Trouble!",
    genre: 'platformer',
    description:
      'Platformer where Dixie and Kiddy Kong explore the Northern Kremisphere.',
  },
  {
    name: "Ken Griffey Jr.'s Winning Run",
    genre: 'sports',
    description:
      'Baseball game with full MLB license and enhanced 3D graphics.',
  },
  {
    name: 'Tetris Attack',
    genre: 'puzzle',
    description:
      'Panel-swapping puzzle game with competitive versus mode and endless challenge.',
  },
  {
    name: 'Fire Emblem: Seisen no Keifu',
    genre: 'rpg',
    description: 'Epic tactical RPG spanning two generations of holy warriors.',
  },
  {
    name: 'Marvelous: Another Treasure Island',
    genre: 'adventure',
    description:
      'Adventure game where three boys search for pirate treasure on a mysterious island.',
  },
  {
    name: 'Maui Mallard in Cold Shadow',
    genre: 'platformer',
    description:
      'Platformer starring Donald Duck as detective Maui Mallard with ninja transformation.',
  },
  {
    name: 'Arkanoid: Doh it Again',
    genre: 'puzzle',
    description: 'Block-breaking arcade game with power-ups and boss battles.',
  },
  {
    name: "Kirby's Dream Land 3",
    genre: 'platformer',
    description:
      'Platformer where Kirby and animal friends cleanse Dream Land from dark matter.',
  },
  {
    name: 'Heisei Shin Onigashima',
    genre: 'adventure',
    description:
      'Text adventure retelling Japanese folklore with point-and-click puzzle solving.',
  },
  {
    name: 'Space Invaders: The Original Game',
    genre: 'action',
    description:
      'Classic arcade shooter defending Earth from waves of descending alien invaders.',
  },
  {
    name: "Wrecking Crew '98",
    genre: 'puzzle',
    description:
      'Competitive puzzle game combining block-matching with Wrecking Crew demolition.',
  },
  {
    name: 'Kirby no Kirakira Kizzu',
    genre: 'puzzle',
    description:
      'Falling-block puzzle game where Kirby matches star pieces in chain combos.',
  },
  {
    name: 'Sutte Hakkun',
    genre: 'puzzle',
    description:
      'Puzzle platformer where a character absorbs and injects colors to solve stages.',
  },
  {
    name: 'Zoo-tto Mahjong!',
    genre: 'puzzle',
    description:
      'Mahjong tile game featuring zoo animals and colorful themed layouts.',
  },
  {
    name: 'Power Soukoban',
    genre: 'puzzle',
    description:
      'Box-pushing puzzle game where players navigate crates to designated positions.',
  },
  {
    name: 'Fire Emblem: Thracia 776',
    genre: 'rpg',
    description:
      'Challenging tactical RPG set during the liberation of the Thracian peninsula.',
  },
  {
    name: 'Famicom Bunko: Hajimari no Mori',
    genre: 'adventure',
    description:
      'Interactive story adventure set in a mysterious forest with branching narratives.',
  },
  {
    name: 'Power Lode Runner',
    genre: 'puzzle',
    description:
      'Strategic puzzle platformer where players dig through floors to trap enemies.',
  },
];

const gamecubeGames: GameData[] = [
  {
    name: "Luigi's Mansion",
    genre: 'adventure',
    description:
      'Luigi explores a haunted mansion with a vacuum cleaner to rescue Mario from ghosts.',
  },
  {
    name: 'Wave Race: Blue Storm',
    genre: 'racing',
    description:
      'Jet ski racing game with realistic water physics and dynamic weather effects.',
  },
  {
    name: 'Super Smash Bros. Melee',
    genre: 'fighting',
    description:
      'Crossover fighting game where Nintendo characters battle on interactive stages.',
  },
  {
    name: 'Pikmin',
    genre: 'adventure',
    description:
      'Strategy adventure where Captain Olimar commands plant-like Pikmin to collect spaceship parts.',
  },
  {
    name: 'Animal Crossing',
    genre: 'adventure',
    description:
      'Life simulation where players build a home and befriend animal villagers in real time.',
  },
  {
    name: "Disney's Magical Mirror Starring Mickey Mouse",
    genre: 'adventure',
    description:
      'Point-and-click adventure where Mickey Mouse navigates a magical mirror world.',
  },
  {
    name: "Eternal Darkness: Sanity's Requiem",
    genre: 'adventure',
    description:
      'Psychological horror adventure spanning multiple time periods with sanity mechanics.',
  },
  {
    name: 'Mario Party 4',
    genre: 'puzzle',
    description:
      'Party game featuring board game strategy and competitive mini-games for four players.',
  },
  {
    name: 'Metroid Prime',
    genre: 'action',
    description:
      'First-person action-adventure where Samus explores the planet Tallon IV.',
  },
  {
    name: 'NBA Courtside 2002',
    genre: 'sports',
    description:
      'Basketball simulation with NBA teams and players featuring realistic gameplay.',
  },
  {
    name: 'Star Fox Adventures',
    genre: 'adventure',
    description:
      'Action-adventure where Fox McCloud explores Dinosaur Planet on foot.',
  },
  {
    name: 'Super Mario Sunshine',
    genre: 'platformer',
    description:
      'Platformer where Mario uses a water-spraying backpack to clean Isle Delfino.',
  },
  {
    name: 'Cubivore: Survival of the Fittest',
    genre: 'adventure',
    description:
      'Surreal survival game where a cubic creature evolves by eating other cubivores.',
  },
  {
    name: 'Doshin the Giant',
    genre: 'adventure',
    description:
      'God simulation where a giant raises and destroys civilizations on a tropical island.',
  },
  {
    name: '1080° Avalanche',
    genre: 'sports',
    description:
      'Snowboarding game with downhill races and avalanche survival challenges.',
  },
  {
    name: 'F-Zero GX',
    genre: 'racing',
    description:
      'Ultra-fast futuristic racer with 30 pilots and a story mode featuring Captain Falcon.',
  },
  {
    name: 'Kirby Air Ride',
    genre: 'racing',
    description:
      'Simplified racing game where Kirby rides star vehicles across dream-themed tracks.',
  },
  {
    name: "The Legend of Zelda Collector's Edition",
    genre: 'adventure',
    description:
      'Compilation disc containing four classic Zelda games and demo content.',
  },
  {
    name: 'The Legend of Zelda: Ocarina of Time Master Quest',
    genre: 'adventure',
    description:
      'Remixed version of Ocarina of Time with redesigned dungeon puzzles.',
  },
  {
    name: 'The Legend of Zelda: The Wind Waker',
    genre: 'adventure',
    description:
      'Cel-shaded adventure where Link sails a vast ocean to rescue his sister.',
  },
  {
    name: 'Mario Golf: Toadstool Tour',
    genre: 'sports',
    description:
      'Golf game featuring Mario characters on fantasy-themed courses.',
  },
  {
    name: 'Mario Kart: Double Dash‼',
    genre: 'racing',
    description:
      'Kart racer with two-character teams sharing a single kart on colorful tracks.',
  },
  {
    name: 'Mario Party 5',
    genre: 'puzzle',
    description:
      'Party board game with dream-themed boards and over 75 mini-games.',
  },
  {
    name: 'Pokémon Channel',
    genre: 'adventure',
    description:
      'Interactive experience where players watch TV shows and explore with Pikachu.',
  },
  {
    name: 'Wario World',
    genre: 'platformer',
    description:
      '3D brawler-platformer where Wario punches through enemies to reclaim his treasure.',
  },
  {
    name: 'GiFTPiA',
    genre: 'adventure',
    description:
      'Life simulation adventure set on a tropical island with quirky characters.',
  },
  {
    name: 'Nintendo Puzzle Collection',
    genre: 'puzzle',
    description:
      'Compilation of three classic Nintendo puzzle games with updated graphics.',
  },
  {
    name: 'Custom Robo',
    genre: 'action',
    description:
      'Arena combat game where players customize miniature robots for battles.',
  },
  {
    name: 'Donkey Konga',
    genre: 'puzzle',
    description:
      'Rhythm game played with bongo controllers featuring popular music tracks.',
  },
  {
    name: 'Metal Gear Solid: The Twin Snakes',
    genre: 'action',
    description:
      'Stealth action remake of the PlayStation classic set in a nuclear facility.',
  },
  {
    name: 'The Legend of Zelda: Four Swords Adventure',
    genre: 'adventure',
    description:
      'Cooperative adventure where four Links solve puzzles across Hyrule.',
  },
  {
    name: 'Mario Party 6',
    genre: 'puzzle',
    description:
      'Party game with day-and-night cycle boards and microphone mini-games.',
  },
  {
    name: 'Mario Power Tennis',
    genre: 'sports',
    description:
      'Tennis game featuring Mario characters with unique power shots and courts.',
  },
  {
    name: 'Metroid Prime 2: Echoes',
    genre: 'action',
    description:
      'First-person adventure where Samus battles between light and dark dimensions.',
  },
  {
    name: 'Paper Mario: The Thousand-Year Door',
    genre: 'rpg',
    description:
      'Paper-styled RPG where Mario explores Rogueport to find legendary treasure.',
  },
  {
    name: 'Pikmin 2',
    genre: 'adventure',
    description:
      'Strategy adventure where Olimar collects treasures in underground caves with Pikmin.',
  },
  {
    name: 'Pokémon Box: Ruby and Sapphire',
    genre: 'puzzle',
    description:
      'Storage and organization utility for managing Pokémon across Game Boy Advance games.',
  },
  {
    name: 'Pokémon Colosseum',
    genre: 'rpg',
    description:
      'RPG where a former villain captures and purifies Shadow Pokémon in Orre.',
  },
  {
    name: 'WarioWare, Inc.: Mega Party Game$',
    genre: 'puzzle',
    description:
      'Frantic multiplayer collection of lightning-fast micro-games lasting seconds each.',
  },
  {
    name: 'Final Fantasy: Crystal Chronicles',
    genre: 'rpg',
    description:
      'Action RPG where adventurers gather myrrh to protect their village from miasma.',
  },
  {
    name: 'Kururin Squash!',
    genre: 'puzzle',
    description:
      'Rotating stick navigation puzzle game with obstacle-filled stages.',
  },
  {
    name: 'Battalion Wars',
    genre: 'action',
    description:
      'Real-time tactical combat game blending third-person shooting with squad strategy.',
  },
  {
    name: 'Dance Dance Revolution: Mario Mix',
    genre: 'puzzle',
    description:
      'Rhythm dancing game featuring Mario-themed songs and dance pad gameplay.',
  },
  {
    name: 'Donkey Konga 2',
    genre: 'puzzle',
    description:
      'Rhythm game sequel with new songs played using bongo drum controllers.',
  },
  {
    name: 'Donkey Kong Jungle Beat',
    genre: 'platformer',
    description:
      'Platformer controlled with bongo drums where DK battles through jungle kingdoms.',
  },
  {
    name: 'Fire Emblem: Path of Radiance',
    genre: 'rpg',
    description:
      'Tactical RPG following mercenary Ike in a war between the nations of Tellius.',
  },
  {
    name: 'Geist',
    genre: 'action',
    description:
      'First-person game where a ghost possesses objects and people to solve puzzles.',
  },
  {
    name: 'Mario Party 7',
    genre: 'puzzle',
    description:
      'Globe-trotting party game with eight-player mini-games using a single controller.',
  },
  {
    name: 'Mario Superstar Baseball',
    genre: 'sports',
    description:
      'Baseball game combining Mario characters with arcade-style power-up gameplay.',
  },
  {
    name: 'Pokémon XD: Gale of Darkness',
    genre: 'rpg',
    description:
      'RPG sequel where a trainer battles the criminal Cipher organization in Orre.',
  },
  {
    name: 'Star Fox: Assault',
    genre: 'action',
    description:
      'Space combat game mixing Arwing dogfights with on-foot third-person missions.',
  },
  {
    name: 'Super Mario Strikers',
    genre: 'sports',
    description:
      'Aggressive arcade soccer game featuring Mario characters and power-up strikes.',
  },
  {
    name: 'Densetsu no Quiz Ou Ketteisen',
    genre: 'puzzle',
    description:
      'Japanese quiz game show simulation with trivia challenges and tournament battles.',
  },
  {
    name: 'Donkey Konga 3',
    genre: 'puzzle',
    description:
      'Third entry in the bongo rhythm series with Japanese pop and classic songs.',
  },
  {
    name: 'Chibi-Robo!',
    genre: 'adventure',
    description:
      'Adventure game where a tiny robot helps a dysfunctional family by cleaning their house.',
  },
  {
    name: 'The Legend of Zelda: Twilight Princess',
    genre: 'adventure',
    description:
      'Epic adventure where Link transforms into a wolf to save Hyrule from twilight.',
  },
  {
    name: 'Odama',
    genre: 'action',
    description:
      'Unique pinball-strategy hybrid where a giant ball crushes enemies on a feudal battlefield.',
  },
];

const host = 'http://localhost:3000/';
export const mockProducts: Product[] = [
  ...snesGames.map((game, id) => ({
    id: id + '',
    name: game.name,
    description: game.description,
    genre: game.genre,
    console: 'snes' as const,
    price: getRandomInteger(10, 20),
    image: `${host}assets/images/games/${id}.jpg`,
  })),
  ...gamecubeGames.map((game, id) => ({
    id: snesGames.length + id + '',
    name: game.name,
    description: game.description,
    genre: game.genre,
    console: 'gamecube' as const,
    price: getRandomInteger(20, 40),
    image: `${host}assets/images/games/${snesGames.length + id}.jpg`,
  })),
];
