import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GraphicWall } from "@/components/GraphicWall";
import { graphics } from "@/lib/gallery";

const WALL_W = 1200;
const WALL_H = 620;

let rafQueue: ((t: number) => void)[] = [];
let clock = 0;

function pump(frames: number) {
  act(() => {
    for (let i = 0; i < frames; i++) {
      clock += 16.667;
      const due = rafQueue;
      rafQueue = [];
      for (const cb of due) cb(clock);
    }
  });
}

function transforms(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-tile]")).map((el) => {
    const m = /translate3d\((-?[\d.]+)px,(-?[\d.]+)px/.exec(el.style.transform);
    return { x: Number(m?.[1]), y: Number(m?.[2]), el };
  });
}

/** The rect each tile was last drawn at, which is what a click is hit against. */
function rects(container: HTMLElement) {
  return (
    Array.from(container.querySelectorAll<HTMLElement>("[data-tile]"))
      .map((el) => {
        const m =
          /translate3d\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px[^)]*\)\s*rotate\([^)]*\)\s*scale\(([\d.]+)\)/.exec(
            el.style.transform,
          );
        const x = Number(m?.[1]);
        const y = Number(m?.[2]);
        const scale = Number(m?.[3] ?? 1);
        const w = parseFloat(el.style.width || "0");
        const h = parseFloat(el.style.height || "0");
        return {
          el,
          src: el.querySelector("img")?.getAttribute("src") ?? "",
          x,
          y,
          scale,
          // scale runs about the centre, so the centre is the unscaled midpoint
          cx: x + w / 2,
          cy: y + h / 2,
          hw: (w * scale) / 2,
          hh: (h * scale) / 2,
        };
      })
      // culled tiles sit on the -9999 sentinel, which is not a real position
      .filter((t) => t.x > -5000 && t.y > -5000)
  );
}

function clickAt(box: HTMLElement, clientX: number, clientY: number) {
  box.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX, clientY }));
}

const covers = (t: { cx: number; cy: number; hw: number; hh: number }, x: number, y: number) =>
  Math.abs(x - t.cx) <= t.hw && Math.abs(y - t.cy) <= t.hh;

/** A point that is definitely on a piece: the centre of the nearest tile. */
function nearestTile(tiles: ReturnType<typeof rects>, x: number, y: number) {
  return tiles.reduce((b, t) =>
    Math.hypot(t.cx - x, t.cy - y) < Math.hypot(b.cx - x, b.cy - y) ? t : b,
  );
}

/** The collage leaves holes; this finds one so a gap click can be tested. */
function gapPoint(tiles: ReturnType<typeof rects>) {
  for (let y = 15; y < WALL_H; y += 15) {
    for (let x = 15; x < WALL_W; x += 15) {
      if (!tiles.some((t) => covers(t, x, y))) return { x, y };
    }
  }
  return null;
}

function mountWall() {
  const view = render(<GraphicWall />);
  return { ...view, container: view.container as HTMLElement };
}

