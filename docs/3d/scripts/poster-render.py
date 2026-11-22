# Render the site's approved 3D gluteus model (side view, IT band hidden,
# no on-screen labels) at print resolution, for the patient poster.
# usage: python poster_render.py OUTDIR [size_px]
import sys, time
from playwright.sync_api import sync_playwright

out = sys.argv[1]
size = int(sys.argv[2]) if len(sys.argv) > 2 else 1200  # CSS px height; x2 device scale
width = int(size * 1.6)

with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome", headless=True,
                          args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    pg = b.new_page(viewport={"width": width + 200, "height": size + 400}, device_scale_factor=2)
    pg.on("console", lambda m: print("console:", m.text) if m.type == "error" else None)
    pg.goto("http://localhost:3100/anatomy", wait_until="networkidle", timeout=120000)
    pg.wait_for_selector("canvas", timeout=120000)
    # Hide the on-screen labels and make the 3D area a large square.
    pg.add_style_tag(content=".bg-\\[\\#0b1020\\]\\/80{display:none!important}")
    pg.evaluate("""([w, s]) => {
        const c = document.querySelector('canvas');
        let el = c.parentElement; while (el && !el.classList.contains('relative')) el = el.parentElement;
        const box = el.parentElement;
        for (const e of [box, el]) { e.style.setProperty('width', w+'px', 'important'); e.style.setProperty('height', s+'px', 'important'); e.style.setProperty('max-width','none','important'); e.style.setProperty('aspect-ratio','auto','important'); }
        box.scrollIntoView();
    }""", [width, size])
    cb = pg.get_by_label("Hide the IT band to see the tendons")
    if not cb.is_checked():
        cb.check()
    for stage, label in (("before", "Before surgery"), ("after", "After repair")):
        pg.get_by_role("button", name=label, exact=True).click()
        time.sleep(4)
        pg.locator("canvas").first.screenshot(path=f"{out}/wide-{stage}.png")
        print("wrote", stage)
    b.close()


def crop_and_key(src, dst):
    """Crop a wide render to the poster frame and make the navy background
    (#1d2440) transparent, softly, so the model sits on the poster page with
    no visible box. Run after the render: crop_and_key(wide.png, poster.png)."""
    from PIL import Image
    im = Image.open(src).convert("RGBA")
    k = im.size[0] / 900
    im = im.crop((int(150 * k), int(6 * k), int(800 * k), int(556 * k)))
    px = im.load()
    bg = (29, 36, 64)
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b, _ = px[x, y]
            d = abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2])
            a = 0 if d <= 6 else 255 if d >= 40 else int((d - 6) * 255 / 34)
            px[x, y] = (r, g, b, a)
    im.save(dst, optimize=True)
