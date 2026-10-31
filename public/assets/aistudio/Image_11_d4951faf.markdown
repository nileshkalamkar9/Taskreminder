---
name: Acoustic Command Workspace
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#45dfa4'
  on-tertiary: '#003825'
  tertiary-container: '#007d57'
  on-tertiary-container: '#bdffdc'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#68fcbf'
  tertiary-fixed-dim: '#45dfa4'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  title-md:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-mono:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
---

## Brand & Style

This design system delivers a futuristic, dark-mode acoustic command environment engineered for high-velocity voice-first task management. Designed for engineers, researchers, and technical professionals operating in hands-free or screen-augmented workflows, the system treats acoustic data as a first-class visual element. The emotional atmosphere is focused, technical, and ambiently responsive—evoking the precision of a digital audio workstation fused with the intelligence of an autonomous assistant.

The aesthetic pairs an ultra-dark canvas with dynamic, luminous multi-color audio waveforms. Rather than decorative flourishes, waveforms act as living state indicators, glowing with chromatic intensity during listening, processing, and playback states. The structural foundation relies on technical Grotesk typography, sharp structural contours with measured micro-radii, and frosted glass layers that suggest physical depth without visual clutter.

## Colors

The palette establishes an absolute dark-mode workspace. The canvas anchors on an obsidian foundation (`#090D16`), providing maximum contrast for high-energy spectral accents.

- **Primary (`#2563EB`)**: A high-luminance technical cobalt used for active voice triggers, primary command surfaces, and system confirmations.
- **Secondary (`#38BDF8`)**: Electric cyan, serving as the leading edge for real-time acoustic waveforms and active transcription indicators.
- **Tertiary (`#34D399`)**: Luminous emerald, denoting autonomous system completions, affirmative status indicators, and acoustic capture readiness.
- **Accent Coral (`#F87171`) & Solar Amber (`#FBBF24`)**: High-priority alert channels, temporal deadlines, and recording interrupts.
- **Surfaces & Containers**: Neutral depth builds through stepped opacity layers: Surface Base (`#090D16`), Surface Container (`#0F172A`), Surface Container High (`#1E293B`), and Border Stroke (`#334155` at 40% opacity).

## Typography

The typographical hierarchy establishes a balance between mechanical precision and scan-speed legibility. 

`Space Grotesk` drives headline, title, and numerical readouts, delivering an authentic instrumentation aesthetic. Its deliberate, geometric idiosyncrasies bring character to voice status titles and high-level project names. 

`Geist` handles runtime transcription streams, detailed task briefs, labels, and metadata. With neutral curves and tabular metrics, it ensures rapid scanning of dynamic text as real-time audio is converted into structured tasks.

Titles and metadata labels employ uppercase styling with relaxed tracking (`label-mono`) to emulate scientific audio monitoring software.

## Layout & Spacing

The layout is built around an 8px spatial grid, optimized for fluid voice-responsive interfaces across mobile, tablet, and widescreen control surfaces.

- **Mobile (< 640px)**: A 4-column layout anchored by a persistent bottom audio docking zone. Outer margin is locked at `space-md` (16px), with `space-md` gutters. Dynamic audio panels expand vertically from the bottom edge.
- **Tablet (640px - 1024px)**: An 8-column layout with `space-xl` (32px) margins and `space-lg` (24px) gutters. The interface splits between an acoustic input canvas and structured task pipelines.
- **Desktop (≥ 1024px)**: A 12-column layout centered on an ultrawide canvas (max 1440px). Margins expand to `space-2xl` (48px) with `space-xl` (32px) gutters, positioning spectral wave analysis and execution queues side by side.

Inner component spacing follows compact ratios: task list elements use `space-sm` for horizontal padding and `space-md` for row gaps to ensure high density without accidental touch overlap.

## Elevation & Depth

Visual hierarchy is communicated through luminous layering and frosted glassmorphism rather than heavy drop shadows, keeping contrast high against the deep canvas.

- **Level 0 (Floor)**: Canvas background (`#090D16`), raw and non-reflective.
- **Level 1 (Substrate Panels)**: Frosted backplates using `#0F172A` at 70% opacity, layered over an 18px backdrop blur. Borders are defined by low-contrast outlines: 1px continuous solid borders (`#334155` at 30% opacity).
- **Level 2 (Interactive Modules)**: Elevated cards and active transcripts using `#1E293B` at 85% opacity with subtle directional lighting. Upper borders receive an inner highlight stroke (`#FFFFFF` at 8% opacity) to evoke backlit acrylic hardware.
- **Level 3 (Acoustic Float & Overlays)**: Real-time voice visualizers and active capture modals. These elements cast ambient chromatic halos rather than standard black shadows: `0 0 32px -4px rgba(37, 99, 235, 0.25)` blending with `0 12px 24px -6px rgba(0, 0, 0, 0.7)`.

## Shapes

The design system uses deliberate, disciplined corners calibrated at level `2` (0.5rem / 8px default radius). This creates a machined, technical enclosure aesthetic that avoids both aggressive brutalist sharp edges and consumer-grade pill shapes.

- **Base Radius (`0.5rem` / `8px`)**: Standard input fields, task items, transcription cards, and functional tooltips.
- **Large Radius (`rounded-lg`, `1rem` / `16px`)**: Modal dialogs, persistent bottom acoustic docks, floating control modules.
- **Extra Large Radius (`rounded-xl`, `1.5rem` / `24px`)**: Voice interaction containers and primary visualization enclosures.
- **Full Radius (`9999px`)**: Reserved strictly for audio capture push-to-talk triggers, live microphone indicator pips, and discrete status chips.

## Components

### Push-to-Talk & Audio Action Buttons
- **Primary Voice Trigger**: Circular or rounded-lg interactive hub. Rest state features `#2563EB` with an ambient cyan glow. Pressing activates a breathing scale transform accompanied by a live 3-color radial waveform stroke (`#2563EB`, `#38BDF8`, `#34D399`).
- **Standard Buttons**: Flat-glass construction using `#1E293B` at 80% opacity, framed by a 1px border. Hover transitions bring the border color to `#38BDF8` with a typography shift to Space Grotesk.

### Acoustic Visualizer Waveform Modules
- Composed of 24 to 48 vertical spectral bars with `0.125rem` radii. Heights dynamically calculate via Web Audio FFT. 
- Inactive bars rest at 4px height in `#334155`. Active inputs generate a continuous color gradient sweeping horizontally from cobalt (`#2563EB`) to electric cyan (`#38BDF8`) to emerald (`#34D399`).

### Task List & Stream Items
- High-contrast, dense rows built on `#0F172A` with 8px radius.
- Completed tasks display low-opacity text with `#34D399` indicators.
- Priority levels are indicated via a 2px left border accent: Coral (`#F87171`) for Urgent, Amber (`#FBBF24`) for Medium, and Slate (`#475569`) for Normal.
- Live streaming transcription text types into an active row featuring a blinking cyan terminal cursor (`#38BDF8`).

### Chips & Filters
- Compact status elements utilizing `label-mono` typography. 
- Translucent background (`#1E293B` at 50% opacity) coupled with high-contrast colored dot indicators (4px diameter) indicating pipeline states (`LISTENING`, `PARSING`, `QUEUED`, `SYNCED`).

### Input Fields
- Deep obsidian inset fields (`#090D16`) with an inset shadow and 1px `#334155` border.
- Active focus state transitions the border to technical blue (`#2563EB`) with a subtle 4px blur outer glow, replacing standard browser outlines.
- Right-aligned integrated audio waveform toggle button allows switching seamlessly between speech dictation and manual keyboard input.