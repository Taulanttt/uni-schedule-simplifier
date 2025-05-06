/*  utils/eventTypeMeta.ts
 *  Një vend i vetëm ku përcaktojmë
 *  - gërmën e shkurtër (L/U/P)
 *  - përshkrimin e plotë
 *  - ngjyrat (klasat e Tailwind) që do të përdorim kudo
 */

export const EVENT_META = {
    L: {
      short : "L",
      full  : "Ligjërata",
      bg    : "bg-purple-50",
      border: "border-purple-200",
      text  : "text-purple-700",
    },
    U: {
      short : "U",
      full  : "Ushtrime",
      bg    : "bg-green-50",
      border: "border-green-200",
      text  : "text-green-700",
    },
    P: {
      short : "P",
      full  : "Provime",
      bg    : "bg-blue-50",
      border: "border-blue-200",
      text  : "text-blue-700",
    },
  } as const;
  
  /** Merr “eventType” nga DB (p.sh. "Ligjerata, Grupi 1", "Ushtrime", "P")
   *  dhe kthen objektin përkatës nga EVENT_META.
   */
  export function mapEventType(raw: string | null | undefined) {
    const key = (raw ?? "").trim().charAt(0).toUpperCase() as keyof typeof EVENT_META;
    return EVENT_META[key] ?? {
      short : raw ?? "",
      full  : raw ?? "",
      bg    : "bg-gray-50",
      border: "border-gray-200",
      text  : "text-gray-700",
    };
  }
  