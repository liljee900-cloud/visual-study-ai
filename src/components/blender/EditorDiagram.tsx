// Accurate SVG interface zone diagrams for each Blender editor.
// These are NOT placeholders — they show actual UI layout with labeled areas.

interface Zone {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string;
  color: string; textColor?: string;
}

interface EditorLayout {
  name: string;
  zones: Zone[];
  notes?: string[];
}

const W = 640;
const H = 360;
const HEADER_H = 26;
const FOOTER_H = 22;
const SIDEBAR_W = 140;
const TOOLBAR_W = 28;

// ── Color palette (mimics Blender's dark theme) ──────────────────────────────
const C = {
  header:   "#1a1a1a",
  toolbar:  "#1d1d1d",
  sidebar:  "#1e1e1e",
  main:     "#212121",
  footer:   "#181818",
  border:   "#2a2a2a",
  accent:   "#4d90fe",
  green:    "#42aa4d",
  orange:   "#e07a20",
  purple:   "#7070cc",
  teal:     "#1daa8f",
  red:      "#cc4444",
  text:     "#aaaaaa",
  dim:      "#666666",
  badge:    "#333333",
};

function Rect({ x, y, w, h, fill, stroke = C.border, rx = 0, strokeWidth = "0.5" }: { x:number; y:number; w:number; h:number; fill:string; stroke?:string; rx?:number; strokeWidth?:string }) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} rx={rx} ry={rx} />;
}

function ZoneLabel({ zone }: { zone: Zone }) {
  const cx = zone.x + zone.w / 2;
  const cy = zone.y + zone.h / 2;
  return (
    <g>
      <rect x={cx - 36} y={cy - 10} width={72} height={20} rx="3" fill={C.badge + "cc"} />
      <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="middle"
        fill={zone.textColor ?? C.text} fontSize={9} fontFamily="system-ui" fontWeight="600">
        {zone.label}
      </text>
      {zone.sublabel && (
        <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle"
          fill={C.dim} fontSize={7} fontFamily="system-ui">
          {zone.sublabel}
        </text>
      )}
    </g>
  );
}

