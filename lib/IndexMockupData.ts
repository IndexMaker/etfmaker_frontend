import CPU from "@/components/icons/cpu";
import USMap from "@/components/icons/us-map";

// Icon mapping
export const iconComponents = {
  Cpu: CPU,
  MapPin: USMap
};

export const indexData: any = {
  'SY100': {
    fundDetails: [
      { label: "Morningstar Category", value: "Large Growth" },
      { label: "Fund Inception", value: "12/31/1984" },
      {
        label: "Exp Ratio (Gross)",
        value: "0.73%",
        date: "09/28/2024",
        hasTooltip: true,
      },
      {
        label: "Exp Ratio (Net)",
        value: "0.73%",
        date: "09/28/2024",
        hasTooltip: true,
      },
      { label: "NAV", value: "$20.60", date: "06/02/2025", hasTooltip: true },
      { label: "Minimum to Invest", value: "$0.00" },
      {
        label: "Turnover Rate",
        value: "55.00%",
        date: "01/31/2025",
        hasTooltip: true,
      },
      {
        label: "Portfolio Net Assets ($M)",
        value: "$29,465.73",
        date: "05/31/2025",
        hasTooltip: true,
      },
      {
        label: "Share Class Net Assets ($M)",
        value: "$21,799.68",
        date: "05/31/2025",
        hasTooltip: true,
      },
      {
        label: "12 Month Low-High",
        value: "$16.90 - $24.02",
        date: "05/31/2025",
        hasTooltip: true,
      },
    ],
    fundManagerData: {
      manager: {
        name: "Christopher W. Lin",
        role: "Primary Manager",
        tenureStartDate: "09/16/2017",
        avatar: "/path/to/manager-avatar.jpg",
      },
      managedFunds: [
        {
          name: "VIP Balanced Portfolio - Investor Class",
          startDate: "12/05/2024",
        },
        {
          name: "Fidelity Advisor® Equity Growth Fund Class C",
          startDate: "04/11/2025",
        },
        { name: "VIP Growth Portfolio - Service Class 2", startDate: "04/11/2025" },
      ],
      commentaryLinks: [
        { title: "Quarterly Fund Review", url: "#" },
        { title: "Portfolio Manager Q&A", url: "#" },
        { title: "Investment Approach", url: "#" },
      ],
    },
    fundOverviewData: {
      asOfDate: "04/30/2025",
      topSector: {
        name: "Information Technology",
        iconName: "Cpu",
        weight: null
      },
      topCountry: {
        name: "United States",
        weight: "93.66%",
        iconName: "MapPin"
      },
      objective: "Seeks capital appreciation.",
      strategy: `Normally investing at least 80% of assets in securities principally traded on NASDAQ or an over-the-counter
      market, which has more small and medium-sized companies than other markets. Investing more than 25% of total
      assets in the technology sector. Investing in either "growth" stocks or "value" stocks or both. Normally
      investing primarily in common stocks.`,
      risk: `Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse
      issuer, political, regulatory, market, or economic developments. The technology industries can be
      significantly affected by obsolescence of existing technology, short product cycles, falling prices and
      profits, and competition from new market entrants and general economic conditions.`,
      disclosures: `This description is only intended to provide a brief overview of the mutual fund. Read the fund's prospectus
      for more detailed information about the fund.`
    },
    fundRisk: "Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse issuer, political, regulatory, market, or economic developments. The technology industries can be significantly affected by obsolescence of existing technology, short product cycles, falling prices and profits, and competition from new markets, and general economic conditions. Foreign securities are subject to ,interest rate, currency exchange rate, economic, and political risks. The securities of smaller, less well-known companies can be more volatile than those of larger companies. The fund may have additional ,volatility because it can invest a significant portion of assets in securities of a small number of individual issuers.",
    portfolioManagerInsights: [
      {
        id: 1,
        imageUrl: "chris-lin-bio",
        imageClassName: "w-full h-[100px] object-cover",
        title: "Breakthrough biotechs with a bright future",
        description: "Fidelity's Chris Lin considers two biotech companies well-positioned to revolutionize drug development and the treatment of major diseases.",
        isLink: true
      },
      {
        id: 2,
        imageUrl: "chris-lin",
        imageClassName: "w-[135px] h-[135px] object-cover",
        title: "AI-Revolutionary",
        description: "Fidelity U.S. large cap growth portfolio managers see artificial intelligence as the most compelling multiyear investment theme that is going to drive major disruption across a variety of businesses.",
        isLink: true
      }
    ],
    description: "The Spark DAI 1 vault curated by SparkDAO is intended to seamlessly allocate DAI liquidity from Maker to FundMaker markets."
  },
  'SYAZ': {
    fundDetails: [
      { label: "Morningstar Category", value: "Large Growth" },
      { label: "Fund Inception", value: "12/31/1984" },
      {
        label: "Exp Ratio (Gross)",
        value: "0.73%",
        date: "09/28/2024",
        hasTooltip: true,
      },
      {
        label: "Exp Ratio (Net)",
        value: "0.73%",
        date: "09/28/2024",
        hasTooltip: true,
      },
      { label: "NAV", value: "$20.60", date: "06/02/2025", hasTooltip: true },
      { label: "Minimum to Invest", value: "$0.00" },
      {
        label: "Turnover Rate",
        value: "55.00%",
        date: "01/31/2025",
        hasTooltip: true,
      },
      {
        label: "Portfolio Net Assets ($M)",
        value: "$29,465.73",
        date: "05/31/2025",
        hasTooltip: true,
      },
      {
        label: "Share Class Net Assets ($M)",
        value: "$21,799.68",
        date: "05/31/2025",
        hasTooltip: true,
      },
      {
        label: "12 Month Low-High",
        value: "$16.90 - $24.02",
        date: "05/31/2025",
        hasTooltip: true,
      },
    ],
    fundManagerData: {
      manager: {
        name: "Christopher W. Lin",
        role: "Primary Manager",
        tenureStartDate: "09/16/2017",
        avatar: "/path/to/manager-avatar.jpg",
      },
      managedFunds: [
        {
          name: "VIP Balanced Portfolio - Investor Class",
          startDate: "12/05/2024",
        },
        {
          name: "Fidelity Advisor® Equity Growth Fund Class C",
          startDate: "04/11/2025",
        },
        { name: "VIP Growth Portfolio - Service Class 2", startDate: "04/11/2025" },
      ],
      commentaryLinks: [
        { title: "Quarterly Fund Review", url: "#" },
        { title: "Portfolio Manager Q&A", url: "#" },
        { title: "Investment Approach", url: "#" },
      ],
    },
    fundOverviewData: {
      asOfDate: "04/30/2025",
      topSector: {
        name: "Information Technology",
        iconName: "Cpu",
        weight: null
      },
      topCountry: {
        name: "United States",
        weight: "93.66%",
        iconName: "MapPin"
      },
      objective: "Seeks capital appreciation.",
      strategy: `Normally investing at least 80% of assets in securities principally traded on NASDAQ or an over-the-counter
      market, which has more small and medium-sized companies than other markets. Investing more than 25% of total
      assets in the technology sector. Investing in either "growth" stocks or "value" stocks or both. Normally
      investing primarily in common stocks.`,
      risk: `Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse
      issuer, political, regulatory, market, or economic developments. The technology industries can be
      significantly affected by obsolescence of existing technology, short product cycles, falling prices and
      profits, and competition from new market entrants and general economic conditions.`,
      disclosures: `This description is only intended to provide a brief overview of the mutual fund. Read the fund's prospectus
      for more detailed information about the fund.`
    },
    fundRisk: "Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse issuer, political, regulatory, market, or economic developments...",
    portfolioManagerInsights: [
      {
        id: 1,
        imageUrl: "chris-lin-bio",
        imageClassName: "w-full h-[100px] object-cover",
        title: "Breakthrough biotechs with a bright future",
        description: "Fidelity's Chris Lin considers two biotech companies well-positioned to revolutionize drug development and the treatment of major diseases.",
        isLink: true
      },
      {
        id: 2,
        imageUrl: "chris-lin",
        imageClassName: "w-[135px] h-[135px] object-cover",
        title: "AI-Revolutionary",
        description: "Fidelity U.S. large cap growth portfolio managers see artificial intelligence as the most compelling multiyear investment theme that is going to drive major disruption across a variety of businesses.",
        isLink: true
      }
    ],
    description: "The Spark DAI 1 vault curated by SparkDAO is intended to seamlessly allocate DAI liquidity from Maker to FundMaker markets."
  },
  'SYAI': {
    fundDetails: [
      { label: "Morningstar Category", value: "Large Growth" },
      { label: "Fund Inception", value: "12/31/1984" },
      {
        label: "Exp Ratio (Gross)",
        value: "0.73%",
        date: "09/28/2024",
        hasTooltip: true,
      },
      {
        label: "Exp Ratio (Net)",
        value: "0.73%",
        date: "09/28/2024",
        hasTooltip: true,
      },
      { label: "NAV", value: "$20.60", date: "06/02/2025", hasTooltip: true },
      { label: "Minimum to Invest", value: "$0.00" },
      {
        label: "Turnover Rate",
        value: "55.00%",
        date: "01/31/2025",
        hasTooltip: true,
      },
      {
        label: "Portfolio Net Assets ($M)",
        value: "$29,465.73",
        date: "05/31/2025",
        hasTooltip: true,
      },
      {
        label: "Share Class Net Assets ($M)",
        value: "$21,799.68",
        date: "05/31/2025",
        hasTooltip: true,
      },
      {
        label: "12 Month Low-High",
        value: "$16.90 - $24.02",
        date: "05/31/2025",
        hasTooltip: true,
      },
    ],
    fundManagerData: {
      manager: {
        name: "Christopher W. Lin",
        role: "Primary Manager",
        tenureStartDate: "09/16/2017",
        avatar: "/path/to/manager-avatar.jpg",
      },
      managedFunds: [
        {
          name: "VIP Balanced Portfolio - Investor Class",
          startDate: "12/05/2024",
        },
        {
          name: "Fidelity Advisor® Equity Growth Fund Class C",
          startDate: "04/11/2025",
        },
        { name: "VIP Growth Portfolio - Service Class 2", startDate: "04/11/2025" },
      ],
      commentaryLinks: [
        { title: "Quarterly Fund Review", url: "#" },
        { title: "Portfolio Manager Q&A", url: "#" },
        { title: "Investment Approach", url: "#" },
      ],
    },
    fundOverviewData: {
      asOfDate: "04/30/2025",
      topSector: {
        name: "Information Technology",
        iconName: "Cpu",
        weight: null
      },
      topCountry: {
        name: "United States",
        weight: "93.66%",
        iconName: "MapPin"
      },
      objective: "Seeks capital appreciation.",
      strategy: `Normally investing at least 80% of assets in securities principally traded on NASDAQ or an over-the-counter
      market, which has more small and medium-sized companies than other markets. Investing more than 25% of total
      assets in the technology sector. Investing in either "growth" stocks or "value" stocks or both. Normally
      investing primarily in common stocks.`,
      risk: `Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse
      issuer, political, regulatory, market, or economic developments. The technology industries can be
      significantly affected by obsolescence of existing technology, short product cycles, falling prices and
      profits, and competition from new market entrants and general economic conditions.`,
      disclosures: `This description is only intended to provide a brief overview of the mutual fund. Read the fund's prospectus
      for more detailed information about the fund.`
    },
    fundRisk: "Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse issuer, political, regulatory, market, or economic developments...",
    portfolioManagerInsights: [
      {
        id: 1,
        imageUrl: "chris-lin-bio",
        imageClassName: "w-full h-[100px] object-cover",
        title: "Breakthrough biotechs with a bright future",
        description: "Fidelity's Chris Lin considers two biotech companies well-positioned to revolutionize drug development and the treatment of major diseases.",
        isLink: true
      },
      {
        id: 2,
        imageUrl: "chris-lin",
        imageClassName: "w-[135px] h-[135px] object-cover",
        title: "AI-Revolutionary",
        description: "Fidelity U.S. large cap growth portfolio managers see artificial intelligence as the most compelling multiyear investment theme that is going to drive major disruption across a variety of businesses.",
        isLink: true
      }
    ],
    description: "The Spark DAI 1 vault curated by SparkDAO is intended to seamlessly allocate DAI liquidity from Maker to FundMaker markets."
  },
  'SYME': {
    fundDetails: [
      { label: "Morningstar Category", value: "Large Growth" },
      { label: "Fund Inception", value: "12/31/1984" },
      {
        label: "Exp Ratio (Gross)",
        value: "0.73%",
        date: "09/28/2024",
        hasTooltip: true,
      },
      {
        label: "Exp Ratio (Net)",
        value: "0.73%",
        date: "09/28/2024",
        hasTooltip: true,
      },
      { label: "NAV", value: "$20.60", date: "06/02/2025", hasTooltip: true },
      { label: "Minimum to Invest", value: "$0.00" },
      {
        label: "Turnover Rate",
        value: "55.00%",
        date: "01/31/2025",
        hasTooltip: true,
      },
      {
        label: "Portfolio Net Assets ($M)",
        value: "$29,465.73",
        date: "05/31/2025",
        hasTooltip: true,
      },
      {
        label: "Share Class Net Assets ($M)",
        value: "$21,799.68",
        date: "05/31/2025",
        hasTooltip: true,
      },
      {
        label: "12 Month Low-High",
        value: "$16.90 - $24.02",
        date: "05/31/2025",
        hasTooltip: true,
      },
    ],
    fundManagerData: {
      manager: {
        name: "Christopher W. Lin",
        role: "Primary Manager",
        tenureStartDate: "09/16/2017",
        avatar: "/path/to/manager-avatar.jpg",
      },
      managedFunds: [
        {
          name: "VIP Balanced Portfolio - Investor Class",
          startDate: "12/05/2024",
        },
        {
          name: "Fidelity Advisor® Equity Growth Fund Class C",
          startDate: "04/11/2025",
        },
        { name: "VIP Growth Portfolio - Service Class 2", startDate: "04/11/2025" },
      ],
      commentaryLinks: [
        { title: "Quarterly Fund Review", url: "#" },
        { title: "Portfolio Manager Q&A", url: "#" },
        { title: "Investment Approach", url: "#" },
      ],
    },
    fundOverviewData: {
      asOfDate: "04/30/2025",
      topSector: {
        name: "Information Technology",
        iconName: "Cpu",
        weight: null
      },
      topCountry: {
        name: "United States",
        weight: "93.66%",
        iconName: "MapPin"
      },
      objective: "Seeks capital appreciation.",
      strategy: `Normally investing at least 80% of assets in securities principally traded on NASDAQ or an over-the-counter
      market, which has more small and medium-sized companies than other markets. Investing more than 25% of total
      assets in the technology sector. Investing in either "growth" stocks or "value" stocks or both. Normally
      investing primarily in common stocks.`,
      risk: `Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse
      issuer, political, regulatory, market, or economic developments. The technology industries can be
      significantly affected by obsolescence of existing technology, short product cycles, falling prices and
      profits, and competition from new market entrants and general economic conditions.`,
      disclosures: `This description is only intended to provide a brief overview of the mutual fund. Read the fund's prospectus
      for more detailed information about the fund.`
    },
    fundRisk: "Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse issuer, political, regulatory, market, or economic developments...",
    portfolioManagerInsights: [
      {
        id: 1,
        imageUrl: "chris-lin-bio",
        imageClassName: "w-full h-[100px] object-cover",
        title: "Breakthrough biotechs with a bright future",
        description: "Fidelity's Chris Lin considers two biotech companies well-positioned to revolutionize drug development and the treatment of major diseases.",
        isLink: true
      },
      {
        id: 2,
        imageUrl: "chris-lin",
        imageClassName: "w-[135px] h-[135px] object-cover",
        title: "AI-Revolutionary",
        description: "Fidelity U.S. large cap growth portfolio managers see artificial intelligence as the most compelling multiyear investment theme that is going to drive major disruption across a variety of businesses.",
        isLink: true
      }
    ],
    description: "The Spark DAI 1 vault curated by SparkDAO is intended to seamlessly allocate DAI liquidity from Maker to FundMaker markets."
  },
  'SYL2': {
    fundDetails: [
      { label: "Morningstar Category", value: "Large Growth" },
      { label: "Fund Inception", value: "12/31/1984" },
      {
        label: "Exp Ratio (Gross)",
        value: "0.73%",
        date: "09/28/2024",
        hasTooltip: true,
      },
      {
        label: "Exp Ratio (Net)",
        value: "0.73%",
        date: "09/28/2024",
        hasTooltip: true,
      },
      { label: "NAV", value: "$20.60", date: "06/02/2025", hasTooltip: true },
      { label: "Minimum to Invest", value: "$0.00" },
      {
        label: "Turnover Rate",
        value: "55.00%",
        date: "01/31/2025",
        hasTooltip: true,
      },
      {
        label: "Portfolio Net Assets ($M)",
        value: "$29,465.73",
        date: "05/31/2025",
        hasTooltip: true,
      },
      {
        label: "Share Class Net Assets ($M)",
        value: "$21,799.68",
        date: "05/31/2025",
        hasTooltip: true,
      },
      {
        label: "12 Month Low-High",
        value: "$16.90 - $24.02",
        date: "05/31/2025",
        hasTooltip: true,
      },
    ],
    fundManagerData: {
      manager: {
        name: "Christopher W. Lin",
        role: "Primary Manager",
        tenureStartDate: "09/16/2017",
        avatar: "/path/to/manager-avatar.jpg",
      },
      managedFunds: [
        {
          name: "VIP Balanced Portfolio - Investor Class",
          startDate: "12/05/2024",
        },
        {
          name: "Fidelity Advisor® Equity Growth Fund Class C",
          startDate: "04/11/2025",
        },
        { name: "VIP Growth Portfolio - Service Class 2", startDate: "04/11/2025" },
      ],
      commentaryLinks: [
        { title: "Quarterly Fund Review", url: "#" },
        { title: "Portfolio Manager Q&A", url: "#" },
        { title: "Investment Approach", url: "#" },
      ],
    },
    fundOverviewData: {
      asOfDate: "04/30/2025",
      topSector: {
        name: "Information Technology",
        iconName: "Cpu",
        weight: null
      },
      topCountry: {
        name: "United States",
        weight: "93.66%",
        iconName: "MapPin"
      },
      objective: "Seeks capital appreciation.",
      strategy: `Normally investing at least 80% of assets in securities principally traded on NASDAQ or an over-the-counter
      market, which has more small and medium-sized companies than other markets. Investing more than 25% of total
      assets in the technology sector. Investing in either "growth" stocks or "value" stocks or both. Normally
      investing primarily in common stocks.`,
      risk: `Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse
      issuer, political, regulatory, market, or economic developments. The technology industries can be
      significantly affected by obsolescence of existing technology, short product cycles, falling prices and
      profits, and competition from new market entrants and general economic conditions.`,
      disclosures: `This description is only intended to provide a brief overview of the mutual fund. Read the fund's prospectus
      for more detailed information about the fund.`
    },
    fundRisk: "Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse issuer, political, regulatory, market, or economic developments...",
    portfolioManagerInsights: [
      {
        id: 1,
        imageUrl: "chris-lin-bio",
        imageClassName: "w-full h-[100px] object-cover",
        title: "Breakthrough biotechs with a bright future",
        description: "Fidelity's Chris Lin considers two biotech companies well-positioned to revolutionize drug development and the treatment of major diseases.",
        isLink: true
      },
      {
        id: 2,
        imageUrl: "chris-lin",
        imageClassName: "w-[135px] h-[135px] object-cover",
        title: "AI-Revolutionary",
        description: "Fidelity U.S. large cap growth portfolio managers see artificial intelligence as the most compelling multiyear investment theme that is going to drive major disruption across a variety of businesses.",
        isLink: true
      }
    ],
    description: "The Spark DAI 1 vault curated by SparkDAO is intended to seamlessly allocate DAI liquidity from Maker to FundMaker markets."
  },
  'SYDF': {
    fundDetails: [
      { label: "Morningstar Category", value: "Large Growth" },
      { label: "Fund Inception", value: "12/31/1984" },
      {
        label: "Exp Ratio (Gross)",
        value: "0.73%",
        date: "09/28/2024",
        hasTooltip: true,
      },
      {
        label: "Exp Ratio (Net)",
        value: "0.73%",
        date: "09/28/2024",
        hasTooltip: true,
      },
      { label: "NAV", value: "$20.60", date: "06/02/2025", hasTooltip: true },
      { label: "Minimum to Invest", value: "$0.00" },
      {
        label: "Turnover Rate",
        value: "55.00%",
        date: "01/31/2025",
        hasTooltip: true,
      },
      {
        label: "Portfolio Net Assets ($M)",
        value: "$29,465.73",
        date: "05/31/2025",
        hasTooltip: true,
      },
      {
        label: "Share Class Net Assets ($M)",
        value: "$21,799.68",
        date: "05/31/2025",
        hasTooltip: true,
      },
      {
        label: "12 Month Low-High",
        value: "$16.90 - $24.02",
        date: "05/31/2025",
        hasTooltip: true,
      },
    ],
    fundManagerData: {
      manager: {
        name: "Christopher W. Lin",
        role: "Primary Manager",
        tenureStartDate: "09/16/2017",
        avatar: "/path/to/manager-avatar.jpg",
      },
      managedFunds: [
        {
          name: "VIP Balanced Portfolio - Investor Class",
          startDate: "12/05/2024",
        },
        {
          name: "Fidelity Advisor® Equity Growth Fund Class C",
          startDate: "04/11/2025",
        },
        { name: "VIP Growth Portfolio - Service Class 2", startDate: "04/11/2025" },
      ],
      commentaryLinks: [
        { title: "Quarterly Fund Review", url: "#" },
        { title: "Portfolio Manager Q&A", url: "#" },
        { title: "Investment Approach", url: "#" },
      ],
    },
    fundOverviewData: {
      asOfDate: "04/30/2025",
      topSector: {
        name: "Information Technology",
        iconName: "Cpu",
        weight: null
      },
      topCountry: {
        name: "United States",
        weight: "93.66%",
        iconName: "MapPin"
      },
      objective: "Seeks capital appreciation.",
      strategy: `Normally investing at least 80% of assets in securities principally traded on NASDAQ or an over-the-counter
      market, which has more small and medium-sized companies than other markets. Investing more than 25% of total
      assets in the technology sector. Investing in either "growth" stocks or "value" stocks or both. Normally
      investing primarily in common stocks.`,
      risk: `Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse
      issuer, political, regulatory, market, or economic developments. The technology industries can be
      significantly affected by obsolescence of existing technology, short product cycles, falling prices and
      profits, and competition from new market entrants and general economic conditions.`,
      disclosures: `This description is only intended to provide a brief overview of the mutual fund. Read the fund's prospectus
      for more detailed information about the fund.`
    },
    fundRisk: "Stock markets, especially foreign markets, are volatile and can decline significantly in response to adverse issuer, political, regulatory, market, or economic developments...",
    portfolioManagerInsights: [
      {
        id: 1,
        imageUrl: "chris-lin-bio",
        imageClassName: "w-full h-[100px] object-cover",
        title: "Breakthrough biotechs with a bright future",
        description: "Fidelity's Chris Lin considers two biotech companies well-positioned to revolutionize drug development and the treatment of major diseases.",
        isLink: true
      },
      {
        id: 2,
        imageUrl: "chris-lin",
        imageClassName: "w-[135px] h-[135px] object-cover",
        title: "AI-Revolutionary",
        description: "Fidelity U.S. large cap growth portfolio managers see artificial intelligence as the most compelling multiyear investment theme that is going to drive major disruption across a variety of businesses.",
        isLink: true
      }
    ],
    description: "The Spark DAI 1 vault curated by SparkDAO is intended to seamlessly allocate DAI liquidity from Maker to FundMaker markets."
  }
};

// Helper function to get data by index ID
export const getIndexData = (indexId: string) => {
  return indexData[indexId] || null;
};