# Sri Lanka Power Cut Schedule & Interactive Grid Map

An interactive, responsive Sri Lankan map and intelligent search system for the Ceylon Electricity Board (CEB) Demand Management power cut schedule (October 19–21, 2026), enabling users to click any grid substation, search their feeder or town, and instantly view live power cut timings and countdown alerts.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were established during Phase 1 clarification:
> - **Interactive Map Style**: Custom SVG interactive map of Sri Lanka displaying administrative districts and geolocated Ceylon Electricity Board (CEB) Grid Substations (GSS) with responsive touch/hover targets.
> - **Search Experience**: Instant omni-search input supporting city/town names, Grid Substations, feeder numbers, and group IDs with auto-highlighting on the map.
> - **Schedule & Timeline**: Live real-time power cut status indicator with live countdown to next power cut/restoration, interactive date picker tabs (19th, 20th, 21st October 2026), and full group schedules.

- **Confirmed Decision 1**: Interactive SVG map of Sri Lanka with district boundaries and precision pins for all Grid Substations extracted from the schedule.
- **Confirmed Decision 2**: Dual exploration mode—touch/click on map to inspect a station, or type in the search bar for instant matching across GSS, feeder numbers, and common Sri Lankan cities/towns.
- **Confirmed Decision 3**: Complete digitized dataset covering all 4 Groups (01, 02, 03, 04) with exact feeder allocations and 3-day demand management blackout slots.

---

## 1. Overview & Core Concept

- **What It Does**: Digitizes the official Ceylon Electricity Board (CEB) Demand Management Schedules for October 19th, 20th, and 21st, 2026. Users can touch any location or Grid Substation (GSS) across Sri Lanka or search by town/feeder to instantly see which Group they belong to, exact scheduled blackout time windows (4:30 PM – 8:30 PM evening slots), current live power status, and time remaining until restoration.
- **Target Audience / Persona**: Sri Lankan citizens, businesses, hospital/shop managers, remote workers, and travelers needing to know exact power cut timings for their neighborhood or workplace.
- **Key Value**: Replaces cumbersome multi-page PDF tables with an intuitive map-first and search-first interface that answers the question *"When will the power go off in my area today?"* in under two seconds.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Map Exploration**: The user lands on the Sri Lanka map. Stations are color-coded by their Group (Group 1: Amber, Group 2: Cyan, Group 3: Purple, Group 4: Rose) or current power status. Tapping a substation opens an inspection drawer showing the exact feeder numbers, associated cities/towns, and today's cut timetable.
2. **Instant Search**: User types "Kelaniya", "Matara", "Kurunegala", "Dehiwala", or feeder "C-09". Search suggestions immediately pop up; selecting one smoothly zooms and highlights the station pin on the map and opens the power schedule.
3. **Live Status & Date Switching**: Top ticker shows the current island power status for today's date (Oct 19, 20, or 21). Users can switch dates with 1-click tabs or use a timeline scrub bar to see which areas will lose power at each hour of the evening.
4. **Feeder Lookup Helper**: Allows users to enter their CEB feeder number (e.g. Feeder 4 of Ratmalana) to confirm whether their particular line is interrupted during that slot.

### Visual Identity & Theme

- **Aesthetic Direction**: High-clarity civic utility and grid operations dashboard. Clean, high-contrast dark slate (`#0B0F19`) background with subtle grid lines evoking electrical network engineering, illuminated by purposeful neon status accents.
- **Color Palette & Mood**:
  - Base: Deep Slate (`#0B0F19`) canvas, Subdued Surface (`#111827`), Subtle Borders (`#1F2937`)
  - Semantic Status:
    - Normal / Power On: Emerald (`#10B981`)
    - Power Cut Active: Rose / Crimson (`#F43F5E`)
    - Cut Approaching Soon (< 30 min): Amber (`#F59E0B`)
  - Group Accents:
    - Group 01: Amber / Sun (`#F59E0B`)
    - Group 02: Sky Blue (`#0EA5E9`)
    - Group 03: Violet / Purple (`#8B5CF6`)
    - Group 04: Coral / Rose (`#EC4899`)
- **Typography & Hierarchy**:
  - Primary UI & Display: `Plus Jakarta Sans` / `DM Sans` (clean, contemporary readability)
  - Timers, Feeder IDs, and Clock: Monospace tabular numbers (`font-mono tabular-nums`) to prevent layout shift during countdowns.
- **Anti-Slop Restraint**: Zero decorative glowing badges or fake AI scores. Real SVG geometry for Sri Lanka districts and coastline, crisp typography, clean hairline borders, and full touch-target compliance ($\ge 44\text{px}$).

---

## 3. Key Product Decisions & Trade-Offs

- **Vector SVG vs Heavy Tile Map**:
  - *Chosen Approach*: Self-contained, lightweight vector SVG map of Sri Lanka with 25 administrative districts and geocoded GSS points.
  - *Why*: Instant load time, zero external tile rate limits or network dependencies, crisp rendering on all screen sizes, and fluid pinch/pan/zoom and touch event handling.
  - *Alternative Considered*: Leaflet/Mapbox tiles, which require heavy external asset downloads, API tokens, and can lag on mobile networks.
- **Complete In-Memory Schedule Database**:
  - *Chosen Approach*: Fully structured TypeScript data model containing all 4 groups, ~60+ Grid Substations, all feeder lists, and 3-day time slots extracted from the 11 uploaded schedule images.
  - *Why*: Enables instant zero-latency client-side search, filtering, and offline-capable PWA experience with zero server roundtrips.
