const ITEMS = [
  "Baccarat Rouge 540",
  "Jazz Club",
  "Lost Cherry",
  "Tobacco Vanille",
  "Flower Bomb",
  "Good Girl",
  "Oud for Greatness",
  "Soleil Blanc",
  "Black Oud & Vanilla",
];

export default function MarqueeStrip() {
  const repeated = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div className="border-y border-obsidian/10 overflow-hidden py-3 bg-ivory">
      <div className="flex gap-0 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-6 px-6">
            <span className="text-[10px] tracking-[3px] uppercase text-obsidian/50">{item}</span>
            <span className="text-obsidian/20 text-xs">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
