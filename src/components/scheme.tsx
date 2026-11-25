const stops = [
  { id: 1, name: "Turing Terminal", x: 280, y: 250, side: "l", line: "A" },
  { id: 2, name: "Ada Exchange", x: 390, y: 250, side: "al", transfer: true },
  { id: 3, name: "Pixel Park", x: 500, y: 250, side: "b" },
  { id: 4, name: "Byte Square", x: 610, y: 250, side: "ar", transfer: true },
  { id: 5, name: "Stack Garden", x: 720, y: 250, side: "r", line: "A" },
  { id: 6, name: "Hopper Hall", x: 250, y: 70, side: "l", line: "B" },
  { id: 7, name: "Compiler Court", x: 390, y: 376, side: "l" },
  { id: 8, name: "Kernel Hub", x: 500, y: 430, side: "a", transfer: true },
  { id: 9, name: "Syntax Square", x: 620, y: 430, side: "b" },
  { id: 10, name: "Lambda Lane", x: 740, y: 430, side: "b" },
  { id: 11, name: "Campus Gate", x: 860, y: 430, side: "r", line: "B" },
  { id: 12, name: "Edison East", x: 280, y: 430, side: "l", line: "C" },
  { id: 13, name: "Notebook Quay", x: 390, y: 430, side: "b" },
  { id: 14, name: "Library Loop", x: 610, y: 376, side: "r" },
  { id: 15, name: "Quantum Commons", x: 750, y: 70, side: "r", line: "C" },
] as const;

export const lines = [
  { name: "A", color: "#0a62b8", path: "M280,250 H720", stops: [1, 2, 3, 4, 5] },
  { name: "B", color: "#b45309", path: "M250,70 H280 Q390,70 390,140 V360 Q390,430 500,430 H860", stops: [6, 2, 7, 8, 9, 10, 11] },
  { name: "C", color: "#6d3fb0", path: "M280,430 H500 Q610,430 610,360 V140 Q610,70 720,70 H750", stops: [12, 13, 8, 14, 4, 15] },
] as const;

export default function Scheme({ selectedId }: { selectedId?: number }) {
  return (
      <svg viewBox="30 40 1000 450" width="100%" height="100%" role="img" aria-label="Map of lines A, B and C, showing stops and transfers" style={{ fontFamily: "Dosis, sans-serif" }}>
        {lines.map((line) => <path key={line.color} d={line.path} fill="none" stroke={line.color} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />)}
        {stops.map((stop) => {
          const color = lines.find((line) => line.stops.some((id) => id === stop.id))!.color;
          const terminal = "line" in stop;
          const transfer = "transfer" in stop;
          const selected = stop.id === selectedId;
          return (
            <g key={stop.id}>
              {selected && <circle className="scheme-wave" cx={stop.x} cy={stop.y} r={terminal ? 30 : 24} fill="#0f2a35" opacity="0.14" />}
              <circle cx={stop.x} cy={stop.y} r={terminal ? 18 : selected || transfer ? 13 : 10} fill={selected && !terminal ? "#0f2a35" : "white"} stroke={selected && !terminal ? "white" : transfer ? "#0f2a35" : color} strokeWidth={terminal ? 6 : selected ? 4 : 5} />
              {terminal && <text x={stop.x} y={stop.y + 8} textAnchor="middle" fontSize="23" fontWeight="700" fill={color}>{stop.line}</text>}
            </g>
          );
        })}
        {stops.map((stop) => {
          const terminal = "line" in stop;
          const selected = stop.id === selectedId;
          const x = stop.x + (stop.side === "l" ? -(terminal ? 32 : 26) : stop.side === "r" ? (terminal ? 32 : 26) : stop.side === "al" ? -14 : stop.side === "ar" ? 14 : 0);
          const y = stop.y + (stop.side === "a" ? -34 : stop.side === "b" ? 44 : stop.side === "al" || stop.side === "ar" ? -26 : 6);
          const anchor = stop.side === "l" || stop.side === "al" ? "end" : stop.side === "r" || stop.side === "ar" ? "start" : "middle";
          return <text key={stop.id} x={x} y={y} textAnchor={anchor} fontSize={selected ? 23 : 19} fontWeight={selected ? 700 : 500} fill={selected ? "#0f2a35" : "#3b4a51"} stroke="white" strokeWidth="5" paintOrder="stroke" strokeLinejoin="round">{stop.name}</text>;
        })}
      </svg>
  );
}
