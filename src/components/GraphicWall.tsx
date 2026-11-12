import { useEffect, useMemo, useRef, useState } from "react";
import { graphics, type Graphic } from "@/lib/gallery";

const rand = (t: number) => {
  const x = 43758.5453 * Math.sin(12.9898 * t + 78.233);
  return x - Math.floor(x);
};
const smoothstep = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Rendered rect per tile: x, y, w, h, scale. */
const POS = 5;
/** How much larger a picked tile grows, before the fit cap pulls it back in. */
const FOCUS_GROW = 1.8;
/** Copies of the same graphic never appear within this many tiles of a row. */
const ROW_SPACING = 4;
/**
 * Two copies of one graphic are never packed closer than this multiple of the
 * tile height, measured in rendered space. Tiles only drift, so unlike a
 * rolling wall this bound keeps holding after the first frame.
 */
const MIN_GAP = 1.25;
/** How far a tile floats from its packed slot. */
const swayFor = (cw: number) => (cw < 640 ? 10 : 16);
/** A tile's caption shows when the cursor is this close to its centre. */
const CAPTION_RANGE = 110;
/** Fraction of the cursor's offset from centre that the wall drifts by. */
const PARALLAX = 0.05;
/** A piece never shows more than this many times, unless it sets its own cap. */
const MAX_COPIES = 2;
/** Beyond the cap a piece may still fill space as a cropped or tucked copy. */
const FILLER_COPIES = 2;
/** Row pitch as a fraction of tile height, so overlapping rows stay in band. */
const ROW_PITCH = 0.95;
/** Base tile height: past this the pieces read too big, under it gaps open. */
const tileTargetFor = (cw: number) => (cw < 640 ? 93 : 155);
/**
 * A tile's own footprint, once the overlaps are paid for, is about this much of
 * the band squared, so a band no bigger than this cannot hold every graphic at
 * once and has to shrink the pieces to make room.
 */
const targetFor = (cw: number, ch: number) =>
  Math.min(tileTargetFor(cw), Math.sqrt((cw * ch) / (graphics.length * 1.6)));
/** A copy counts as one of the shown ones only if the frame leaves this much. */
const EDGE_SHARE = 0.55;
/** Tucked copies advance this fraction of their width, so each shows a strip. */
const FAN = 0.3;
/** Past this many rows the pieces stop reading as posters. */
const MAX_ROWS = 6;

const sizeFor = (item: Graphic, tileH: number) => {
  const aspect = item.width / item.height;
  // a portrait poster reads taller than a banner, but only a little: past this
  // the tall pieces in a row bury the row above them
  const h = Math.round(tileH * (aspect < 0.8 ? 1.12 : aspect < 1.15 ? 1.06 : 1));
  return { w: Math.round(h * aspect), h };
};

type Tile = {
  graphic: number;
  x: number;
  y: number;
  w: number;
  h: number;
  row: number;
  tilt: number;
  scale: number;
  tuck: boolean;
  /** Pile depth: 0 is the layer of tucked copies, 1-3 the visible pile. */
  layer: number;
};

/**
 * The layout is a collage, not a grid: each tile is sized from its own aspect,
 * rows sit close enough to overlap, and every tile is jittered, tilted and
 * scaled. Tiles advance less than their own width, so pieces pile onto each
 * other.
 *
 * Nothing wraps. A row is packed until it runs a little past the right edge, so
 * the lean from the cursor can never pull a gap open at the side.
 *
 * Packing is a greedy pass with four rules:
 *
 * - a graphic shows at most MAX_COPIES times, or its own wallCopies, counting
 *   only the copies the frame leaves at least EDGE_SHARE of;
 * - past that cap a piece may still fill space, but only as a copy the frame
 *   crops at the side, or one tucked behind the pile so it gives up all but a
 *   strip of itself;
 * - never place a graphic within MIN_GAP of another copy, measured in two
 *   dimensions against the two rows above and by tile index along the row;
 * - the first choice for any cell is a graphic not yet shown, so the wall
 *   displays the whole set rather than whichever pieces happen to repeat.
 */