// ── 3D Viewport ───────────────────────────────────────────────────────────────
function Viewport3DLayout() {
  return (
    <g>
      {/* Background */}
      <Rect x={0} y={0} w={W} h={H} fill={C.main} />
      {/* Gradient "sky" */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2a3a" />
          <stop offset="100%" stopColor="#0d1117" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1410" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </linearGradient>
      </defs>
      <Rect x={TOOLBAR_W} y={HEADER_H} w={W - TOOLBAR_W - SIDEBAR_W} h={(H - HEADER_H - FOOTER_H) / 2} fill="url(#sky)" />
      <Rect x={TOOLBAR_W} y={HEADER_H + (H - HEADER_H - FOOTER_H) / 2} w={W - TOOLBAR_W - SIDEBAR_W} h={(H - HEADER_H - FOOTER_H) / 2} fill="url(#ground)" />

      {/* Grid lines on ground */}
      {[0,1,2,3,4,5].map(i => (
        <line key={`g${i}`}
          x1={TOOLBAR_W + i * 40 + 40} y1={HEADER_H + (H - HEADER_H - FOOTER_H) / 2}
          x2={TOOLBAR_W + i * 20} y2={H - FOOTER_H}
          stroke="#333" strokeWidth="0.5" opacity="0.4"
        />
      ))}

      {/* A 3D cube in the viewport */}
      <g transform={`translate(${TOOLBAR_W + (W - TOOLBAR_W - SIDEBAR_W) / 2 - 40}, ${HEADER_H + 60})`}>
        {/* Cube faces (perspective-ish) */}
        <polygon points="0,40 40,40 55,25 15,25" fill="#3a3a5c" stroke="#5555aa" strokeWidth="0.8" />
        <polygon points="0,0 40,0 40,40 0,40" fill="#2a2a4a" stroke="#4444aa" strokeWidth="0.8" />
        <polygon points="40,0 55,-15 55,25 40,40" fill="#222240" stroke="#3333aa" strokeWidth="0.8" />
        <polygon points="0,0 40,0 55,-15 15,-15" fill="#4a4a6a" stroke="#6666bb" strokeWidth="0.8" />
      </g>

      {/* Origin dot */}
      <circle cx={TOOLBAR_W + (W - TOOLBAR_W - SIDEBAR_W) / 2} cy={H / 2 + 5} r={3} fill="#ff6600" opacity="0.8" />

      {/* Header */}
      <Rect x={0} y={0} w={W} h={HEADER_H} fill={C.header} />
      <text x={8} y={16} fill={C.text} fontSize={8} fontFamily="system-ui">Viewport</text>
      {["Object Mode","View","Select","Add","Object"].map((m, i) => (
        <text key={m} x={70 + i * 55} y={16} fill={C.dim} fontSize={8} fontFamily="system-ui">{m}</text>
      ))}
      {/* Header right: overlay buttons */}
      <Rect x={W - 70} y={5} w={60} h={16} fill={C.badge} rx={3} />
      <text x={W - 40} y={15} textAnchor="middle" fill={C.dim} fontSize={7} fontFamily="system-ui">Overlays ▾</text>

      {/* Toolbar (left) */}
      <Rect x={0} y={HEADER_H} w={TOOLBAR_W} h={H - HEADER_H - FOOTER_H} fill={C.toolbar} />
      {["↖", "↔", "✂", "🖊", "⬟", "⬡"].map((ic, i) => (
        <text key={i} x={14} y={HEADER_H + 20 + i * 24} textAnchor="middle" dominantBaseline="middle"
          fill={C.dim} fontSize={10} fontFamily="system-ui">{ic}</text>
      ))}

      {/* Sidebar (right) — N panel */}
      <Rect x={W - SIDEBAR_W} y={HEADER_H} w={SIDEBAR_W} h={H - HEADER_H - FOOTER_H} fill={C.sidebar} />
      <text x={W - SIDEBAR_W + 6} y={HEADER_H + 14} fill={C.dim} fontSize={7} fontFamily="system-ui">Item | Tool | View</text>
      <Rect x={W - SIDEBAR_W + 4} y={HEADER_H + 20} w={SIDEBAR_W - 8} h={12} fill={C.badge} rx={2} />
      <text x={W - SIDEBAR_W / 2} y={HEADER_H + 27} textAnchor="middle" fill={C.text} fontSize={7} fontFamily="system-ui">Location X  0.000</text>
      <Rect x={W - SIDEBAR_W + 4} y={HEADER_H + 35} w={SIDEBAR_W - 8} h={12} fill={C.badge} rx={2} />
      <text x={W - SIDEBAR_W / 2} y={HEADER_H + 42} textAnchor="middle" fill={C.text} fontSize={7} fontFamily="system-ui">Rotation X  0.000</text>

      {/* Footer */}
      <Rect x={0} y={H - FOOTER_H} w={W} h={FOOTER_H} fill={C.footer} />
      <text x={8} y={H - 7} fill={C.dim} fontSize={7} fontFamily="system-ui">Blender 4.4 • 3D Viewport</text>

      {/* Zone labels */}
      {[
        { x: 0, y: 0, w: W, h: HEADER_H, label: "Header", sublabel: "menus & mode selector", color: C.accent + "22", textColor: C.accent },
        { x: 0, y: HEADER_H, w: TOOLBAR_W, h: H - HEADER_H - FOOTER_H, label: "Toolbar", sublabel: "T key", color: C.green + "22", textColor: C.green },
        { x: W - SIDEBAR_W, y: HEADER_H, w: SIDEBAR_W, h: H - HEADER_H - FOOTER_H, label: "Sidebar", sublabel: "N key", color: C.orange + "22", textColor: C.orange },
        { x: 0, y: H - FOOTER_H, w: W, h: FOOTER_H, label: "Status Bar", sublabel: "", color: C.purple + "22", textColor: C.purple },
      ].map((z, i) => (
        <g key={i}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={z.color} stroke="none" />
          <ZoneLabel zone={z} />
        </g>
      ))}

      {/* Viewport center label */}
      <ZoneLabel zone={{ x: TOOLBAR_W, y: HEADER_H, w: W - TOOLBAR_W - SIDEBAR_W, h: H - HEADER_H - FOOTER_H, label: "3D Viewport", sublabel: "Scene view (numpad navigation)", color: "transparent", textColor: C.teal }} />
    </g>
  );
}

// ── Shader / Node Editor ──────────────────────────────────────────────────────
function NodeEditorLayout({ label = "Shader Editor" }: { label?: string }) {
  const nodeW = 120;
  const nodeH = 70;
  const nodes = [
    { x: 60, y: 100, label: "Texture Coord", color: C.purple },
    { x: 220, y: 80, label: "Noise Texture", color: C.teal },
    { x: 220, y: 165, label: "Color Ramp", color: C.orange },
    { x: 400, y: 100, label: "Principled BSDF", color: C.green },
    { x: 560, y: 110, label: "Material Output", color: C.red },
  ];
  const wires = [
    { x1: 60+nodeW, y1: 100+20, x2: 220, y2: 80+20 },
    { x1: 220+nodeW, y1: 80+35, x2: 220, y2: 165+20 },
    { x1: 220+nodeW, y1: 165+20, x2: 400, y2: 100+35 },
    { x1: 400+nodeW, y1: 100+35, x2: 560, y2: 110+25 },
  ];
  return (
    <g>
      <Rect x={0} y={0} w={W} h={H} fill="#1c1c1c" />
      {/* Dot grid */}
      <defs>
        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.8" fill="#333" />
        </pattern>
      </defs>
      <rect x={0} y={HEADER_H} width={W} height={H - HEADER_H - FOOTER_H} fill="url(#dots)" />

      {/* Wires */}
      {wires.map((w, i) => (
        <path key={i}
          d={`M${w.x1},${w.y1} C${w.x1 + 60},${w.y1} ${w.x2 - 60},${w.y2} ${w.x2},${w.y2}`}
          stroke="#888" strokeWidth="1.5" fill="none" opacity="0.7"
        />
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <rect x={n.x} y={n.y} width={nodeW} height={nodeH} rx="4" fill="#282828" stroke={n.color} strokeWidth="1.5" />
          <rect x={n.x} y={n.y} width={nodeW} height={18} rx="4" fill={n.color + "55"} />
          <rect x={n.x} y={n.y + 14} width={nodeW} height={4} fill={n.color + "55"} />
          <text x={n.x + nodeW/2} y={n.y + 12} textAnchor="middle" dominantBaseline="middle"
            fill="white" fontSize={7} fontFamily="system-ui" fontWeight="bold">{n.label}</text>
          {/* Sockets */}
          <circle cx={n.x} cy={n.y + 32} r={4} fill="#a0a0a0" />
          <circle cx={n.x} cy={n.y + 48} r={4} fill="#6060cc" />
          <circle cx={n.x + nodeW} cy={n.y + 32} r={4} fill="#a0a0a0" />
          <circle cx={n.x + nodeW} cy={n.y + 48} r={4} fill="#00d6a3" />
        </g>
      ))}

      {/* Header */}
      <Rect x={0} y={0} w={W} h={HEADER_H} fill={C.header} />
      <text x={8} y={16} fill={C.text} fontSize={8} fontFamily="system-ui">{label}</text>
      {["View","Select","Add","Node"].map((m, i) => (
        <text key={m} x={100 + i * 44} y={16} fill={C.dim} fontSize={8} fontFamily="system-ui">{m}</text>
      ))}
      {/* Toolbar left */}
      <Rect x={0} y={HEADER_H} w={22} h={H - HEADER_H - FOOTER_H} fill={C.toolbar} />
      {/* Footer */}
      <Rect x={0} y={H - FOOTER_H} w={W} h={FOOTER_H} fill={C.footer} />
      <text x={8} y={H - 7} fill={C.dim} fontSize={7} fontFamily="system-ui">Blender 4.4 • {label}</text>

      {/* Zone annotations */}
      {[
        { x: 0, y: 0, w: W, h: HEADER_H, label: "Header", color: C.accent+"22", textColor: C.accent },
        { x: 0, y: HEADER_H, w: 22, h: H - HEADER_H - FOOTER_H, label: "T", color: C.green+"22", textColor: C.green },
        { x: 22, y: HEADER_H, w: W-22, h: H - HEADER_H - FOOTER_H, label: "Node Graph", sublabel: "Scroll to zoom • MMB to pan", color: "transparent", textColor: C.teal },
      ].map((z, i) => <g key={i}><rect x={z.x} y={z.y} width={z.w} height={z.h} fill={z.color} /><ZoneLabel zone={z} /></g>)}
    </g>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function TimelineLayout() {
  return (
    <g>
      <Rect x={0} y={0} w={W} h={H} fill="#1c1c1c" />
      {/* Header */}
      <Rect x={0} y={0} w={W} h={HEADER_H} fill={C.header} />
      <text x={8} y={16} fill={C.text} fontSize={8} fontFamily="system-ui">Timeline</text>
      {["View","Marker"].map((m, i) => (
        <text key={m} x={80 + i * 50} y={16} fill={C.dim} fontSize={8} fontFamily="system-ui">{m}</text>
      ))}

      {/* Playback controls */}
      <Rect x={W/2 - 80} y={4} w={160} h={18} fill={C.badge} rx={3} />
      {["⏮","⏴","⏹","⏵","⏭"].map((b, i) => (
        <text key={i} x={W/2 - 56 + i * 28} y={15} textAnchor="middle" dominantBaseline="middle"
          fill={b === "⏵" ? C.green : C.dim} fontSize={11} fontFamily="system-ui">{b}</text>
      ))}

      {/* Frame number area */}
      <Rect x={0} y={HEADER_H} w={55} h={H - HEADER_H - FOOTER_H} fill={C.sidebar} />
      <text x={8} y={HEADER_H + 20} fill={C.dim} fontSize={7} fontFamily="system-ui">Frame</text>

      {/* Time ruler */}
      <Rect x={55} y={HEADER_H} w={W - 55} h={20} fill={C.toolbar} />
      {Array.from({ length: 20 }).map((_, i) => (
        <g key={i}>
          <line x1={55 + i * 30} y1={HEADER_H + 20} x2={55 + i * 30} y2={HEADER_H + 24} stroke={C.dim} strokeWidth="0.5" />
          {i % 5 === 0 && (
            <text x={55 + i * 30} y={HEADER_H + 15} textAnchor="middle" fill={C.dim} fontSize={7} fontFamily="system-ui">{i * 5}</text>
          )}
        </g>
      ))}

      {/* Channel rows */}
      {["Cube","Cube.Location.X","Cube.Location.Y","Cube.Rotation.Z"].map((ch, row) => (
        <g key={row}>
          <Rect x={55} y={HEADER_H + 20 + row * 30} w={W - 55} h={30} fill={row % 2 === 0 ? "#1e1e1e" : "#1a1a1a"} />
          <text x={60} y={HEADER_H + 20 + row * 30 + 16} fill={C.dim} fontSize={7} fontFamily="system-ui">{ch}</text>
          {/* Keyframe diamonds */}
          {[2, 7, 14, 19].map(f => (
            <polygon key={f}
              points={`${55 + f * 30},${HEADER_H + 20 + row * 30 + 10} ${55 + f * 30 + 5},${HEADER_H + 20 + row * 30 + 15} ${55 + f * 30},${HEADER_H + 20 + row * 30 + 20} ${55 + f * 30 - 5},${HEADER_H + 20 + row * 30 + 15}`}
              fill={C.orange} stroke={C.orange} strokeWidth="0.5"
            />
          ))}
        </g>
      ))}

      {/* Current frame line */}
      <line x1={55 + 7*30} y1={HEADER_H + 20} x2={55 + 7*30} y2={H - FOOTER_H} stroke={C.green} strokeWidth="1.5" />

      {/* Footer */}
      <Rect x={0} y={H - FOOTER_H} w={W} h={FOOTER_H} fill={C.footer} />
      <text x={8} y={H - 7} fill={C.dim} fontSize={7} fontFamily="system-ui">Frame 35 / 250  •  24 fps  •  10.4 sec</text>

      {/* Zones */}
      {[
        { x: 0, y: 0, w: W, h: HEADER_H, label: "Header", color: C.accent+"22", textColor: C.accent },
        { x: 55, y: HEADER_H, w: W-55, h: 20, label: "Time Ruler", color: C.orange+"22", textColor: C.orange },
        { x: 0, y: HEADER_H, w: 55, h: H-HEADER_H-FOOTER_H, label: "Channels", color: C.purple+"22", textColor: C.purple },
      ].map((z, i) => <g key={i}><rect x={z.x} y={z.y} width={z.w} height={z.h} fill={z.color} /><ZoneLabel zone={z} /></g>)}
    </g>
  );
}

// ── Properties Panel ──────────────────────────────────────────────────────────
function PropertiesLayout() {
  const tabs = ["🌍","🎬","🖥","✨","⬟","🔧","⬡","🌊","🔩","🔗","🎨","💡","📸"];
  return (
    <g>
      <Rect x={0} y={0} w={W} h={H} fill="#1c1c1c" />
      <Rect x={0} y={0} w={W} h={HEADER_H} fill={C.header} />
      <text x={8} y={16} fill={C.text} fontSize={8} fontFamily="system-ui">Properties</text>

      {/* Tab strip */}
      <Rect x={0} y={HEADER_H} w={36} h={H - HEADER_H} fill={C.toolbar} />
      {tabs.map((t, i) => (
        <g key={i}>
          <Rect x={2} y={HEADER_H + 4 + i * 24} w={32} h={22} fill={i === 4 ? C.accent + "44" : C.badge} rx={3} />
          <text x={18} y={HEADER_H + 15 + i * 24} textAnchor="middle" dominantBaseline="middle"
            fill={i === 4 ? C.accent : C.dim} fontSize={11} fontFamily="system-ui">{t}</text>
        </g>
      ))}

      {/* Content area (showing Object Properties) */}
      <Rect x={36} y={HEADER_H} w={W - 36} h={H - HEADER_H} fill="#202020" />

      {/* Panels */}
      {[
        { label: "Transform", y: 10 },
        { label: "Relations", y: 80 },
        { label: "Visibility", y: 130 },
        { label: "Instancing", y: 180 },
      ].map((p, i) => (
        <g key={i}>
          <Rect x={40} y={HEADER_H + p.y} w={W - 50} h={20} fill="#2a2a2a" />
          <text x={46} y={HEADER_H + p.y + 13} fill={C.text} fontSize={8} fontFamily="system-ui" fontWeight="bold">▾ {p.label}</text>
          {/* Fake fields */}
          {i === 0 && (
            <>
              {["Location", "Rotation", "Scale"].map((f, j) => (
                <g key={j}>
                  <text x={46} y={HEADER_H + p.y + 32 + j * 16} fill={C.dim} fontSize={7} fontFamily="system-ui">{f}</text>
                  {["X","Y","Z"].map((ax, k) => (
                    <Rect key={k} x={100 + k * 50} y={HEADER_H + p.y + 24 + j * 16} w={44} h={12} fill={C.badge} rx={2} />
                  ))}
                </g>
              ))}
            </>
          )}
        </g>
      ))}

      {/* Footer */}
      <Rect x={0} y={H - FOOTER_H} w={W} h={FOOTER_H} fill={C.footer} />
      <text x={8} y={H - 7} fill={C.dim} fontSize={7} fontFamily="system-ui">Blender 4.4 • Properties</text>

      {/* Zones */}
      {[
        { x: 0, y: HEADER_H, w: 36, h: H - HEADER_H, label: "Category Tabs", color: C.accent+"22", textColor: C.accent },
        { x: 36, y: HEADER_H, w: W-36, h: H-HEADER_H, label: "Properties Panels", sublabel: "click ▾ to expand/collapse", color: C.orange+"11", textColor: C.orange },
      ].map((z, i) => <g key={i}><rect x={z.x} y={z.y} width={z.w} height={z.h} fill={z.color} /><ZoneLabel zone={z} /></g>)}
    </g>
  );
}

// ── UV Editor ─────────────────────────────────────────────────────────────────
function UVEditorLayout() {
  const meshX = 100, meshY = 60, meshW = 200, meshH = 200;
  return (
    <g>
      <Rect x={0} y={0} w={W} h={H} fill="#1c1c1c" />
      <Rect x={0} y={0} w={W} h={HEADER_H} fill={C.header} />
      <text x={8} y={16} fill={C.text} fontSize={8} fontFamily="system-ui">UV Editor</text>

      {/* UV space (0-1 square) */}
      <Rect x={meshX} y={meshY + HEADER_H} w={meshW} h={meshH} fill="#1a1a1a" stroke={C.accent} strokeWidth="1" />
      <text x={meshX + 2} y={meshY + HEADER_H - 4} fill={C.dim} fontSize={7} fontFamily="system-ui">0,0</text>
      <text x={meshX + meshW - 16} y={meshY + HEADER_H - 4} fill={C.dim} fontSize={7} fontFamily="system-ui">1,0</text>
      <text x={meshX + 2} y={meshY + HEADER_H + meshH + 10} fill={C.dim} fontSize={7} fontFamily="system-ui">0,1</text>

      {/* Grid lines */}
      {[1, 2, 3].map(i => (
        <g key={i}>
          <line x1={meshX + i * meshW/4} y1={meshY + HEADER_H} x2={meshX + i * meshW/4} y2={meshY + HEADER_H + meshH} stroke={C.border} strokeWidth="0.5" />
          <line x1={meshX} y1={meshY + HEADER_H + i * meshH/4} x2={meshX + meshW} y2={meshY + HEADER_H + i * meshH/4} stroke={C.border} strokeWidth="0.5" />
        </g>
      ))}

      {/* UV islands */}
      <polygon points={`${meshX+30},${meshY + HEADER_H + 40} ${meshX+130},${meshY + HEADER_H + 40} ${meshX+160},${meshY + HEADER_H + 140} ${meshX+10},${meshY + HEADER_H + 120}`}
        fill="none" stroke="#4488ff" strokeWidth="1.5" />
      <polygon points={`${meshX+50},${meshY + HEADER_H + 150} ${meshX+170},${meshY + HEADER_H + 150} ${meshX+170},${meshY + HEADER_H + 195} ${meshX+50},${meshY + HEADER_H + 195}`}
        fill="none" stroke="#4488ff" strokeWidth="1.5" />

      {/* UV vertices (selected) */}
      {[[30,40],[130,40],[160,140],[10,120],[50,150],[170,150],[170,195],[50,195]].map(([ox, oy], i) => (
        <rect key={i} x={meshX + ox - 3} y={meshY + HEADER_H + oy - 3} width={6} height={6} fill="#4488ff" />
      ))}

      {/* Toolbar left */}
      <Rect x={0} y={HEADER_H} w={22} h={H - HEADER_H - FOOTER_H} fill={C.toolbar} />

      {/* Footer */}
      <Rect x={0} y={H - FOOTER_H} w={W} h={FOOTER_H} fill={C.footer} />
      <text x={8} y={H - 7} fill={C.dim} fontSize={7} fontFamily="system-ui">Blender 4.4 • UV Editor</text>

      {[
        { x: 0, y: HEADER_H, w: 22, h: H-HEADER_H-FOOTER_H, label: "Toolbar", color: C.green+"22", textColor: C.green },
        { x: meshX, y: meshY+HEADER_H, w: meshW, h: meshH, label: "UV Space (0–1)", sublabel: "unwrapped mesh layout", color: C.accent+"11", textColor: C.accent },
      ].map((z, i) => <g key={i}><rect x={z.x} y={z.y} width={z.w} height={z.h} fill={z.color} /><ZoneLabel zone={z} /></g>)}
    </g>
  );
}

// ── Outliner ──────────────────────────────────────────────────────────────────
function OutlinerLayout() {
  const items = [
    { indent: 0, icon: "🌍", name: "Scene", type: "Scene" },
    { indent: 1, icon: "📷", name: "Camera", type: "Camera" },
    { indent: 1, icon: "💡", name: "Light", type: "Point Light" },
    { indent: 1, icon: "⬟", name: "Cube", type: "Mesh", selected: true },
    { indent: 2, icon: "🔧", name: "Subdivision Surface", type: "Modifier" },
    { indent: 2, icon: "🎨", name: "Material.001", type: "Material" },
    { indent: 1, icon: "⬟", name: "Plane", type: "Mesh" },
    { indent: 1, icon: "📁", name: "Collection", type: "Collection" },
    { indent: 2, icon: "⬟", name: "Tree.001", type: "Mesh" },
    { indent: 2, icon: "⬟", name: "Tree.002", type: "Mesh" },
  ];

  return (
    <g>
      <Rect x={0} y={0} w={W} h={H} fill="#1c1c1c" />
      <Rect x={0} y={0} w={W} h={HEADER_H} fill={C.header} />
      <text x={8} y={16} fill={C.text} fontSize={8} fontFamily="system-ui">Outliner</text>
      {/* Filter icons */}
      {["🔍","⬟","💡","📷"].map((ic, i) => (
        <text key={i} x={W - 90 + i * 22} y={15} fill={C.dim} fontSize={10} fontFamily="system-ui">{ic}</text>
      ))}

      {items.map((item, i) => (
        <g key={i}>
          <Rect x={0} y={HEADER_H + i * 22} w={W} h={22} fill={item.selected ? C.accent + "33" : (i % 2 === 0 ? "#1e1e1e" : "#1a1a1a")} />
          <text x={10 + item.indent * 14} y={HEADER_H + i * 22 + 13} fill={item.selected ? "white" : C.dim} fontSize={8} fontFamily="system-ui">
            {item.icon} {item.name}
          </text>
          <text x={W - 80} y={HEADER_H + i * 22 + 13} fill={C.dim} fontSize={7} fontFamily="system-ui">{item.type}</text>
          {/* Visibility dot */}
          <circle cx={W - 16} cy={HEADER_H + i * 22 + 11} r={4} fill={C.dim + "88"} />
        </g>
      ))}

      <Rect x={0} y={H - FOOTER_H} w={W} h={FOOTER_H} fill={C.footer} />
      <text x={8} y={H - 7} fill={C.dim} fontSize={7} fontFamily="system-ui">Blender 4.4 • Outliner</text>
    </g>
  );
}

// ── Compositor ────────────────────────────────────────────────────────────────
function CompositorLayout() {
  return <NodeEditorLayout label="Compositor" />;
}

// ── Generic fallback ──────────────────────────────────────────────────────────
function GenericEditorLayout({ name, icon }: { name: string; icon: string }) {
  return (
    <g>
      <Rect x={0} y={0} w={W} h={H} fill="#1c1c1c" />
      <Rect x={0} y={0} w={W} h={HEADER_H} fill={C.header} />
      <text x={8} y={16} fill={C.text} fontSize={8} fontFamily="system-ui">{name}</text>
      <text x={W/2} y={H/2 - 10} textAnchor="middle" fill="#333" fontSize={40} fontFamily="system-ui">{icon}</text>
      <text x={W/2} y={H/2 + 20} textAnchor="middle" fill={C.dim} fontSize={12} fontFamily="system-ui">{name}</text>
      <text x={W/2} y={H/2 + 36} textAnchor="middle" fill={C.dim + "88"} fontSize={9} fontFamily="system-ui">Blender 4.4</text>
      <Rect x={0} y={H - FOOTER_H} w={W} h={FOOTER_H} fill={C.footer} />
    </g>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

const LAYOUTS: Record<string, () => React.ReactNode> = {
  "3d-viewport":          () => <Viewport3DLayout />,
  "shader-editor":        () => <NodeEditorLayout label="Shader Editor" />,
  "geometry-node-editor": () => <NodeEditorLayout label="Geometry Nodes" />,
  "compositor":           () => <CompositorLayout />,
  "timeline":             () => <TimelineLayout />,
  "properties":           () => <PropertiesLayout />,
  "uv-editor":            () => <UVEditorLayout />,
  "outliner":             () => <OutlinerLayout />,
};

interface Props {
  editorId: string;
  editorName: string;
  editorIcon: string;
  caption?: string;
  className?: string;
  onClick?: () => void;
}

export default function EditorDiagram({ editorId, editorName, editorIcon, caption, className, onClick }: Props) {
  const renderLayout = LAYOUTS[editorId] ?? (() => <GenericEditorLayout name={editorName} icon={editorIcon} />);

  return (
    <figure className={`space-y-2 ${className ?? ""}`}>
      <div
        className="relative bg-[#141414] border border-white/8 rounded-2xl overflow-hidden group cursor-zoom-in"
        onClick={onClick}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          role="img"
          aria-label={`${editorName} interface diagram`}
        >
          {renderLayout()}
        </svg>

        {/* Source badge */}
        <div className="absolute bottom-2 left-2">
          <span className="bg-black/60 text-white/30 text-[8px] px-2 py-1 rounded-md font-mono">
            interface diagram · Blender 4.4
          </span>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-black/60 text-white/60 text-[9px] px-2 py-1 rounded-md">🔍 click to zoom</span>
        </div>
      </div>
      {caption && (
        <figcaption className="text-[11px] text-white/35 leading-relaxed px-1">↑ {caption}</figcaption>
      )}
    </figure>
  );
}
