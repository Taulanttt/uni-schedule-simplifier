/* LegendComponent.tsx */
import React from "react";
import clsx from "clsx";

/* E njëjta tabelë meta që përdorim edhe te kartat */
const TYPE_META = {
  L: {
    full: "Ligjërata",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
  },
  U: {
    full: "Ushtrime",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
  },
  P: {
    full: "Provime",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
} as const;

type ShortType = keyof typeof TYPE_META;

/* ------------ Një badge + label ------------ */
const LegendItem: React.FC<{ type: ShortType }> = ({ type }) => {
  const meta = TYPE_META[type];

  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          "w-5 h-5 rounded flex items-center justify-center text-xs font-semibold",
          meta.bg,
          meta.border,
          meta.text
        )}
        style={{ lineHeight: 1 }}
      >
        {type}
      </div>
      <span className={clsx("text-sm", meta.text)}>{meta.full}</span>
    </div>
  );
};

/* ------------ Komponenti kryesor ------------ */
const LegendComponent: React.FC = () => (
  <div className="mb-6 flex flex-wrap items-center gap-4 sm:gap-6">

    <h3 className="text-lg font-semibold">Legjenda</h3>

    {(["L", "U", "P"] as ShortType[]).map((t) => (
      <LegendItem key={t} type={t} />
    ))}
  </div>
);

export default LegendComponent;
