# LOUD 3D Visualizer: Project Plan (v2)

Status: planning only. Nothing is created on GitHub yet. The build happens in the next session.

## 1. Goal

A lightweight, invite-only web visualizer of the **LOUD** building (music/creative hub). It is modeled in Rhino 8 and must look faithful to the client render. It must run smoothly on laptop and phone browsers.

Confirmed requirements:
- Orbit, zoom, pan.
- Exploded view per floor.
- Hotspots / annotations.
- **Zonification**: each floor's program areas are shown, colored and labeled.
- **Materials**, matching the render.
- Lightest possible model (phone-first).
- **Hosting**: GitHub Pages. The link is public to anyone who has it (see section 3 for what that means for your data).
- **Bilingual UI**: Spanish and English with a language switch.
- **Interior modeled** at small-to-medium detail. Model weight is the top priority.
- Dimensions and details are **estimated first**, then refined through your corrections.
- Branding comes from the render.

## 2. What the project files tell us

| File | What it gives us |
|---|---|
| WhatsApp render (dusk facade) | Look and feel, materials, lighting, brand (see section 4) |
| `Distribución.png` (hand sketch) | Floor programs, which become the zonification (see section 5) |
| `Captura ... 104706.png` ("PREDIO") | Lot survey: 536 m2, sides about 25.26 / 20.33 / 20.93 / 27.13 m, trees, street-side gate |
| `Captura ... 104902.png` | Footprint dimensions: 17.32, 9.56, 4.07, 8.69, 5.59, 3.04, 3.24, 4.44 m |

The render shows a **three-storey corner building**:
- Dark graphite panel facade.
- A folded, faceted panel feature wall at the center.
- Planter terraces with climbing plants.
- A glass curtain wall on the right side.
- A golden perforated screen with a sound-wave pattern at ground level.
- Warm LED lines along every slab edge and a vertical LED line.
- A LOUD sign with sound-wave icons.
- A yellow-lit entrance lobby.

Things to flag:
- The sketch draws only the first (ground) floor plan. The lists below it give the uses of floors 1, 2 and 3, so floors 2 and 3 have no drawn layout and must be estimated.
- The survey shows the lot as an irregular quadrilateral with a street-side gate, but the render shows a corner building with a different massing. We need to confirm which footprint the building actually occupies (see section 10).

## 3. Hosting and access (decided: GitHub Pages)

Repo name: `pinachoandre14-droid/LOUD_PROJECT`. Published at `https://pinachoandre14-droid.github.io/LOUD_PROJECT/`.

```
Your PC --git push--> GitHub repo --GitHub Actions build--> GitHub Pages --> client opens the link
```

What GitHub Pages means for privacy:
- **No emails or invitations are needed.** There is no login. Anyone who has the link can open the viewer.
- On a free GitHub account, Pages needs a **public repo**. A private repo with Pages needs a paid plan, and even then the published site is still public unless you have Enterprise Cloud. So the repo is public.
- What is public: the code, the optimized GLB, `hotspots.json`, `zones.json`, and anything else in the repo or the built site. Anyone can download the GLB.
- What stays private: your keys (none are used), your `.3dm` Rhino files, and the client's source images and plans. These are never committed (see section 9).
- The link is "unlisted", not secret. It is not indexed by default, but anyone you share it with can pass it on.
- Optional later, if the client wants a barrier: a simple password screen in the page. This is a convenience, not real security, because the model file is still reachable. A real barrier would need a different host.

If privacy of the model itself ever becomes important, the code does not change; only the hosting does.

## 4. Look and materials (fidelity to the render)

Hero look: the **dusk "blue hour"** scene from the render.

| Element | Treatment in the viewer |
|---|---|
| Graphite facade panels | Dark gray, matte, slight metallic; subtle panel seams |
| Folded/faceted feature wall | Real geometry (the facets catch light and sell the look) |
| Glass curtain wall | Transparent dark-tinted glass with dark mullions; interior visible through it |
| Warm LED strips | Emissive warm amber (about 2700K) lines; soft glow via bloom (laptop only) |
| Golden perforated screen | Gold/bronze metal with an alpha-mask texture of the sound-wave perforation, backlit warm |
| LOUD sign + wave icons | Emissive white-blue letters; texture or simple geometry |
| Yellow lobby | Saturated yellow interior wall visible through the entrance glass |
| Planters + plants | Green planter volumes with alpha-card foliage (cheap), not real plant meshes |
| Context | Sidewalk, street, a few simple tree cards. Optional on/off toggle |

