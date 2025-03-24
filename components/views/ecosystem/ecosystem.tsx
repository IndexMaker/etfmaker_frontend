"use client";
import External from "@/components/icons/external";
import { Button } from "@/components/ui/button";
import Dashboard from "@/components/views/Dashboard/dashboard";

// Define the project data structure
interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Sample data for the ecosystem projects
const projects: Project[] = [
  {
    id: "aragon",
    name: "Aragon",
    description:
      "Building full-stack DAO technology, enabling organizations to govern their protocols and assets on-chain.",
    icon: "🔵",
  },
  {
    id: "brahma-console",
    name: "Brahma Console",
    description:
      "Console is your universal multi-chain account to secure, navigate, and automate on-chain interactions.",
    icon: "⬛",
  },
  {
    id: "contango",
    name: "Contango",
    description:
      "Trade decentralized perpetual futures by automated hedging strategies on underlying lending protocols.",
    icon: "⚪",
  },
  {
    id: "delv-fixed-borrow",
    name: "DELV Fixed Borrow",
    description:
      "DELV Fixed Borrow enables existing DeFi borrowers on Morpho to fix their interest rates and gain predictability on borrow costs.",
    icon: "‖",
  },
  {
    id: "defi-saver",
    name: "Defi Saver",
    description:
      "Advanced DeFi Management. All the essential tools for creating, tracking, and managing your DeFi portfolio.",
    icon: "⚪",
  },
  {
    id: "definitive",
    name: "Definitive",
    description:
      "A non-custodial platform for advanced on-chain trade execution and DeFi yield.",
    icon: "△",
  },
  {
    id: "furucombo",
    name: "Furucombo",
    description:
      "Furucombo is a multi-chain DeFi aggregator designed to simplify & optimize DeFi trading for everyone!",
    icon: "◻",
  },
  {
    id: "hyperdrive",
    name: "Hyperdrive",
    description:
      "Get yield, your way. Access fixed and variable yields at your control with Hyperdrive.",
    icon: "‖",
  },
  {
    id: "idle-finance",
    name: "Idle Finance",
    description:
      "Yield optimization and risk tranching. Automated, diversified, DeFi yields.",
    icon: "‖‖",
  },
  {
    id: "instadapp",
    name: "Instadapp",
    description:
      "The ultimate DeFi hub. Simplify your journey and enjoy a safer, more accessible experience.",
    icon: "◯",
  },
  {
    id: "ionic-protocol",
    name: "Ionic Protocol",
    description:
      "Isolated Lending and Borrowing for Yield Bearing Assets on the Superchain.",
    icon: "◯",
  },
  {
    id: "moonwell",
    name: "Moonwell",
    description:
      "Put your digital assets to work. Lend or borrow to handle whatever life throws your way.",
    icon: "( )",
  },
  {
    id: "opencover",
    name: "OpenCover",
    description:
      "The leading cover aggregator to protect your portfolio against protocol risk.",
    icon: "≡",
  },
  {
    id: "origami",
    name: "Origami",
    description: "Automated leverage for dummies.",
    icon: "◇",
  },
  {
    id: "oval",
    name: "Oval",
    description: "Capture OEV from liquidations.",
    icon: "—",
  },
  {
    id: "protocolink",
    name: "Protocolink",
    description: "Linking the potential of Web3 using the most elastic SDK.",
    icon: "✎",
  },
  {
    id: "reserve",
    name: "Reserve",
    description:
      "A permissionless platform to launch and govern R1 asset-backed currencies.",
    icon: "R",
  },
  {
    id: "safe",
    name: "Safe",
    description: "The most trusted Smart Wallet.",
    icon: "⊕",
  },
  {
    id: "sommelier-finance",
    name: "Sommelier Finance",
    description:
      "Automated vaults to find best-in-class yields while mitigating risk.",
    icon: "⊞",
  },
  {
    id: "stream",
    name: "Stream",
    description: "A capital-efficient platform to supercharge DeFi adoption.",
    icon: "👻",
  },
  {
    id: "summerfi",
    name: "SummerFi",
    description:
      "Power up your portfolio by Borrowing, Lending, and Multiplying your favorite assets using automated tools.",
    icon: "S",
  },
  {
    id: "superform",
    name: "Superform",
    description: "The Onchain Wealth App",
    icon: "✴",
  },
  {
    id: "vaultcraft",
    name: "VaultCraft",
    description:
      "Leading modular DeFi and RTCI vault protocol - now powered by Gnosis Safe.",
    icon: "◙",
  },
];

export function EcosystemPage() {
  return (
    <Dashboard>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Ecosystem</h1>
          <p className="text-muted-foreground mt-2">
            Projects building on Morpho
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </Dashboard>
  );
}

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-[#202426] rounded-lg p-5 relative group">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-100 rounded-full bg-[#fafafa1a] hover:bg-[fafafa20]"
      >
        <External className="h-[2px] w-[2px] text-white" />
        <span className="sr-only text-white">Visit {project.name}</span>
      </Button>

      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="bg-[#fafafa1a] w-12 h-12 rounded-full flex items-center justify-center text-xl">
            {project.icon}
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2 text-white">
          {project.name}
        </h3>
        <p className="text-sm text-muted-foreground">{project.description}</p>
      </div>
    </div>
  );
}
