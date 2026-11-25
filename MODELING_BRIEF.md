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
| Dato | Valor |
|---|---|
| Unidades / origen | Metros; origen en la esquina suroeste de la huella; Z arriba |
| Huella del edificio | Rectángulo aprox. 25.0 x 17.3 m (del predio de 536 m2; se ignora la ligera irregularidad) |
| Altura entrepiso | 3.5 m; 3 niveles + azotea con pretil de 1.0 m |
| Niveles | F00 (planta baja) z=0, F01 z=3.5, F02 z=7.0, ROOF z=10.5 |
| Bloque de servicio | 5.59 x 3.2 m en una esquina (de la captura del predio) |
| Distribución | Del croquis, escalada a la huella (el croquis es esquemático) |

Nota: el croquis llama "1er planta" tanto al plano como a la lista de la derecha. Se interpreta como planta baja. Los niveles superiores (pisos 2 y 3 del croquis) son F01 y F02 aquí.

## Contrato de capas (el visor depende de estos nombres)
- Pisos: `F00_Ground`, `F01_Level1`, `F02_Level2`, `ROOF`. Sub-capas por material: `F00_Glass`, `F00_Panel`, etc.
- Zonas (superficies planas justo sobre el piso): `Z_F00_Reception`, `Z_F00_WC`, `Z_F00_MusicStore`, `Z_F00_Dressing`, `Z_F00_Stage`, `Z_F00_Cafe`, `Z_F00_Lounge`, `Z_F01_Photo`, `Z_F01_Podcast`, `Z_F01_Bath`, `Z_F02_Recording`, `Z_F02_Drums`, `Z_F02_Break`, `Z_F02_Bath`.
- Hotspots (puntos con nombre): capa `HOTSPOTS`, por ejemplo `HS_Entrance`, `HS_Stage`, `HS_Cafe`, `HS_Podcast`, `HS_Recording`, `HS_FacadeWall`.
- Contexto (calle, banqueta, árboles simples): capa `CONTEXT`.

## Materiales (nombres de material, del render)
`MAT_Graphite` (paneles grafito mate), `MAT_Glass` (vidrio oscuro), `MAT_Gold_Perforated` (celosía dorada), `MAT_LED_Warm` (emisivo ámbar), `MAT_Sign_White` (letrero LOUD emisivo), `MAT_Yellow_Lobby`, `MAT_Planter_Green`, `MAT_Floor_Concrete`, `MAT_Wood_Interior`. En la primera pasada todo en gris; los materiales se aplican en la fase 4.

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
