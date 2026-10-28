export const BURRIANA_CENTER: [number, number] = [39.8890, -0.0845];

export const SCHOOLS_BURRIANA = [
  'Col·legi Ntra. Sra. de la Consolació',
  'IES Llombai',
  'IES Jaume I',
  'Col·legi Salesians Burriana',
  'Col·legi Illes Columbretes',
  'Col·legi Villa Fátima',
  'Universitat Jaume I (UJI)',
  'Jóvenes de Burriana / Altres',
] as const;

export const BURRIANA_PRESET_PLACES = [
  { name: 'Heladería Don Pipo', address: 'Camí del Grao, 7, 12530 Burriana', lat: 39.8872, lng: -0.0798 },
  { name: 'Heladería Hand\'s (Hans)', address: 'Avinguda de la Mediterrània, 33 (Passeig Arenal / Port), 12530 Burriana', lat: 39.8665, lng: -0.0630 },
  { name: 'McDonald\'s Burriana', address: 'Avinguda de Londres, 2 (Polígon Carabona), 12530 Burriana', lat: 39.8970, lng: -0.0982 },
  { name: 'Burger King Burriana', address: 'Avinguda de la Marina, 12 (Novenes de Calatrava), 12530 Burriana', lat: 39.8857, lng: -0.0759 },
  { name: 'Playa del Arenal (Zona Vóley)', address: 'Passeig Marítim de l\'Arenal, s/n, 12530 Burriana', lat: 39.8732, lng: -0.0610 },
  { name: 'Paratge Natural Clot de la Mare de Déu', address: 'Camí del Grau al Clot / Ermita de la Misericòrdia, 12530 Burriana', lat: 39.8785, lng: -0.0712 },
  { name: 'El Pla / Plaça Major', address: 'Plaça Major, 1 (Ajuntament & Centre), 12530 Burriana', lat: 39.8888, lng: -0.0842 },
  { name: 'Port Pesquer i Nàutic', address: 'Dàrsena de Burriana / Moll de Llevant, 12530 Burriana', lat: 39.8655, lng: -0.0645 },
  { name: 'Poliesportiu La Bosca', address: 'Carrer de la Bosca, s/n, 12530 Burriana', lat: 39.8850, lng: -0.0965 },
  { name: 'Plaça de la Mercè (Tardeo Jove)', address: 'Plaça de la Mercè, s/n (Centre Cultural), 12530 Burriana', lat: 39.8912, lng: -0.0818 },
  { name: 'Casal Jove de Burriana', address: 'Carrer d\'Ausiàs March, 36, 12530 Burriana', lat: 39.8935, lng: -0.0850 },
  { name: 'Biblioteca Municipal de Burriana', address: 'Carrer Major, 33, 12530 Burriana', lat: 39.8896, lng: -0.0835 },
  { name: 'Skatepark & Jardí de la Música (Arenal)', address: 'Avinguda de la Mediterrània s/n, 12530 Burriana', lat: 39.8715, lng: -0.0635 },
];

export const AVAILABLE_INTERESTS = [
  'Voleibol playa',
  'Fútbol sala',
  'Skate & Rollers',
  'Pádel',
  'Bicicleta & Clot',
  'Música en directo',
  'Arenal Sound vibe',
  'Tardeo & Merienda',
  'Helados en Hans & Don Pipo',
  'Fotografía de calle',
  'Gaming & LoL/FIFA',
  'Anime & Cultura Pop',
  'Estudio & Biblio',
  'Senderismo natural',
  'Playa & Puesta de sol',
];

export const CATEGORY_MAP: Record<string, { label: string; emoji: string; color: string; border: string }> = {
  playa: { label: 'Playa & Mar', emoji: '🏖️', color: 'bg-cyan-500/20 text-cyan-400', border: 'border-cyan-500/30' },
  deporte: { label: 'Deporte & Vóley', emoji: '🏐', color: 'bg-emerald-500/20 text-emerald-400', border: 'border-emerald-500/30' },
  naturaleza: { label: 'Naturaleza & Clot', emoji: '🌿', color: 'bg-green-500/20 text-green-400', border: 'border-green-500/30' },
  tardeo: { label: 'Tardeo & Merienda', emoji: '🥤', color: 'bg-amber-500/20 text-amber-400', border: 'border-amber-500/30' },
  musica: { label: 'Música & Conciertos', emoji: '🎸', color: 'bg-purple-500/20 text-purple-400', border: 'border-purple-500/30' },
  estudio: { label: 'Estudio & Biblio', emoji: '📚', color: 'bg-blue-500/20 text-blue-400', border: 'border-blue-500/30' },
  videojuegos: { label: 'Gaming & Torneos', emoji: '🎮', color: 'bg-pink-500/20 text-pink-400', border: 'border-pink-500/30' },
  quedada: { label: 'Quedada abierta', emoji: '⚡', color: 'bg-orange-500/20 text-orange-400', border: 'border-orange-500/30' },
};