describe("Graphic wall", () => {
  beforeEach(() => {
    rafQueue = [];
    clock = 0;

    vi.spyOn(performance, "now").mockImplementation(() => clock);
    vi.stubGlobal("requestAnimationFrame", (cb: (t: number) => void) => rafQueue.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        cb: (entries: unknown[]) => void;
        constructor(cb: (entries: unknown[]) => void) {
          this.cb = cb;
        }
        observe() {
          this.cb([{ isIntersecting: true }]);
        }
        disconnect() {}
      },
    );
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("pointer: fine"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }));
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: WALL_W,
      bottom: WALL_H,
      width: WALL_W,
      height: WALL_H,
      toJSON: () => ({}),
    }));
  });

  it("shows every graphic at most twice, and the capped pieces once", () => {
    const { container, unmount } = mountWall();
    pump(120);
    const shown = new Map<string, number>();
    const spare = new Map<string, number>();
    for (const t of rects(container)) {
      const key = t.src.split("/").pop() ?? t.src;
      // a copy the frame crops to an edge, or one tucked behind the pile to fill
      // a hole, is not a showing of that piece
      const iw = Math.min(t.cx + t.hw, WALL_W) - Math.max(t.cx - t.hw, 0);
      const ih = Math.min(t.cy + t.hh, WALL_H) - Math.max(t.cy - t.hh, 0);
      const share = iw > 0 && ih > 0 ? (iw * ih) / (4 * t.hw * t.hh) : 0;
      const slot = t.el.hasAttribute("data-tuck") || share < 0.55 ? spare : shown;
      slot.set(key, (slot.get(key) ?? 0) + 1);
      // behind the pile is the only reason a spare copy may exist at all
      if (slot === spare && share >= 0.55) expect(t.el.style.zIndex).toBe("0");
    }

    // the whole set gets a place on the wall, not just the pieces that repeat
    expect(shown.size).toBe(graphics.length);
    const singles = graphics
      .filter((g) => (g.wallCopies ?? 2) < 2)
      .map((g) => String(g.src).split("/").pop());
    expect(singles.length).toBeGreaterThan(0);

    for (const [src, n] of shown) {
      expect(n, src).toBeLessThanOrEqual(2);
      if (singles.includes(src)) {
        expect(n, src).toBe(1);
        // and it is never echoed as a corner either
        expect(spare.get(src) ?? 0, src).toBe(0);
      }
    }
    unmount();
  });

  it("reveals the wall by animating transforms and clearing the inline fade", () => {
    const { container, unmount } = mountWall();
    const before = transforms(container)[0]?.x;
    pump(120);
    const after = transforms(container)[0];

    expect(after?.x).not.toBe(before);
    // inline opacity would outrank the CSS that dims unpicked tiles
    expect(after?.el.style.opacity).toBe("");
    unmount();
  });

  it("stacks overlapping rows that run the width of the band", () => {
    const { container, unmount } = mountWall();
    pump(120);
    // tile heights vary, so rows are recovered from the centre line each tile
    // hangs on; jitter moves a centre by ~19px, rows are ~155px apart
    const anchors: number[] = [];
    const rows = new Map<number, ReturnType<typeof rects>>();
    rects(container).forEach((t) => {
      let key = anchors.find((a) => Math.abs(a - t.cy) < 70);
      if (key === undefined) {
        anchors.push(t.cy);
        key = t.cy;
      }
      rows.set(key, [...(rows.get(key) ?? []), t]);
    });

    expect(rows.size).toBeGreaterThan(2);
    for (const list of rows.values()) {
      const byX = list.sort((a, b) => a.cx - b.cx);
      // a tile shrunk by its own scale, plus sway, insets its drawn edge a little
      expect(byX[0]!.cx - byX[0]!.hw).toBeLessThan(45);
      const tail = byX[byX.length - 1]!;
      expect(tail.cx + tail.hw).toBeGreaterThanOrEqual(WALL_W);

      // the packer will not put two copies of one graphic side by side
      for (let i = 0; i < byX.length; i++) {
        for (let j = i + 1; j < byX.length; j++) {
          if (byX[i]?.src === byX[j]?.src) {
            expect(j - i, byX[i]?.src).toBeGreaterThanOrEqual(4);
          }
        }
      }
    }
    unmount();
  });

  it("packs the band so the wall is mostly print, not background", () => {
    const { container, unmount } = mountWall();
    pump(120);
    const tiles = rects(container);
    let on = 0;
    let total = 0;
    for (let y = 8; y < WALL_H; y += 16) {
      for (let x = 8; x < WALL_W; x += 16) {
        total++;
        if (tiles.some((t) => covers(t, x, y))) on++;
      }
    }
    // pieces sit close enough that the gaps read as a collage, not as emptiness
    expect(on / total).toBeGreaterThan(0.9);
    unmount();
  });

  it("keeps copies of one graphic apart as the wall sways", () => {
    const { container, unmount } = mountWall();
    pump(120);

    const closestPair = (list: ReturnType<typeof rects>) => {
      let min = Infinity;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i]!,
            b = list[j]!;
          if (a.src !== b.src) continue;
          min = Math.min(min, Math.hypot(a.cx - b.cx, a.cy - b.cy));
        }
      }
      return min;
    };

    const early = closestPair(rects(container));
    // rows only sway by a few pixels, so the packed minimum keeps holding
    // instead of two copies sliding onto each other later on
    pump(1200);
    const late = closestPair(rects(container));

    expect(rects(container).length).toBeGreaterThanOrEqual(graphics.length);
    expect(early).toBeGreaterThanOrEqual(150);
    expect(late).toBeGreaterThanOrEqual(150);
    unmount();
  });

  it("shows every graphic inside the band at once", () => {
    const { container, unmount } = mountWall();
    pump(200);

    // a piece counts as shown when most of it is inside the frame
    const seen = new Set<string>();
    for (const t of rects(container)) {
      const iw = Math.min(t.cx + t.hw, WALL_W) - Math.max(t.cx - t.hw, 0);
      const ih = Math.min(t.cy + t.hh, WALL_H) - Math.max(t.cy - t.hh, 0);
      if (iw <= 0 || ih <= 0) continue;
      if ((iw * ih) / (4 * t.hw * t.hh) >= 0.6) seen.add(t.src);
    }
    expect(seen.size).toBe(graphics.length);
    unmount();
  });

  it("sways in place instead of rolling past", () => {
    const { container, unmount } = mountWall();
    pump(300);
    const before = new Map(rects(container).map((t) => [t.el, t.cx]));
    pump(1500);

    let maxMove = 0;
    let movers = 0;
    for (const t of rects(container)) {
      const prev = before.get(t.el);
      if (prev === undefined) continue;
      const d = Math.abs(t.cx - prev);
      maxMove = Math.max(maxMove, d);
      if (d > 3) movers++;
    }

    // bounded sway around a fixed slot, not a conveyor belt: peak to trough of a
    // 16px float is 32px, and a piece never travels further than its own slot
    expect(maxMove).toBeLessThanOrEqual(34);
    expect(movers).toBeGreaterThan(0);
    unmount();
  });

  it("leaves tiles where they are when the pointer passes over them", () => {
    const { container, unmount } = mountWall();
    const box = container.querySelector<HTMLElement>(".graphic-wall");
    if (!box) throw new Error("wall box missing");

    // settle without a pointer so the sway and the entrance reach a baseline
    pump(200);
    const idle = rects(container);
    const under = nearestTile(idle, WALL_W / 2, WALL_H / 2);

    act(() => {
      box.dispatchEvent(
        new MouseEvent("pointerdown", { bubbles: true, clientX: under.cx, clientY: under.cy }),
      );
      box.dispatchEvent(
        new MouseEvent("pointermove", { bubbles: true, clientX: under.cx, clientY: under.cy }),
      );
    });
    pump(200);
    const hovered = new Map(rects(container).map((t) => [t.el, t]));

    // the pointer sits on one piece for 200 frames: nothing flees it and nothing
    // swells — only the bounded sway and the slight parallax move anything
    let maxMove = 0;
    let maxGrow = 0;
    for (const t of idle) {
      const next = hovered.get(t.el);
      if (!next) continue;
      maxMove = Math.max(maxMove, Math.hypot(next.cx - t.cx, next.cy - t.cy));
      maxGrow = Math.max(maxGrow, next.scale - t.scale);
    }

    // measured 21px of travel and 0 growth here; the old repulsion field shoved
    // the tile under the cursor about 190px and swelled it
    expect(maxMove).toBeLessThan(40);
    expect(maxGrow).toBeLessThan(0.02);

    const caption = container.querySelector<HTMLElement>(".graphic-wall-caption");
    expect(caption?.getAttribute("data-visible")).toBe("true");

    // the piece under the cursor is the one marked hot, which is what brings it
    // back from grey to its own colours
    const hot = container.querySelectorAll<HTMLElement>(".graphic-tile.is-hot");
    expect(hot.length).toBe(1);
    expect(hot[0]).toBe(under.el);

    act(() => {
      box.dispatchEvent(new MouseEvent("pointerleave", { bubbles: true }));
    });
    pump(4);
    expect(container.querySelectorAll(".graphic-tile.is-hot").length).toBe(0);
    expect(caption?.getAttribute("data-visible")).toBe("false");
    unmount();
  });

  it("brings the clicked piece to the centre of the band", () => {
    const { container, unmount } = mountWall();
    pump(120);
    const box = container.querySelector<HTMLElement>(".graphic-wall");
    const settled = rects(container);
    const target = nearestTile(settled, WALL_W / 2, WALL_H / 2);

    act(() => {
      box?.dispatchEvent(
        new MouseEvent("pointerdown", { bubbles: true, clientX: target.cx, clientY: target.cy }),
      );
      clickAt(box!, target.cx, target.cy);
    });
    pump(60);

    expect(box?.getAttribute("aria-pressed")).toBe("true");
    const layer = container.querySelector<HTMLElement>(".graphic-wall-layer");
    expect(layer?.classList.contains("is-picking")).toBe(true);

    const picked = rects(container).find((t) => t.el.classList.contains("is-picked"));
    expect(picked).toBeTruthy();
    // the click landed on a piece that was actually under it
    expect(settled.some((t) => t.el === picked!.el && covers(t, target.cx, target.cy))).toBe(true);
    expect(picked!.scale).toBeGreaterThan(1.4);
    // centred, not just clamped to the nearest edge
    expect(Math.abs(picked!.cx - WALL_W / 2)).toBeLessThan(3);
    expect(Math.abs(picked!.cy - WALL_H / 2)).toBeLessThan(3);

    const m = /translate3d\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px/.exec(picked!.el.style.transform);
    const w = parseFloat(picked!.el.style.width);
    const h = parseFloat(picked!.el.style.height);
    const left = Number(m?.[1]) + (w * (1 - picked!.scale)) / 2;
    const top = Number(m?.[2]) + (h * (1 - picked!.scale)) / 2;
    expect(left).toBeGreaterThanOrEqual(-2);
    expect(left + w * picked!.scale).toBeLessThanOrEqual(WALL_W + 2);
    expect(top).toBeGreaterThanOrEqual(-2);
    expect(top + h * picked!.scale).toBeLessThanOrEqual(WALL_H + 2);
    unmount();
  });

  it("releases on any second click instead of jumping to another piece", () => {
    const { container, unmount } = mountWall();
    pump(120);
    const box = container.querySelector<HTMLElement>(".graphic-wall");
    if (!box) throw new Error("wall box missing");

    const settled = rects(container);
    const firstTarget = nearestTile(settled, WALL_W / 2, WALL_H / 2);
    const away = settled.find((t) => Math.abs(t.cx - WALL_W / 2) > 420 && t.el !== firstTarget.el);
    expect(away).toBeTruthy();

    act(() => {
      box.dispatchEvent(
        new MouseEvent("pointerdown", {
          bubbles: true,
          clientX: WALL_W / 2,
          clientY: WALL_H / 2,
        }),
      );
      clickAt(box, firstTarget.cx, firstTarget.cy);
    });
    pump(60);
    const first = container.querySelector<HTMLElement>(".graphic-tile.is-picked");
    expect(first).toBeTruthy();
    expect(box.getAttribute("aria-pressed")).toBe("true");

    // squared up, not tilted, once it reaches the centre
    const focus = rects(container).find((t) => t.el === first);
    const rot = /rotate\((-?[\d.]+)deg\)/.exec(first?.style.transform ?? "");
    expect(Math.abs(Number(rot?.[1]))).toBeLessThan(0.01);
    expect(focus && Math.abs(focus.cx - WALL_W / 2)).toBeLessThan(3);

    // a click on another piece returns the whole wall to normal
    act(() => clickAt(box, away!.cx, away!.cy));
    pump(120);
    expect(box.getAttribute("aria-pressed")).toBe("false");
    expect(container.querySelector(".graphic-tile.is-picked")).toBeNull();
    expect(
      container.querySelector<HTMLElement>(".graphic-wall-layer")?.classList.contains("is-picking"),
    ).toBe(false);
    // and the released piece is tilted again, back in its slot
    const back = rects(container).find((t) => t.el === first);
    expect(back && Math.abs(back.cx - WALL_W / 2)).toBeGreaterThan(3);

    // a click on the wall that lands between pieces does the same
    act(() => clickAt(box, firstTarget.cx, firstTarget.cy));
    pump(4);
    expect(box.getAttribute("aria-pressed")).toBe("true");
    const gap = gapPoint(rects(container));
    expect(gap).toBeTruthy();
    act(() => clickAt(box, gap!.x, gap!.y));
    pump(2);
    expect(box.getAttribute("aria-pressed")).toBe("false");
    expect(container.querySelector(".graphic-tile.is-picked")).toBeNull();

    // clicking anywhere outside the wall returns it to normal too
    act(() => clickAt(box, firstTarget.cx, firstTarget.cy));
    pump(4);
    expect(box.getAttribute("aria-pressed")).toBe("true");
    act(() => {
      document.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    });
    pump(2);
    expect(box.getAttribute("aria-pressed")).toBe("false");
    expect(container.querySelector(".graphic-tile.is-picked")).toBeNull();
    unmount();
  });

  it("picks and releases with the keyboard", () => {
    const { container, unmount } = mountWall();
    pump(10);
    const box = container.querySelector<HTMLElement>(".graphic-wall");
    expect(box?.getAttribute("tabindex")).toBe("0");

    act(() => {
      box?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    pump(2);
    expect(container.querySelector(".graphic-tile.is-picked")).toBeTruthy();

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    pump(2);
    expect(container.querySelector(".graphic-tile.is-picked")).toBeFalsy();
    expect(
      container.querySelector<HTMLElement>(".graphic-wall-layer")?.classList.contains("is-picking"),
    ).toBe(false);
    unmount();
  });
});
