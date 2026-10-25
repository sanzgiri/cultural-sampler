# The Weekly Margin — design workflow

## Discover: three directions

### 1. The Weekly Paper

**Feeling:** a carefully edited Sunday supplement. **Metaphor:** folded newsprint and marginalia. **Composition:** one strong weekly masthead, a quiet edition index, editorial rows rather than equal dashboard tiles. **Type:** literary serif headlines with compact grotesk metadata. **Color/material:** warm paper, ink, one oxidized accent, thin rules. **Avoid:** faux newspaper clutter, fake columns, decorative vintage distress.

### 2. The Listening Room

**Feeling:** slow attention and deliberate sequence. **Metaphor:** a record sleeve, book jacket, and cinema program sharing one table. **Composition:** a single featured item followed by a small shelf of alternatives; media types identified by texture and proportion rather than bright badges. **Type:** large humanist serif with restrained mono labels. **Color/material:** dark green/charcoal, cream, muted album-spine colors. **Avoid:** dark-mode streaming clone, oversized hero imagery, autoplay cues.

### 3. The Commonplace Margin — selected

**Feeling:** a personal notebook that happens to arrive weekly. **Metaphor:** the margin beside a marked page: room for the main work and one useful connection. **Composition:** finite cards for the week's cultural works, then a quieter learning/margin section for a thought and thinking tool. The hierarchy should be editorial, not a content dashboard. **Type:** Fraunces for considered titles; DM Sans for prose; DM Mono for small provenance labels. **Color/material:** warm paper, ink green, sage, faded blue, terracotta. **Content behavior:** every card explains why it is here; a sample/access link is required for publication; absent links remove the candidate before edition freeze. **Avoid:** infinite scroll, uniform pills, decorative image slots, generic recommendation copy, certainty theater.

## Defined identity

Product: **The Weekly Margin**

Tagline: **A small edition of things worth carrying into the week.**

The first implementation already follows the selected direction: warm paper, literary serif, mono provenance labels, restrained rules, finite cards, and a separate evidence/learning section. This pass adds stronger editorial hierarchy, clearer sample states, and less dashboard-like repetition.

## Visual QA protocol

Capture at 1440×1000 and 390×844 using local Chrome headless. Inspect the screenshots as a separate visual review. Prioritize composition and hierarchy, then typography, spacing, sample state clarity, interaction cues, and mobile density. Apply the three highest-leverage fixes; do not add decoration to compensate for weak hierarchy.

## Visual review record

**Initial findings:** desktop had a coherent editorial hierarchy but the first viewport cut into the recommendation cards; this is acceptable for an edition page, though the sample actions belong below the fold. The mobile capture revealed a real responsive failure: the header navigation and flex copy could force horizontal clipping. The notification copy also still named the previous Wider product.

**Applied fixes:** flex-wrap and mobile navigation layout; explicit shrink/wrap rules for editorial copy and cards; mobile typography sizing; replaced stale Wider copy; generated true device-metric mobile capture rather than relying on a scaled desktop screenshot.

**Final captures:** `design-review/desktop-after.png` and `design-review/mobile-cdp.png`. The final 390px capture reports `innerWidth=390`, `scrollWidth=390`, and no horizontal overflow. The final visual identity remains intentionally restrained: warm paper, literary serif, mono provenance, three quiet media textures, and no decorative image-of-the-day slot.

**Critic limitation:** no separate visual-critic subagent is installed in this Pi session, so this pass is an author-led visual review against the brief rather than an independent 9/10 gate. The screenshots and review notes are preserved for Luna med or a human designer to critique before deployment.