Lighting and weight strategy (the tension between "faithful" and "light"):
- **Baked lighting and ambient occlusion** into textures (Rhino 8 Cycles render or a Blender bake). No real-time shadows on phone.
- Environment: a small HDR for dusk reflections (about 256-512px, compressed).
- A day/night toggle is possible: night is the hero; day is a simple alternate environment.
- Materials are PBR (glTF metallic-roughness). Textures at most 1024px, KTX2/WebP, shared atlases where possible.
- Plants and context use alpha cards. Bloom is laptop-only; on phone, emissive without postprocessing.

## 5. Zonification (from the sketches)

The viewer will have a **Zones** mode: per-floor colored floor-plate overlays with labels, a legend, and click-to-highlight.

| Floor | Zones |
|---|---|
| Floor 1 (ground) | Reception, WC, Music store (tienda de música), Dressing rooms (camerinos), Stage (escenario), Café with food preparation hub (centro de comida y preparación), Entrance, Lounge seating (sillones), Tables (mesas) |
| Floor 2 | Photo session (sesión de fotos), Podcast, Bathroom |
| Floor 3 | Recording room (sala de grabación), Drum recording room (sala de grabación de batería), Break room, Bathrooms |

Note: the sketch also says "Inspo Jam & Roller", which looks like a reference for the ground floor atmosphere.

How it is built:
- In Rhino, each zone is a flat planar surface on a layer `Z_F01_Cafe`, `Z_F02_Podcast`, and so on, placed just above the floor.
- A `zones.json` defines the name, color, description and icon.
- Zone surfaces are thin and almost free in weight. They fade in with Zones mode and follow their floor in the exploded view.

## 6. Tech stack

| Part | Choice | Why |
|---|---|---|
| 3D engine | **Three.js** (vanilla JS) | Full control for exploded view, zones and hotspots |
| Dev/build | **Vite** | Fast local preview, small output |
| Model format | **GLB (glTF binary)** | Standard, compact |
| Optimization | `gltf-transform` (Meshopt/Draco, KTX2, dedupe, weld) | Phone-friendly load |
| UI | Plain HTML/CSS, branding from the render | Small bundle |
| Hosting | GitHub Pages via GitHub Actions | Free, one link, updates on push |
| i18n | Simple `es.json` / `en.json` dictionaries | Bilingual UI without a framework |

## 7. Rhino 8 to web pipeline

1. **Layer contract** (the viewer depends on these names):
   - Floors: `F00_Ground`, `F01_...`, `F02_...`, `ROOF`. Everything physical on that floor lives under its floor layer, in sublayers by material (`F01_Glass`, `F01_Panel`).
   - Zones: `Z_F01_<Name>` flat surfaces.
   - Hotspot anchors: points on a `HOTSPOTS` layer, named (`HS_Entrance`) so positions can be read from the file instead of typed.
   - Context (street, trees): layer `CONTEXT`, which the viewer can hide.
2. **Keep it light**: blocks/instances for repeated elements (chairs, tables, light fixtures), low-to-medium render mesh density. **Interior at small-to-medium detail**: walls, stage, counters, main furniture as simple volumes; no small props. Weight beats detail whenever they conflict.
3. **Materials in Rhino**: assign a basic PBR material per layer or per object (Rhino 8 exports PBR to glTF). Names follow the table in section 4.
4. **Export** to `.glb` from Rhino 8 (File > Export, glTF Binary). Export only the viewer model.
5. **Optimize** with `gltf-transform`, then commit to `public/models/`.

Performance budget (phone-first):

| Item | Target |
|---|---|
| GLB size | under 12 MB ideal, under 25 MB hard cap (materials add weight) |
| Triangles | under about 300k phone, under about 1M laptop |
| Draw calls | under about 100 (group by material, instancing) |
| Textures | max 1024px typical, 2048px for hero materials only; KTX2 |
| Rendering | on demand, pixel ratio capped at 2 |

