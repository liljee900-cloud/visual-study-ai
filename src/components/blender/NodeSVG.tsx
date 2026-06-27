// Renders an accurate Blender-style node as SVG from structured data.
// Socket colors match Blender 4.4 exactly. No placeholder — this IS the node image.

import type { NodeSocket } from "@/lib/blender/types";

// Blender 4.4 official socket colors
const SOCKET_COLORS: Record<string, { fill: string; stroke: string }> = {
  Geometry:   { fill: "#00d6a3", stroke: "#00b389" },
  Float:      { fill: "#a1a1a1", stroke: "#888888" },
  Integer:    { fill: "#598c5c", stroke: "#477249" },
  Boolean:    { fill: "#cca6d7", stroke: "#a87db5" },
  Vector:     { fill: "#6363c7", stroke: "#4d4da0" },
  Color:      { fill: "#c7c729", stroke: "#a0a020" },
  Shader:     { fill: "#63c763", stroke: "#4da04d" },
  String:     { fill: "#70b2ff", stroke: "#5090dd" },
  Object:     { fill: "#ed9e5c", stroke: "#c47e3e" },
  Collection: { fill: "#ffffff", stroke: "#cccccc" },
  Image:      { fill: "#633863", stroke: "#4a2a4a" },
  Material:   { fill: "#eb7582", stroke: "#c05060" },
  Rotation:   { fill: "#e57373", stroke: "#c05050" },
  Texture:    { fill: "#ab5e76", stroke: "#8a3d55" },
  Menu:       { fill: "#8888aa", stroke: "#6666aa" },
};

const CATEGORY_HEADER: Record<string, string> = {
  "geometry-nodes":    "#215f4f",
  "shader-nodes":      "#213f3f",
  "compositor-nodes":  "#1e2e4a",
  "texture-nodes":     "#3f2c1e",
  "simulation-nodes":  "#2a1e3f",
};

const NODE_DARK = "#282828";
const NODE_BODY = "#1d1d1d";
const NODE_SHADOW = "rgba(0,0,0,0.6)";

interface Props {
  name: string;
  category: string;
  subcategory?: string;
  inputs: NodeSocket[];
  outputs: NodeSocket[];
  className?: string;
  width?: number;
}