- **Simulated Real-Time + Live Date Controls**:
  - *Chosen Approach*: The schedules in the photos are dated October 19th, 20th, and 21st, 2026. The app provides a "Live Time Simulator" toggle (defaulting to the current time transposed to the active schedule day, with a quick time slider) so users can test any time of the day and see real-time active blackout zones light up on the map.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CEB Power Cut Dashboard                         │
├────────────────────────────────────────────────────────────────────────┤
│  Top Bar: [Sri Lanka Power Cut Map] ── [Oct 19 | Oct 20 | Oct 21]      │
├───────────────────────────────────┬────────────────────────────────────┤
│  Left / Top Controls              │  Right / Main Interactive View     │
│  ┌─────────────────────────────┐  │  ┌──────────────────────────────┐  │
│  │ Instant Search Bar          │  │  │ Interactive Sri Lanka Map    │  │
│  │ (City / GSS / Feeder)       │  │  │ - 25 District Polygons       │  │
│  ├─────────────────────────────┤  │  │ - Clickable GSS Hotspots     │  │
│  │ Live Status & Countdown     │  │  │ - Active Cut Glow Zones      │  │
│  │ "Group 01: Cut Active (42m)"│  │  │ - Smooth Zoom / Pan / Reset  │  │
│  ├─────────────────────────────┤  │  └──────────────────────────────┘  │
│  │ Selected Station Details    │  │  ┌──────────────────────────────┐  │
│  │ - GSS: Ratmalana            │  │  │ Daily Timeline View (1hr     │  │
│  │ - Group: 02 & 03            │  │  │ slots: 4:30 PM - 8:30 PM)    │  │
│  │ - Feeders: 2, 7, 9 & 3, 4, 5│  │  │ - Filter by Group            │  │
│  │ - Today's Cut: 17:30 - 18:30│  │  │ - Feeder Disconnection Matrix│  │
│  └─────────────────────────────┘  │  └──────────────────────────────┘  │
└───────────────────────────────────┴────────────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │ Data Layer: `powerCutData.ts`                           │
       │ - GSS Coordinates & District Mapping                    │
       │ - Feeder Allocation (Groups 01, 02, 03, 04)             │
       │ - Time Slots for Oct 19, Oct 20, Oct 21, 2026           │
       │ - Town/City Synonym Dictionary (e.g. Mount Lavinia ->   │
       │   Ratmalana, Negombo -> Katunayaka/Kotugoda)            │
       └─────────────────────────────────────────────────────────┘
```

### Complete Extracted Data Entities

1. **Schedule By Date**:
   - **October 19, 2026**:
     - 04:30 PM – 05:30 PM: Group 1 (1 hr)
     - 05:30 PM – 06:30 PM: Group 2 (1 hr)
     - 06:30 PM – 07:30 PM: Group 3 (1 hr)
     - 07:30 PM – 08:30 PM: Group 4 (1 hr)
   - **October 20, 2026**:
     - 04:30 PM – 05:30 PM: Group 4 (1 hr)
     - 05:30 PM – 06:30 PM: Group 1 (1 hr)
     - 06:30 PM – 07:30 PM: Group 2 (1 hr)
     - 07:30 PM – 08:30 PM: Group 3 (1 hr)
   - **October 21, 2026**:
     - 04:30 PM – 05:30 PM: Group 3 (1 hr)
     - 05:30 PM – 06:30 PM: Group 4 (1 hr)
     - 06:30 PM – 07:30 PM: Group 1 (1 hr)
     - 07:30 PM – 08:30 PM: Group 2 (1 hr)

2. **GSS to Group & Feeder Mapping**:
   - Covers all ~60 Grid Substations from the photos: Ambalangoda, Ampara, Aniyakanda, Anuradhapura, Athurugiriya, Badulla, Balangoda, Beliatta, Biyagama, Bolawatta, Chilaw, Chunnakam, Dehiwala, Deniyaya, Embilipitiya, Habarana, Hambantota, Horana, Kalutara, Kappalthurai, Katunayaka, Kegalle, Kelaniya, Kerawalapitiya, Kesbewa, Kilinochchi, Kiribathkumbura, Kolonnawa, Kosgama, Kotugoda, Kurunegala, Mahiyanganaya, Maho, Maliboda, Mannar, Matara, Mathugama, Monaragala, Naula, Nawalapitiya, New Anuradhapura, New Galle, Nuwara Eliya, Pallekele, Panadura, Pannala, Pannipitiya, Polonnaruwa, Puttalam, Ragala, Ratmalana, Ratnapura, Sapugaskanda, Seethawaka, Sri Jayawardenepura, SUB A, SUB C, SUB I, SUB M, SUB N, Thulhiriya, Trincomalee, Ukuwela, Valachchenai, Vavunathivu, Vavuniya, Veyangoda, Wewelwatta, Wimalasurendra.
   - Comprehensive town alias database linking surrounding suburbs and towns to their respective primary GSS (e.g. Kandy -> Kiribathkumbura/Pallekele, Moratuwa -> Ratmalana, Nugegoda/Kotte -> Sri J'pura, Negombo -> Katunayaka, etc.).

3. **Key Components**:
   - `Header`: Clean brand top bar with date navigation buttons and status summary.
   - `SriLankaMap`: Interactive SVG map with smooth zoom/pan, district outlines, GSS pins with dynamic power status pulsing ring, and hover tooltips.
   - `SearchBar`: Typeahead search filtering by town name, substation name, feeder code, or district.
   - `StationDetailModal / Sidebar`: Detailed substation card showing all feeders, active groups, scheduled times for all 3 days, and countdown clock.
   - `TimelineSlider`: Interactive time scrubber to preview power cut distribution at any hour of the day.
   - `ScheduleTableView`: Full searchable tabular view for quick printing or comprehensive verification against original CEB documents.
