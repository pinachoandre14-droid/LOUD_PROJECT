# Brief para la sesión de modelado (Rhino 8)

Estado al cierre de la sesión de planeación (2026-11-25):
- Repo público listo: https://github.com/pinachoandre14-droid/LOUD_PROJECT
- Link vivo con un placeholder: https://pinachoandre14-droid.github.io/LOUD_PROJECT/
- Plan completo en `PLAN.md`. Este archivo es el arranque práctico del modelado.
- Referencias locales (NO subir a git): `reference/` (render, croquis de distribución, 2 capturas del predio).

## Antes de empezar (usuario)
1. Abrir Rhino 8 con un archivo **vacío**, unidades en **metros**.
2. Guardar el `.3dm` en esta carpeta del proyecto (`*.3dm` ya está en `.gitignore`, no se sube).
3. Verificar que el servidor Rhino MCP esté conectado.

## Primer paso de Claude
`get_context`, luego `get_modeling_guidance` (overview, organization, verification). Inspeccionar el documento antes de editar.

## Suposiciones de trabajo (estimadas, se corrigen después)
Actualizado el 2026-11-25 con las decisiones del usuario: huella real del predio, el render manda sobre el look, circulaciones de 1.1 m, aforo mínimo de 25 personas. La línea punteada de la captura NO es límite del predio.

| Dato | Valor |
|---|---|
| Archivo | `LOUD_model_v2.3dm` (vigente) y `LOUD_model.3dm` (v1), en esta carpeta, ignorados por git |
| Unidades / origen | Metros; origen en la esquina suroeste; X a lo largo de la calle (frente sur); Z arriba |
| Huella del edificio | Predio real: SO(0,0), SE(27.13,0), NE(24.55,20.77), NO(-0.71,20.32); lados 27.13/20.93/25.26/20.33 m; ~538 m2 (levantamiento: 536) |
| Alturas | Planta baja 4.5 m; niveles 1 y 2 de 4.0 m; losas de 0.30 m; pretil hasta z=13.7 |
| Niveles | F00 z=0, F01 z=4.5, F02 z=8.5, ROOF z=12.5 |
| Fachada (frente sur, del render) | Celosía dorada x 4.0-11.1; banda central grafito x 13.8-16.3 con LED vertical en x=13.8; entrada bajo el letrero LOUD x 16.3-23.6; caja de vidrio x 16.3-27.13 en F01-F02 que da vuelta a la esquina este; terrazas con jardinera al frente izquierdo (vidrio remetido 2 m); muro facetado en diagonal en F02 x 6.0-13.8 |
| Núcleo | Escalera en U x 19.7-22.2, y 15.0-20.2; elevador x 22.4-24.3, y 14.8-17.0; ducto sanitario x 21.9-este, y 6.0-13.5 en los 3 niveles |
| Circulaciones | 1.1 m: pasillo este-oeste y 13.5-14.6; pasillo norte-sur x 20.8-21.9 |
| Cuarto de servicio | Esquina SE detrás del macizo derecho, x 23.6-este, y 0.25-3.5 |
| Doble altura (v2) | Vacío en la losa del N1 sobre el café, x 6.9-15.0, y 3.0-12.6, con 4 columnas grafito con LED, jardineras con plantas colgantes y barandal de vidrio en el borde |
| Programa v2 (2026-11-26) | N1: break room al frente izquierdo (x oeste-6.4, y 2.0-13.5), fotos al fondo izquierdo, podcast en la caja de vidrio, galería alrededor del vacío. N2: grabación y control tras el muro facetado con frentes de vidrio, batería y cabina de voz en la caja de vidrio, lounge de producción junto a la terraza, bodega al fondo |
| Aforo estimado | ~75 lugares sentados más bancos de barra, por encima del mínimo de 25 |
| Peso actual | ~12 900 triángulos; GLB de 776 KB con 80 mallas (fusionadas por piso, capa y material al exportar) |

Aclarado por el usuario: el dibujo del croquis es la **1er planta** (planta baja, F00). Debajo del dibujo están las listas de usos: "1er planta" (resumen de lo mismo), "2da planta" (= F01) y "3er planta" (= F02). Solo la planta baja tiene plano dibujado; F01 y F02 tienen únicamente lista de usos, así que sus distribuciones se estiman.

