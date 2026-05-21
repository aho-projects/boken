export type OppleggId =
  | "naturfag"
  | "sketchnoting"
  | "ut-og-titte"
  | "isberg"
  | "bytte-perspektiv"
  | "hjemmelagde-kilden";

export type Opplegg = {
  id: OppleggId;
  slug: string;
  title: string;
  sub: string;
  tagColor: "blue" | "yellow" | "orange" | "default";
  tagLabel: string;
  duration: string;
  illustration: string;
  illuBg: "blue" | "yellow" | "orange" | "default";
  description: string;
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
};

export const opplegg: Opplegg[] = [
  {
    id: "naturfag",
    slug: "naturfag-ute",
    title: "Naturfag",
    sub: "Feltarbeid om biologisk mangfold i nærmiljøet — observere, tegne, gå i dybden.",
    tagColor: "blue",
    tagLabel: "Naturfag",
    duration: "4 timer",
    illustration: "/assets/peker-blomst.png",
    illuBg: "blue",
    description:
      "Et feltarbeid der elevene utforsker biologisk mangfold i sitt nærmiljø. De utforsker, tegner, diskuterer og går i dybden på det de ser. Boka blir feltdagboka deres — fylt med skisser, observasjoner og notater.",
    prev: { href: "/hjemmelagde-kilden", label: "← Den hjemmelagde kilden" },
    next: { href: "/sketchnoting", label: "Sketchnoting →" },
  },
  {
    id: "sketchnoting",
    slug: "sketchnoting",
    title: "Sketchnoting",
    sub: "Lær det visuelle alfabetet og noter med tegninger. Funker i alle fag.",
    tagColor: "yellow",
    tagLabel: "Tverrfaglig",
    duration: "2 timer",
    illustration: "/assets/visuelt-alfabet.png",
    illuBg: "yellow",
    description:
      "Et tverrfaglig opplegg der elevene lærer det visuelle alfabetet — fem grunnformer som lar dem tegne hva som helst. Det blir grunnmuren for alle andre opplegg i boka.",
    prev: { href: "/naturfag-ute", label: "← Naturfag ute" },
    next: { href: "/ut-og-titte", label: "Ut og titte →" },
  },
  {
    id: "ut-og-titte",
    slug: "ut-og-titte",
    title: "Ut og titte",
    sub: "Trene blikket. Boka med ut. Bare se, tegne og stille spørsmål.",
    tagColor: "default",
    tagLabel: "Tverrfaglig",
    duration: "1 time",
    illustration: "/assets/peker.png",
    illuBg: "default",
    description:
      "En kort, lavterskel økt: ta med boka ut, finn et sted, og tegn det dere ser. Spør spørsmål om det dere ikke skjønner.",
    prev: { href: "/sketchnoting", label: "← Sketchnoting" },
    next: { href: "/isberg", label: "Isberg →" },
  },
  {
    id: "isberg",
    slug: "isberg",
    title: "Isberg",
    sub: "Tegn det du ser og det du tror ligger under. Snakk om årsaker og det usynlige.",
    tagColor: "blue",
    tagLabel: "Samfunn",
    duration: "2 timer",
    illustration: "/assets/dypdykk.png",
    illuBg: "blue",
    description:
      "Tegn et fenomen som et isfjell: spissen er det vi ser, resten ligger under vann. Hva er årsakene? Hva er det usynlige?",
    prev: { href: "/ut-og-titte", label: "← Ut og titte" },
    next: { href: "/bytte-perspektiv", label: "Bytte perspektiv →" },
  },
  {
    id: "bytte-perspektiv",
    slug: "bytte-perspektiv",
    title: "Bytte perspektiv",
    sub: "Tegn samme situasjon fra to ulike synsvinkler. Hva endrer seg?",
    tagColor: "orange",
    tagLabel: "Samfunn / KH",
    duration: "2 timer",
    illustration: "/assets/kvinne-briller.png",
    illuBg: "orange",
    description:
      "To tegninger av samme situasjon — fra to forskjellige perspektiver. Diskuter hva som endrer seg, hva som er likt, og hva som blir synlig først når du bytter ståsted.",
    prev: { href: "/isberg", label: "← Isberg" },
    next: { href: "/hjemmelagde-kilden", label: "Den hjemmelagde kilden →" },
  },
  {
    id: "hjemmelagde-kilden",
    slug: "hjemmelagde-kilden",
    title: "Den hjemmelagde kilden",
    sub: "Lag din egen kilde — intervju, observasjon, samtale. Notatene tegnes i boka.",
    tagColor: "yellow",
    tagLabel: "Samfunn / norsk",
    duration: "3 timer",
    illustration: "/assets/tegner-tavlen.png",
    illuBg: "yellow",
    description:
      "Elevene lager sin egen primærkilde — et intervju, en observasjon, en samtale med noen i nærmiljøet. Notatene tegnes ned i boka.",
    prev: { href: "/bytte-perspektiv", label: "← Bytte perspektiv" },
    next: { href: "/naturfag-ute", label: "Naturfag ute →" },
  },
];

export function getOpplegg(id: OppleggId): Opplegg {
  const found = opplegg.find((o) => o.id === id);
  if (!found) throw new Error(`Unknown opplegg: ${id}`);
  return found;
}
