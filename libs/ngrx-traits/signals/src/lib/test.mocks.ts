import { Product } from './test.model';

const snes = [
  'Super Mario World',
  'F-Zero',
  'Pilotwings',
  'SimCity',
  'Super Tennis',
  'Mario Paint',
  'Super Mario Kart',
  'Super Scope 6',
  'BattleClash',
  'The Legend of Zelda: A Link to the Past',
  'Super Play Action Football',
  'NCAA Basketball',
  'Super Soccer',
  'Star Fox',
  'Super Mario All-Stars',
  "Yoshi's Safari",
  'Vegas Stakes',
  "Metal Combat: Falcon's Revenge",
  'NHL Stanley Cup',
  'Mario & Wario',
  "Yoshi's Cookie",
  'Super Metroid',
  'Stunt Race FX',
  'Donkey Kong Country',
  'Ken Griffey Jr. Presents Major League Baseball',
  'Super Pinball: Behind the Mask',
  'Super Punch-Out!!',
  'Tin Star',
  'Tetris 2',
  'Tetris & Dr. Mario',
  'Uniracers',
  "Wario's Woods",
  'Super Mario All Stars',
  'Super Mario World',
  'Illusion of Gaia',
  'Fire Emblem: Monshou no Nazo',
  'Mega Man 6',
  'EarthBound',
  "Kirby's Dream Course",
  "Super Mario World 2: Yoshi's Island",
  "Donkey Kong Country 2: Diddy's Kong Quest",
  "Kirby's Avalanche",
  'Killer Instinct',
  "Mario's Super Picross",
  'Panel de Pon',
  'Super Mario RPG: Legend of the Seven Stars',
  'Kirby Super Star',
  "Donkey Kong Country 3: Dixie Kong's Double Trouble!",
  "Ken Griffey Jr.'s Winning Run",
  'Tetris Attack',
  'Fire Emblem: Seisen no Keifu',
  'Marvelous: Another Treasure Island',
  'Maui Mallard in Cold Shadow',
  'Arkanoid: Doh it Again',
  "Kirby's Dream Land 3",
  'Heisei Shin Onigashima',
  'Space Invaders: The Original Game',
  "Wrecking Crew '98",
  'Kirby no Kirakira Kizzu',
  'Sutte Hakkun',
  'Zoo-tto Mahjong!',
  'Power Soukoban',
  'Fire Emblem: Thracia 776',
  'Famicom Bunko: Hajimari no Mori',
  'Power Lode Runner',
];
const gamecube = [
  "Luigi's Mansion",
  'Wave Race: Blue Storm',
  'Super Smash Bros. Melee',
  'Pikmin',
  'Animal Crossing',
  "Disney's Magical Mirror Starring Mickey Mouse",
  "Eternal Darkness: Sanity's Requiem",
  'Mario Party 4',
  'Metroid Prime',
  'NBA Courtside 2002',
  'Star Fox Adventures',
  'Super Mario Sunshine',
  'Cubivore: Survival of the Fittest',
  'Doshin the Giant',
  '1080° Avalanche',
  'F-Zero GX',
  'Kirby Air Ride',
  "The Legend of Zelda Collector's Edition",
  'The Legend of Zelda: Ocarina of Time Master Quest',
  'The Legend of Zelda: The Wind Waker',
  'Mario Golf: Toadstool Tour',
  'Mario Kart: Double Dash‼',
  'Mario Party 5',
  'Pokémon Channel',
  'Wario World',
  'GiFTPiA',
  'Nintendo Puzzle Collection',
  'Custom Robo',
  'Donkey Konga',
  'Metal Gear Solid: The Twin Snakes',
  'The Legend of Zelda: Four Swords Adventure',
  'Mario Party 6',
  'Mario Power Tennis',
  'Metroid Prime 2: Echoes',
  'Paper Mario: The Thousand-Year Door',
  'Pikmin 2',
  'Pokémon Box: Ruby and Sapphire',
  'Pokémon Colosseum',
  'WarioWare, Inc.: Mega Party Game$',
  'Final Fantasy: Crystal Chronicles',
  'Kururin Squash!',
  'Battalion Wars',
  'Dance Dance Revolution: Mario Mix',
  'Donkey Konga 2',
  'Donkey Kong Jungle Beat',
  'Fire Emblem: Path of Radiance',
  'Geist',
  'Mario Party 7',
  'Mario Superstar Baseball',
  'Pokémon XD: Gale of Darkness',
  'Star Fox: Assault',
  'Super Mario Strikers',
  'Densetsu no Quiz Ou Ketteisen',
  'Donkey Konga 3',
  'Chibi-Robo!',
  'The Legend of Zelda: Twilight Princess',
  'Odama',
];
export const mockProducts = [
  ...snes.map((name, id) => ({
    name,
    id: id + '',
    description: 'Super Nintendo Game',
    price: id * 2 + 10,
    categoryId: 'snes',
  })),
  ...gamecube.map((name, id) => ({
    name,
    id: snes.length + id + '',
    description: 'GameCube Game',
    price: id * 3 + 10,
    categoryId: 'gamecube',
  })),
] as Product[];
