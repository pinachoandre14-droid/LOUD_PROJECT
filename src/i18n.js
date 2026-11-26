// UI strings, zone and hotspot names in Spanish and English.
const STR = {
  es: {
    loading: 'Cargando modelo',
    floors: 'Pisos', all: 'Todo', F00: 'Planta baja', F01: 'Nivel 1', F02: 'Nivel 2',
    explode: 'Vista explotada', zones: 'Zonas', context: 'Contexto', lights: 'Luces interiores',
    points: 'Puntos de interés', reset: 'Vista inicial', legend: 'Zonas', close: 'Cerrar',
    hint: 'Arrastra para girar · pellizca o rueda para acercar',
  },
  en: {
    loading: 'Loading model',
    floors: 'Floors', all: 'All', F00: 'Ground floor', F01: 'Level 1', F02: 'Level 2',
    explode: 'Exploded view', zones: 'Zones', context: 'Context', lights: 'Interior lights',
    points: 'Points of interest', reset: 'Home view', legend: 'Zones', close: 'Close',
    hint: 'Drag to orbit · pinch or scroll to zoom',
  },
};

export const ZONES = {
  Z_F00_Reception: ['Recepción y lobby', 'Reception & lobby'],
  Z_F00_WC: ['Sanitarios', 'Restrooms'],
  Z_F00_MusicStore: ['Tienda de música', 'Music shop'],
  Z_F00_Dressing: ['Camerinos', 'Dressing rooms'],
  Z_F00_Stage: ['Escenario', 'Stage'],
  Z_F00_Cafe: ['Café y preparación', 'Café & food prep'],
  Z_F00_Lounge: ['Mesas y sillones', 'Tables & lounge'],
  Z_F00_Service: ['Cuarto de servicio', 'Service room'],
  Z_F01_Break: ['Break room', 'Break room'],
  Z_F01_Podcast: ['Cabinas de podcast', 'Podcast booths'],
  Z_F01_Photo: ['Estudio de fotos', 'Photo studio'],
  Z_F01_Support: ['Vestidor y bodega', 'Makeup & storage'],
  Z_F01_Bath: ['Baños', 'Restrooms'],
  Z_F01_Lounge: ['Galería sobre doble altura', 'Gallery over the atrium'],
  Z_F02_Recording: ['Sala de grabación y control', 'Recording & control room'],
  Z_F02_Drums: ['Sala de batería', 'Drum room'],
  Z_F02_Lounge: ['Lounge de producción', 'Production lounge'],
  Z_F02_Bath: ['Baños', 'Restrooms'],
  Z_F02_Storage: ['Bodega de equipo', 'Gear storage'],
};

export const HOTSPOTS = {
  HS_Entrance: ['Entrada y lobby', 'Entrance & lobby', 'Acceso bajo el letrero LOUD, lobby amarillo y recepción.', 'Entry under the LOUD sign, yellow lobby and reception.'],
  HS_GoldScreen: ['Celosía dorada', 'Golden screen', 'Lamas metálicas con patrón de onda sonora, iluminadas por la noche.', 'Metal fins with a sound-wave pattern, lit at night.'],
  HS_Stage: ['Escenario', 'Stage', 'Escenario elevado con telón negro, truss de luces y camerinos al lado.', 'Raised stage with black curtain, lighting truss and dressing rooms next door.'],
  HS_Cafe: ['Café', 'Café', 'Isla de café bajo la doble altura, con barra iluminada y mesas altas.', 'Café island under the double-height atrium, with a lit counter and high tables.'],
  HS_MusicStore: ['Tienda de música', 'Music shop', 'Frente de vidrio, muro de guitarras y discos.', 'Glass storefront, guitar wall and records.'],
  HS_Terrace: ['Terrazas', 'Terraces', 'Terrazas con jardineras y plantas colgantes en la fachada.', 'Planter terraces with cascading plants on the facade.'],
  HS_Photo: ['Estudio de fotos', 'Photo studio', 'Ciclorama blanco y luces de estudio.', 'White cyclorama and studio lights.'],
  HS_Podcast: ['Podcast', 'Podcast', 'Dos cabinas y un cuarto de control detrás de la fachada de vidrio.', 'Two booths and a control room behind the glass facade.'],
  HS_Break: ['Break room', 'Break room', 'Concreto, piel cognac y cocineta, con salida a la terraza.', 'Concrete, cognac leather and a kitchenette, opening to the terrace.'],
  HS_Recording: ['Sala de grabación', 'Recording studio', 'Cuarto de control con consola y sala de grabación tras el muro facetado.', 'Control room with console and live room behind the faceted wall.'],
  HS_Drums: ['Sala de batería', 'Drum room', 'Caja de vidrio iluminada hacia la calle, con cabina de voz.', 'Lit glass box facing the street, with a vocal booth.'],
  HS_FacadeWall: ['Muro facetado', 'Faceted wall', 'Paneles grafito plegados en diagonal: el gesto principal de la fachada.', 'Folded graphite panels on a diagonal: the main facade gesture.'],
};

let current = (navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
export const lang = () => current;
export const setLang = (l) => { current = l; document.documentElement.lang = l; };
export const t = (k) => STR[current][k] ?? k;
export const zoneName = (id) => (ZONES[id] ? ZONES[id][current === 'es' ? 0 : 1] : id);
export const hotspotText = (id) => {
  const h = HOTSPOTS[id];
  if (!h) return { title: id, body: '' };
  return current === 'es' ? { title: h[0], body: h[2] } : { title: h[1], body: h[3] };
};