function buildTiles(cw: number, ch: number): Tile[] {
  const gap = cw < 640 ? 4 : 8;
  const caps = graphics.map((g) => Math.min(MAX_COPIES, g.wallCopies ?? MAX_COPIES));
  // a piece that names its own cap never leaks into the cropped or tucked copies
  const extras = graphics.map((g) => (g.wallCopies === undefined ? FILLER_COPIES : 0));
  // rows at this pitch put every tile centre inside the band, and the pieces
  // size themselves off the band so they stay medium rather than poster-large
  const rowCount = Math.max(
    2,
    Math.min(MAX_ROWS, Math.round(ch / (ROW_PITCH * targetFor(cw, ch)))),
  );
  const tileH = Math.round(ch / (ROW_PITCH * rowCount));
  const rowStep = Math.round(tileH * ROW_PITCH);
  // rows run past the right edge so the lean from the cursor opens no gap
  const rowLimit = cw + tileH * 0.35;
  const minGap = Math.round(tileH * MIN_GAP);
  const softNear = Math.round(minGap * 1.6);

  const shownCount = new Array<number>(graphics.length).fill(0);
  const extraCount = new Array<number>(graphics.length).fill(0);
  const shown = new Set<number>();
  const tiles: Tile[] = [];
  const rows: { cells: { g: number; cx: number; cy: number }[] }[] = [];
  // the first row centre sits half a pitch below the top edge
  let y = rowStep / 2 - tileH / 2;

  const shareOf = (cx: number, cy: number, w: number, h: number) => {
    const sw = Math.min(cw, cx + w / 2) - Math.max(0, cx - w / 2);
    const sh = Math.min(ch, cy + h / 2) - Math.max(0, cy - h / 2);
    return sw > 0 && sh > 0 ? (sw * sh) / (w * h) : 0;
  };

  for (let r = 0; r < rowCount; r++) {
    const cells: { g: number; cx: number; cy: number }[] = [];
    const above = [rows[r - 1], rows[r - 2]];
    let x = 0;
    // set once the row has run out of pieces that may still show in full
    let tuck = false;

    for (;;) {
      const pick = cells.length;
      const forbidden = new Set<number>();
      for (let k = Math.max(0, pick - ROW_SPACING); k < pick; k++) {
        const c = cells[k];
        if (c) forbidden.add(c.g);
      }

      // a cell's centre line is the same whichever graphic lands on it, so the
      // distance checks can be made per candidate before choosing
      const cy = y + tileH / 2 + (rand(r * 29.7 + pick * 11.3) - 0.5) * tileH * 0.2;

      let g = -1;
      let best = Infinity;
      let fallback = -1;
      let fallbackGap = -1;

      for (let k = 0; k < graphics.length; k++) {
        if (forbidden.has(k)) continue;
        const item = graphics[k];
        if (!item) continue;
        const { w, h } = sizeFor(item, tileH);
        const cx = x + w / 2;
        // cropped by the frame, or standing in for one that is capped out
        const spare = tuck || shareOf(cx, cy, w, h) < EDGE_SHARE;
        const used = spare ? (extraCount[k] ?? 0) : (shownCount[k] ?? 0);
        if (used >= (spare ? (extras[k] ?? 0) : (caps[k] ?? 0))) continue;
        let near = 0;
        let dist = Infinity;
        for (const row of above) {
          if (!row) continue;
          for (const c of row.cells) {
            if (c.g !== k) continue;
            dist = Math.min(dist, Math.hypot(cx - c.cx, cy - c.cy));
          }
        }
        // a piece nobody has seen yet gets the run of the wall
        const floor = spare ? minGap * 0.7 : shown.has(k) ? minGap : 0;
        if (dist < floor) {
          if (dist > fallbackGap) {
            fallbackGap = dist;
            fallback = k;
          }
          continue;
        }
        if (dist < softNear) near++;
        const score =
          near * 100 +
          used * 10 +
          (spare ? 400 : 0) -
          (shown.has(k) ? 0 : 1e4) +
          rand(r * 61.3 + pick * 7.9 + k * 3.7);
        if (score < best) {
          best = score;
          g = k;
        }
      }
      if (g < 0 && !tuck) {
        // nothing may show in full here any more: finish the row from behind
        tuck = true;
        continue;
      }
      if (g < 0) g = fallback;
      if (g < 0) break;

      const item = graphics[g];
      if (!item) break;
      const { w, h } = sizeFor(item, tileH);
      const cx = x + w / 2;
      const spare = tuck || shareOf(cx, cy, w, h) < EDGE_SHARE;
      if (spare) extraCount[g] = (extraCount[g] ?? 0) + 1;
      else {
        shownCount[g] = (shownCount[g] ?? 0) + 1;
        shown.add(g);
      }
      cells.push({ g, cx, cy });
      tiles.push({
        graphic: g,
        x,
        y: cy - h / 2,
        w,
        h,
        row: r,
        tilt: (rand(r * 13.1 + pick * 7.7) - 0.5) * 15,
        scale: 1 + rand(r * 5.9 + pick * 2.3) * 0.1,
        tuck,
        // three depths, cycling so no two neighbours match: a piece then gets
        // covered on one side or the other, rarely on both, which is what keeps
        // the whole set readable and not just whichever pile lands on top
        layer: tuck ? 0 : 1 + ((tiles.length * 7) % 3),
      });
      // below 1 the next tile starts before this one ends: deliberate overlap.
      // a tucked row overlaps harder so each copy keeps just a strip of itself
      x += w * (tuck ? FAN : 0.92 + rand(r * 3.1 + pick * 17.7) * 0.14) + gap;

      // every tucked copy but the last is covered by the next one in the fan, so
      // the row is done once the frame crops the tail piece down to a corner
      if (!tuck && x >= rowLimit) break;
      if (tuck && x >= rowLimit && shareOf(cx, cy, w, h) < EDGE_SHARE) break;
    }

    rows.push({ cells });
    y += rowStep;
  }

  return tiles;
}