The Rhino MCP connection available here may let us inspect layers, mesh stats and materials directly in Rhino in a later session.

## 8. Viewer features

1. **Navigation**: orbit with damping, touch gestures, reset/top/front/street-view presets.
2. **Exploded view**: slider that lifts floors along Y; floor list to isolate, hide or highlight a floor. Facade planters and roof follow their floor.
3. **Zones mode**: colored per-floor overlays, labels, legend, click for description.
4. **Hotspots**: anchor positions, title, text, optional image. Camera flies to a preset view on click. Hotspots hide when their floor is hidden.
5. **Look toggles**: Night (hero) / Day, Context on/off, Glass transparency.
6. **Branding**: LOUD logo, sound-wave motif, graphite background with warm amber accents taken from the render. Loading screen with progress bar.
7. **Responsive UI**: bottom sheet on phone, side panel on laptop.
8. Optional later: guided tour, screenshot button.

## 9. Security (public repo, so nothing sensitive goes in it)

This design needs **no API keys at all**, and the site is public. The protection strategy is therefore: **never commit anything you would not want a stranger to read.**

1. `.gitignore` goes in the **first commit**:
   ```
   .env
   .env.*
   !.env.example
   *.pem
   *.key
   *.3dm
   *.3dmbak
   *.rhl
   reference/
   *.jpeg
   *.jpg
   *.png
   !public/**/*.png
   !public/**/*.jpg
   node_modules/
   dist/
   .claude/settings.local.json
   ```
2. **The client's render, sketches and survey (`reference/`) are NOT committed.** They stay on your PC only, listed in `.gitignore`, because the repo is public. If you want them backed up, keep them in cloud storage or a separate private repo.
3. Enable GitHub secret scanning and push protection (free on public repos), and add a `gitleaks` pre-commit hook.
4. Turn on 2FA on GitHub and Cloudflare.
5. Use your GitHub `noreply` commit email.
6. Any key or token created later lives in GitHub Actions secrets, never in files. If one ever leaks, rotate it immediately. On a public repo, deleting the commit is not enough.
7. Review `git status` and `git diff --staged` before the first push, and check that exact list of files that will be public.
8. Exact allowlist of what gets committed: `src/`, `public/models/*.glb`, `public/*.json`, `index.html`, config files, `PLAN.md`/`README.md`. Everything else is ignored by default.
9. The deployed GLB is downloadable by anyone with the link. That is inherent to any web viewer on a public host.

## 10. Roadmap

| Phase | Work | Output |
|---|---|---|
| 0 | Create repo `LOUD_PROJECT`, `.gitignore` first, security settings, Vite scaffold, GitHub Pages workflow, placeholder cube | Live link working end to end |
| 1 | Massing in Rhino from the survey and sketches, with floor/zone/hotspot layers; first GLB; basic viewer | Navigable gray model |
| 2 | Exploded view and floor list | Core feature |
| 3 | Zones mode, `zones.json`, legend | Core feature |
| 4 | Materials, baked lighting, emissive LEDs, gold screen, glass, foliage cards; match the render | Faithful look |
| 5 | Hotspots, camera fly-to, branding, loading screen | Client UX |
| 6 | Phone optimization pass against the budget | Phone-ready |
| 7 | Client review, adjust, invite emails | Delivery |

## 11. Open items

Decided: repo `LOUD_PROJECT`, GitHub Pages, interior at small-to-medium detail, bilingual UI, estimate first and refine through corrections.

Working estimates (to be corrected by you):
1. Footprint: the building occupies the surveyed lot (about 536 m2), using the survey dimensions. Corner service block 3.04 x 3.24 m.
2. Floor-to-floor height: about 3.5 m, three floors plus roof, estimated from the render.
3. Facade: proportions taken from the render photo.
4. Floor layouts: from the hand sketch, scaled to fit the footprint.
5. Hotspots (first guess): entrance and lobby, stage, café, music store, podcast room, recording room, drum room, facade feature wall, planter terraces.

Still needed later, only when available: CAD/DWG files, elevations, real heights, and any corrections after the first model review.