export default function NodeSVG({ name, category, subcategory, inputs, outputs, className, width = 260 }: Props) {
  const HEADER_H = 32;
  const ROW_H    = 24;
  const PADDING  = 10;
  const SOCK_R   = 6;
  const FONT_SZ  = 11;

  const maxRows  = Math.max(inputs.length, outputs.length);
  const bodyH    = Math.max(maxRows * ROW_H + PADDING * 2, 40);
  const totalH   = HEADER_H + bodyH + 4; // +4 for border

  const headerColor = CATEGORY_HEADER[category] ?? "#2a2a2a";

  function sockColor(type: string) {
    return SOCKET_COLORS[type] ?? { fill: "#888888", stroke: "#666666" };
  }

  // Truncate text to fit socket label area
  function truncate(s: string, max = 18) {
    return s.length > max ? s.slice(0, max - 1) + "…" : s;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${totalH}`}
      width={width}
      height={totalH}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`${name} node`}
    >
      <defs>
        <filter id="ns" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={NODE_SHADOW} />
        </filter>
        <clipPath id="nc">
          <rect x="1" y="1" width={width - 2} height={totalH - 2} rx="6" ry="6" />
        </clipPath>
      </defs>

      {/* Drop shadow + outer border */}
      <rect x="1" y="1" width={width - 2} height={totalH - 2} rx="6" ry="6"
        fill={NODE_DARK} stroke="#111" strokeWidth="1.5" filter="url(#ns)" />

      {/* Header */}
      <rect x="1" y="1" width={width - 2} height={HEADER_H} rx="6" ry="6"
        fill={headerColor} clipPath="url(#nc)" />
      <rect x="1" y={HEADER_H - 6} width={width - 2} height={6} fill={headerColor} />

      {/* Header text */}
      <text x={width / 2} y={HEADER_H - 10} textAnchor="middle" dominantBaseline="auto"
        fill="#ffffffcc" fontSize={13} fontWeight="600" fontFamily="system-ui, sans-serif"
        letterSpacing="0.01em">
        {name}
      </text>

      {/* Subcategory badge */}
      {subcategory && (
        <text x={width / 2} y={HEADER_H - 1} textAnchor="middle" dominantBaseline="auto"
          fill="#ffffff55" fontSize={8} fontFamily="system-ui, sans-serif">
          {subcategory.toUpperCase()}
        </text>
      )}

      {/* Node body */}
      <rect x="1" y={HEADER_H} width={width - 2} height={bodyH + 4} fill={NODE_BODY}
        clipPath="url(#nc)" />

      {/* Divider line */}
      <line x1="1" y1={HEADER_H + 1} x2={width - 1} y2={HEADER_H + 1}
        stroke="#111" strokeWidth="1" />

      {/* Input sockets (left side) */}
      {inputs.map((inp, i) => {
        const y = HEADER_H + PADDING + i * ROW_H + ROW_H / 2;
        const sc = sockColor(inp.type);
        return (
          <g key={`in-${i}`}>
            {/* Socket dot */}
            <circle cx={SOCK_R + 1} cy={y} r={SOCK_R}
              fill={sc.fill} stroke={sc.stroke} strokeWidth="1.5" />
            {/* Socket name */}
            <text x={SOCK_R * 2 + 7} y={y + 0.5} dominantBaseline="middle"
              fill="#ffffffbb" fontSize={FONT_SZ} fontFamily="system-ui, sans-serif">
              {truncate(inp.name)}
            </text>
            {/* Default value (if short) */}
            {inp.default && inp.default.length < 8 && (
              <text x={width - 12} y={y + 0.5} textAnchor="end" dominantBaseline="middle"
                fill="#ffffff44" fontSize={FONT_SZ - 1} fontFamily="monospace">
                {inp.default}
              </text>
            )}
          </g>
        );
      })}

      {/* Output sockets (right side) */}
      {outputs.map((out, i) => {
        const y = HEADER_H + PADDING + i * ROW_H + ROW_H / 2;
        const sc = sockColor(out.type);
        return (
          <g key={`out-${i}`}>
            {/* Socket name */}
            <text x={width - SOCK_R * 2 - 8} y={y + 0.5} textAnchor="end" dominantBaseline="middle"
              fill="#ffffffbb" fontSize={FONT_SZ} fontFamily="system-ui, sans-serif">
              {truncate(out.name)}
            </text>
            {/* Socket dot */}
            <circle cx={width - SOCK_R - 1} cy={y} r={SOCK_R}
              fill={sc.fill} stroke={sc.stroke} strokeWidth="1.5" />
          </g>
        );
      })}

      {/* Separator line between inputs & outputs if both present */}
      {inputs.length > 0 && outputs.length > 0 && (
        <line
          x1={width / 2} y1={HEADER_H + PADDING}
          x2={width / 2} y2={HEADER_H + bodyH - PADDING}
          stroke="#ffffff10" strokeWidth="1" strokeDasharray="3,3"
        />
      )}
    </svg>
  );
}

// ── Workflow connector diagram ──────────────────────────────────────────────
// Renders a node connection chain like A → B → C as an SVG flow diagram.

interface FlowNode { label: string; color?: string }

interface WorkflowSVGProps {
  steps: (string | FlowNode)[];
  className?: string;
}

const FLOW_COLORS = ["#00d6a3", "#c7c729", "#6363c7", "#ed9e5c", "#63c763", "#cca6d7"];

export function WorkflowSVG({ steps, className }: WorkflowSVGProps) {
  const BOX_W = 130;
  const BOX_H = 36;
  const GAP   = 32;
  const PAD   = 10;
  const totalW = steps.length * BOX_W + (steps.length - 1) * GAP + PAD * 2;
  const totalH = BOX_H + PAD * 2;

  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} width="100%" className={className}
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Node workflow">
      {steps.map((step, i) => {
        const x = PAD + i * (BOX_W + GAP);
        const y = PAD;
        const label = typeof step === "string" ? step : step.label;
        const color = (typeof step === "object" ? step.color : undefined) ?? FLOW_COLORS[i % FLOW_COLORS.length];
        return (
          <g key={i}>
            {/* Arrow */}
            {i > 0 && (
              <>
                <line
                  x1={x - GAP} y1={PAD + BOX_H / 2}
                  x2={x - 4} y2={PAD + BOX_H / 2}
                  stroke="#ffffff30" strokeWidth="1.5"
                />
                <polygon
                  points={`${x - 6},${PAD + BOX_H / 2 - 4} ${x},${PAD + BOX_H / 2} ${x - 6},${PAD + BOX_H / 2 + 4}`}
                  fill="#ffffff30"
                />
              </>
            )}
            {/* Box */}
            <rect x={x} y={y} width={BOX_W} height={BOX_H} rx="5" ry="5"
              fill="#1d1d1d" stroke={color} strokeWidth="1.5" />
            {/* Color accent bar */}
            <rect x={x} y={y} width={4} height={BOX_H} rx="2" ry="2" fill={color} />
            {/* Label */}
            <text x={x + BOX_W / 2 + 2} y={y + BOX_H / 2 + 0.5}
              textAnchor="middle" dominantBaseline="middle"
              fill="#ffffffcc" fontSize={10} fontFamily="system-ui, sans-serif"
              fontWeight="500">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
