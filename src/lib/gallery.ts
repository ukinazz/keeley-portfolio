import cbmeEaster from "@/assets/graphic/cbme-easter.webp";
import cbmeEarlyBird from "@/assets/graphic/cbme-early-bird.webp";
import cbmeSustainability from "@/assets/graphic/cbme-sustainability.webp";
import krystolabTools from "@/assets/graphic/krystolab-feature-tools.webp";
import krystolabCrystals from "@/assets/graphic/krystolab-feature-crystals.webp";
import butterbaseDyad from "@/assets/graphic/butterbase-dyad.webp";
import butterbaseQoder from "@/assets/graphic/butterbase-qoder.webp";
import butterbaseNocode from "@/assets/graphic/butterbase-nocode-stack.webp";
import butterbaseCredits from "@/assets/graphic/butterbase-ai-credits.webp";
import butterbaseRenting from "@/assets/graphic/butterbase-not-renting.webp";
import butterbaseBranch from "@/assets/graphic/butterbase-branch-preview.webp";
import butterbaseTestFirst from "@/assets/graphic/butterbase-test-first.webp";
import butterbaseHackHarvard from "@/assets/graphic/butterbase-hack-harvard.webp";
import natureGallery from "@/assets/graphic/nature-gallery-poster.webp";
import sheaTenArrivals from "@/assets/graphic/shea-ten-new-arrivals.webp";
import sheaTenHangtag from "@/assets/graphic/shea-ten-hangtag.webp";

export type Graphic = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Reads under the piece: the discipline and the client, never the headline printed on the artwork. */
  meta: string;
  /** Times this piece may appear on the wall. Defaults to the wall's own cap. */
  wallCopies?: number;
};

/**
 * Width and height are the delivered file dimensions, not the original artwork
 * size: the wall sizes every tile from these numbers before the image loads, so
 * a mismatch would show up as a distorted tile.
 */
export const graphics: Graphic[] = [
  {
    src: butterbaseNocode,
    width: 880,
    height: 1100,
    meta: "Product marketing graphic for Butterbase",
    alt: "Yellow social post listing butterbase.ai with database, auth, permissions, realtime, AI builder and AI gateway checkmarks",
  },
  {
    src: butterbaseCredits,
    width: 880,
    height: 1100,
    meta: "Paid social graphic for Butterbase",
    alt: "Orange promotional graphic offering 1,000 dollars of free AI model credits on a torn ticket illustration",
  },
  {
    src: cbmeEaster,
    width: 940,
    height: 788,
    meta: "Seasonal event content for CBME China",
    alt: "Easter greeting poster for CBME China 2024 with a row of patterned teal and coral eggs",
  },
  {
    src: butterbaseQoder,
    width: 1100,
    height: 579,
    meta: "Co-marketing launch graphic for Qoder and Butterbase",
    alt: "Dark launch graphic pairing the Qoder and Butterbase logos above a plugin marketplace screenshot",
  },
  {
    src: krystolabTools,
    width: 1100,
    height: 658,
    meta: "App store creative for KrystoLab",
    wallCopies: 1,
    alt: "Three phone screens showing the KrystoLab tool list, bracelet designer and BaZi reading report",
  },
  {
    src: butterbaseRenting,
    width: 880,
    height: 1100,
    meta: "Social campaign graphic for Butterbase",
    alt: "Split cream and grey social post comparing butterbase.ai with CRM, client portal, automations and support tools",
  },
  {
    src: natureGallery,
    width: 777,
    height: 1100,
    meta: "Event design for a picnic and camping series",
    alt: "Van Gogh style painted field with swirling sky used as a Nature Gallery event poster",
  },
  {
    src: butterbaseBranch,
    width: 1080,
    height: 1080,
    meta: "Product explainer graphic for Butterbase",
    alt: "Black flow diagram on square canvas moving a change from draft through preview to live production",
  },
  {
    src: butterbaseDyad,
    width: 1100,
    height: 777,
    meta: "Co-marketing graphic for Dyad and Butterbase",
    alt: "White co-marketing graphic pairing Dyad and Butterbase logos above an infrastructure connector library",
  },
  {
    src: cbmeSustainability,
    width: 513,
    height: 1100,
    meta: "Event infographic for CBME",
    alt: "Tall navy and pink CBME infographic giving visitors four sustainability actions",
  },
  {
    src: butterbaseTestFirst,
    width: 823,
    height: 1100,
    meta: "Product explainer graphic for Butterbase",
    alt: "Apple illustration explaining how a red live app is tested as a green copy before being pushed live",
  },
  {
    src: krystolabCrystals,
    width: 1100,
    height: 658,
    meta: "App store creative for KrystoLab",
    wallCopies: 1,
    alt: "Three phone screens showing the KrystoLab crystal library, daily fortune page and sound bath player",
  },
  {
    src: butterbaseHackHarvard,
    width: 777,
    height: 1100,
    meta: "Event marketing for HackHarvard and Butterbase",
    alt: "Red and blue event poster for an AI Build Workshop with a robotic hand reaching upward",
  },
  {
    src: cbmeEarlyBird,
    width: 1080,
    height: 1080,
    meta: "Ticket campaign graphic for CBME",
    alt: "Square CBME social post announcing the early bird deadline and VIP pass benefits",
  },
  {
    src: sheaTenArrivals,
    width: 660,
    height: 1100,
    meta: "Launch campaign artwork for Shea 10",
    alt: "Cream fashion poster with the Shea 10 signature above ten models in black and neutral outfits",
  },
  {
    src: sheaTenHangtag,
    width: 1100,
    height: 618,
    meta: "Brand collateral for Shea 10",
    alt: "Black garment hangtag shown front and back, signed Designed by Shea 10 and closing with Be yourself. Love yourself.",
  },
];