## Contrato de capas (el visor depende de estos nombres)
- Pisos: `F00_Ground`, `F01_Level1`, `F02_Level2`, `ROOF`. Sub-capas por material: `F00_Glass`, `F00_Panel`, etc.
- Sub-capas usadas: `Slab`, `Panel`, `Glass`, `LED`, `Interior`, `Furniture`, `Planter` por piso; además `F00_Gold`, `F00_Sign`, `F00_Yellow`. `ROOF` solo tiene `Slab`, `Panel` y `LED`.
- Zonas (superficies planas justo sobre el piso, bajo la capa padre `ZONES`, apagada por defecto; cada superficie se llama igual que su capa): `Z_F00_Reception`, `Z_F00_WC`, `Z_F00_MusicStore`, `Z_F00_Dressing`, `Z_F00_Stage`, `Z_F00_Cafe`, `Z_F00_Lounge`, `Z_F00_Service`, `Z_F01_Break`, `Z_F01_Photo`, `Z_F01_Podcast`, `Z_F01_Bath`, `Z_F01_Lounge`, `Z_F01_Support`, `Z_F02_Recording`, `Z_F02_Drums`, `Z_F02_Bath`, `Z_F02_Lounge`, `Z_F02_Storage`.
- Hotspots (puntos con nombre) en la capa `HOTSPOTS`: `HS_Entrance`, `HS_GoldScreen`, `HS_Stage`, `HS_Cafe`, `HS_MusicStore`, `HS_Terrace`, `HS_Photo`, `HS_Podcast`, `HS_Recording`, `HS_Drums`, `HS_Break`, `HS_FacadeWall`.
- Contexto: capa `CONTEXT` con `CTX_Ground` (banquetas y calles sur y este) y `CTX_Trees` (3 árboles de baja resolución).
- Mobiliario repetido como bloques: `BLK_TableSet`, `BLK_PodcastTable`, `BLK_HighTable`, `BLK_BarStool`, `BLK_LoungeChair`, `BLK_Sofa`, `BLK_CoffeeTable`, `BLK_RoundCoffee`, `BLK_Speaker`, `BLK_DrumKit`, `BLK_Softbox`.
- Luces interiores (puntos con nombre `LT_<piso>_<espacio>`, color, intensidad y distancia como texto de usuario) en la capa `LIGHTS`.
- Exportación: `rhino/export_viewer.py` escribe `public/models/building.glb` (nodos `PISO|capa|material`) y `public/data/scene.json` (niveles, hotspots y luces en coordenadas glTF: x, z, -y).

## Materiales (nombres de material, del render)
Materiales PBR definidos en `rhino/materials.py` como RenderMaterials de Rhino 8 (una sola instancia por nombre; asignar por índice duplica materiales en Rhino 8). Fachada: `MAT_Graphite`, `MAT_Glass`, `MAT_Gold_Perforated`, `MAT_LED_Warm` (emisivo), `MAT_Sign_White` (emisivo), `MAT_Yellow_Lobby`, `MAT_Planter_Green`. Interior (de las imágenes objetivo): `MAT_Floor_Concrete` (concreto pulido), `MAT_Floor_Dark` (piso oscuro del N2), `MAT_Concrete_Wall`, `MAT_Wood_Interior`, `MAT_Leather_Cognac`, `MAT_Fabric_Grey`, `MAT_Rug`, `MAT_Black_Matte`, `MAT_Metal_Black`, `MAT_Stone_Top`, `MAT_Pastry_Glass`, `MAT_Screen`. Contexto: `MAT_Asphalt`, `MAT_Sidewalk`, `MAT_Tree_Canopy`, `MAT_Tree_Trunk`. Zonas: `MAT_Z_*` translúcidos.

## Orden de trabajo del modelo
1. Capas y niveles (tabla anterior).
2. Masa por piso: losas, muros exteriores, aperturas de vidrio.
3. Rasgos de fachada: muro facetado plegado, jardineras/terrazas, celosía dorada, letrero LOUD, marquesinas con línea LED.
4. Interior de detalle bajo-medio: muros, escenario, barra del café, recepción, cabinas de grabación/podcast, mobiliario principal como volúmenes simples. Usar bloques para sillas/mesas.
5. Superficies de zonas y puntos de hotspots.
6. Verificar con `capture_viewport` y `analyze_objects`; revisar polígonos y capas.

## Presupuesto de peso (prioridad 1)
GLB menor a 12 MB (tope 25 MB); menos de ~300k triángulos; menos de ~100 draw calls; texturas de 1024 px, KTX2. Instanciar repetidos, sin props pequeños.

## Exportación y subida
1. Exportar `.glb` desde Rhino 8 (solo el modelo del visor) a `public/models/building.glb`.
2. Optimizar con `gltf-transform` (Meshopt/Draco, dedupe, weld, KTX2).
3. Commit y push a `main` publica automáticamente.

## Después del modelo (fase 3 del plan, en el visor)
Vista explosionada por piso, modo Zonas, hotspots con vuelo de cámara, interfaz bilingüe ES/EN, luego materiales y luz horneada para igualar el render.

## Seguridad (recordatorio)
Repo público. No subir `reference/`, `.3dm`, imágenes del cliente ni llaves. Revisar `git status` antes de cada push.