export function GraphicWall() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [caption, setCaption] = useState(-1);
  const [picked, setPicked] = useState(-1);

  const state = useRef({
    cw: 0,
    ch: 0,
    px: 0,
    py: 0,
    pointer: false,
    panX: 0,
    panY: 0,
    phase: [] as number[],
    focus: -1,
    appliedHot: -1,
    entrance: 0,
    faded: false,
    selGrow: 0,
    selIdx: -1,
    appliedPicked: -1,
    running: false,
    reduce: false,
    fine: true,
  });
  const els = useRef<HTMLElement[]>([]);
  const pos = useRef(new Float32Array(0));
  const offscreen = useRef(new Uint8Array(0));
  const pickedRef = useRef(-1);

  const announced = useMemo(() => {
    const seen = new Set<number>();
    const first = new Set<number>();
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      if (t?.tuck) continue;
      const g = t?.graphic;
      if (g === undefined || seen.has(g)) continue;
      seen.add(g);
      first.add(i);
    }
    return first;
  }, [tiles]);

  useEffect(() => {
    pickedRef.current = picked;
    const layer = boxRef.current?.querySelector<HTMLElement>(".graphic-wall-layer");
    layer?.classList.toggle("is-picking", picked >= 0);
  }, [picked]);

  // Measured, then repacked only on a real width change or a large height change.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => {
      const rect = box.getBoundingClientRect();
      const cw = Math.round(rect.width);
      const ch = Math.round(rect.height);
      const s = state.current;
      if (cw < 1 || ch < 1) return;
      if (Math.abs(cw - s.cw) < 2 && Math.abs(ch - s.ch) < 24) return;
      s.cw = cw;
      s.ch = ch;
      setTiles(buildTiles(cw, ch));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || tiles.length === 0) return;
    const layer = box.querySelector<HTMLElement>(".graphic-wall-layer");
    if (!layer) return;

    const s = state.current;
    s.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    s.fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    s.entrance = s.reduce ? 1 : 0;
    s.faded = s.reduce;
    s.focus = -1;
    s.appliedHot = -1;
    s.pointer = false;
    s.selGrow = 0;
    s.selIdx = -1;
    s.appliedPicked = -1;
    pickedRef.current = -1;
    layer.classList.remove("is-picking");
    setPicked(-1);

    // one phase per tile, so pieces float apart from their neighbours instead of
    // sliding along the row as a strip
    s.phase = Array.from({ length: tiles.length }, (_, i) => rand(i * 17.3) * Math.PI * 2);
    pos.current = new Float32Array(tiles.length * POS);
    offscreen.current = new Uint8Array(tiles.length);
    els.current = Array.from(layer.querySelectorAll<HTMLElement>("[data-tile]"));

    const frame = (dt: number) => {
      const { cw, ch } = s;
      const flags = offscreen.current;
      const ease = s.reduce ? 1 : smoothstep(clamp01(s.entrance));
      if (!s.reduce) s.entrance = Math.min(1, s.entrance + dt / 78);

      const sel = pickedRef.current;
      if (sel !== s.appliedPicked) {
        const was = els.current[s.appliedPicked];
        if (was) {
          was.classList.remove("is-picked");
          was.style.zIndex = String(tiles[s.appliedPicked]?.layer ?? 1);
        }
        const now = els.current[sel];
        if (now) {
          // inline, because a focused piece has to clear every pile depth
          now.classList.add("is-picked");
          now.style.zIndex = "4";
        }
        s.appliedPicked = sel;
      }
      const picking = sel >= 0 || s.selGrow > 0.01;
      s.selGrow += ((sel >= 0 ? 1 : 0) - s.selGrow) * Math.min(1, 0.14 * dt);
      if (sel < 0 && s.selGrow < 0.01) s.selGrow = 0;
      // the released tile keeps gliding back to its slot while the grow decays
      if (sel >= 0) s.selIdx = sel;
      else if (s.selGrow === 0) s.selIdx = -1;
      const active = s.selIdx;

      const lag = Math.min(1, 0.07 * dt);
      const idle = picking || !s.pointer;
      s.panX += ((idle ? 0 : (s.px - cw / 2) * PARALLAX) - s.panX) * lag;
      s.panY += ((idle ? 0 : (s.py - ch / 2) * PARALLAX) - s.panY) * lag;

      if (!s.reduce && !picking) {
        for (let i = 0; i < s.phase.length; i++) {
          const speed = 0.0012 + 0.0022 * rand(i * 41.3 + 17.1);
          s.phase[i] = (s.phase[i] ?? 0) + speed * (i % 2 === 0 ? 1 : -1) * dt;
        }
      }

      const sway = swayFor(cw);
      const arr = pos.current;
      let nearest = -1;
      let nearestD = Infinity;

      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const el = els.current[i];
        if (!t || !el) continue;

        const isSel = i === active;
        // the focused piece stops drifting and squares up as it reaches centre
        const settle = isSel ? 1 - s.selGrow : 1;
        let x = t.x + Math.sin(s.phase[i] ?? 0) * sway * settle + s.panX;
        let y = t.y + s.panY * (0.7 + 0.3 * rand(t.row * 3.3));

        let scale = t.scale * (0.72 + 0.28 * ease);
        if (isSel) {
          // grow toward the centre, but never past the frame
          const fit = Math.min(
            FOCUS_GROW,
            (cw * 0.86) / (t.w * t.scale),
            (ch * 0.86) / (t.h * t.scale),
          );
          scale = t.scale * (0.72 + 0.28 * ease) * (1 + (Math.max(1, fit) - 1) * s.selGrow);
          x += (cw / 2 - (x + t.w / 2)) * s.selGrow;
          y += (ch / 2 - (y + t.h / 2)) * s.selGrow;
        } else if (ease < 1) {
          const spread = 1 + (1 - ease) * 0.7;
          x = cw / 2 + (x - cw / 2) * spread;
          y = ch / 2 + (y - ch / 2) * spread;
        }

        const o = i * POS;
        arr[o] = x;
        arr[o + 1] = y;
        arr[o + 2] = t.w;
        arr[o + 3] = t.h;
        arr[o + 4] = scale;

        const gone = x + t.w < -80 || x > cw + 80 || y + t.h < -80 || y > ch + 80;
        if (gone && !isSel) {
          if (!flags[i]) {
            flags[i] = 1;
            el.style.transform = "translate3d(-9999px,-9999px,0)";
          }
          continue;
        }
        flags[i] = 0;

        el.style.transform =
          `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(t.tilt * settle).toFixed(2)}deg)` +
          ` scale(${scale.toFixed(3)})`;

        if (ease < 1) {
          el.style.opacity = ease.toFixed(2);
        } else if (!s.faded) {
          // inline opacity outranks the CSS rules that dim the unpicked tiles
          s.faded = true;
          for (const node of els.current) node.style.opacity = "";
        }

        if (s.pointer && !picking) {
          const d = Math.hypot(x + t.w / 2 - s.px, y + t.h / 2 - s.py);
          if (d < nearestD && d < CAPTION_RANGE) {
            nearestD = d;
            nearest = i;
          }
        }
      }

      if (nearest !== s.focus) {
        s.focus = nearest;
        setCaption(nearest < 0 ? -1 : (tiles[nearest]?.graphic ?? -1));
      }
      // the piece under the cursor is the one that regains its colour
      const hot = picking ? -1 : nearest;
      if (hot !== s.appliedHot) {
        els.current[s.appliedHot]?.classList.remove("is-hot");
        els.current[hot]?.classList.add("is-hot");
        s.appliedHot = hot;
      }
    };

    if (s.reduce) {
      frame(0);
      return;
    }

    let raf = 0;
    let last = performance.now();
    let visible = false;

    const tick = (now: number) => {
      const dt = Math.min(3, (now - last) / 16.667);
      last = now;
      frame(dt);
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!s.running) return;
      s.running = false;
      cancelAnimationFrame(raf);
    };
    const start = () => {
      if (s.running || !visible) return;
      s.running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) start();
        else stop();
      },
      { rootMargin: "160px 0px" },
    );
    io.observe(box);
    start();

    const at = (e: PointerEvent) => {
      const rect = box.getBoundingClientRect();
      s.px = e.clientX - rect.left;
      s.py = e.clientY - rect.top;
    };
    const onDown = (e: PointerEvent) => {
      if (!s.fine) return;
      at(e);
      s.pointer = true;
    };
    const onMove = (e: PointerEvent) => {
      if (!s.fine) return;
      at(e);
      s.pointer = true;
    };
    const onLeave = () => {
      s.pointer = false;
    };

    box.addEventListener("pointerdown", onDown);
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      io.disconnect();
      box.removeEventListener("pointerdown", onDown);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
    };
  }, [tiles]);

  /** Tile under a point, using the rect the last frame actually drew. */
  const tileAt = (clientX: number, clientY: number) => {
    const box = boxRef.current;
    if (!box) return -1;
    const rect = box.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const arr = pos.current;
    let best = -1;
    let bestRank = -1;
    let hitPicked = false;
    for (let i = 0; i < tiles.length; i++) {
      if (offscreen.current[i]) continue;
      const o = i * POS;
      const bw = arr[o + 2] ?? 0;
      const bh = arr[o + 3] ?? 0;
      const sc = arr[o + 4] ?? 1;
      // scale and rotate run about the tile centre, so the centre itself
      // stays at x + w/2 however large the tile is drawn
      const hw = (bw * sc) / 2;
      const hh = (bh * sc) / 2;
      if (hw < 1 || hh < 1) continue;
      const cx = (arr[o] ?? 0) + bw / 2;
      const cy = (arr[o + 1] ?? 0) + bh / 2;
      if (Math.abs(x - cx) > hw || Math.abs(y - cy) > hh) continue;
      if (i === pickedRef.current) hitPicked = true;
      // overlapping tiles: the one on the higher pile depth takes the click
      const rank = (tiles[i]?.layer ?? 0) * 1e5 + i;
      if (rank > bestRank) {
        bestRank = rank;
        best = i;
      }
    }
    // the focused piece is drawn above the rest, so it wins its own overlap
    if (hitPicked) return pickedRef.current;
    return best;
  };

  /** Nearest tile centre to a point; used where a rect hit would be ambiguous. */
  const nearestTo = (clientX: number, clientY: number) => {
    const box = boxRef.current;
    if (!box) return -1;
    const rect = box.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const arr = pos.current;
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < tiles.length; i++) {
      if (offscreen.current[i]) continue;
      const o = i * POS;
      const w = arr[o + 2] ?? 0;
      const h = arr[o + 3] ?? 0;
      if (w === 0) continue;
      const d = Math.hypot((arr[o] ?? 0) + w / 2 - x, (arr[o + 1] ?? 0) + h / 2 - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  };

  const selectAt = (hit: number) => {
    // a second click always drops back to the whole wall, even when it lands on
    // another piece: the focus never jumps straight to it
    setPicked((prev) => (prev >= 0 || hit < 0 ? -1 : hit));
  };

  useEffect(() => {
    if (picked < 0) return;
    const onDocDown = (e: Event) => {
      const target = e.target;
      if (target instanceof Node && boxRef.current?.contains(target)) return;
      setPicked(-1);
    };
    document.addEventListener("pointerdown", onDocDown, true);
    return () => document.removeEventListener("pointerdown", onDocDown, true);
  }, [picked]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicked(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pickedGraphic = picked < 0 ? undefined : tiles[picked]?.graphic;
  const captionGraphic = pickedGraphic ?? (caption < 0 ? undefined : caption);
  const captionItem = captionGraphic === undefined ? undefined : graphics[captionGraphic];

  return (
    <div
      ref={boxRef}
      className="graphic-wall"
      role="button"
      tabIndex={0}
      aria-label="Graphic wall. Select a piece to bring it forward."
      aria-pressed={picked >= 0}
      onClick={(e) => selectAt(tileAt(e.clientX, e.clientY))}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setPicked(-1);
          return;
        }
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        if (picked >= 0) {
          setPicked(-1);
          return;
        }
        const r = boxRef.current?.getBoundingClientRect();
        if (r) selectAt(nearestTo(r.left + r.width / 2, r.top + r.height / 2));
      }}
    >
      <div className="graphic-wall-layer">
        {tiles.map((t, i) => {
          const g = graphics[t.graphic];
          if (!g) return null;
          return (
            <div
              key={i}
              data-tile=""
              data-tuck={t.tuck ? "" : undefined}
              className="graphic-tile"
              style={{
                width: `${t.w}px`,
                height: `${t.h}px`,
                zIndex: t.layer,
                transform: `translate3d(${t.x}px,${t.y}px,0) rotate(${t.tilt}deg) scale(${t.scale})`,
              }}
            >
              <img
                src={g.src}
                width={g.width}
                height={g.height}
                alt={announced.has(i) ? g.alt : ""}
                decoding="async"
                draggable={false}
              />
            </div>
          );
        })}
      </div>
      <p className="graphic-wall-caption" data-visible={captionItem ? "true" : "false"}>
        {captionItem ? captionItem.meta : ""}
      </p>
    </div>
  );
}
