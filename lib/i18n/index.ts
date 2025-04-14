// Define the supported languages
type Language = {
  code: string;
  name: string;
  flag: string;
};
export const languages: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];
export type TranslationKeys = {
  common: Record<string, string>;
  table: Record<string, string>;
  type: Record<string, string>;
  ecosystem: Record<string, string>;
};

type Translations = {
  en: TranslationKeys;
  es: TranslationKeys;
  fr: TranslationKeys;
  de: TranslationKeys;
  ru: TranslationKeys;
};
// Define the translations
export const translations: Translations = {
  en: {
    common: {
      earn: "Earn",
      ecosystem: "Ecosystem",
      analytics: "Analytics",
      fundmakerAppV2: "FundMaker App V2",
      delegate: "Delegate",
      fundmakerDocs: "FundMaker Docs",
      fundmakerOptimizers: "FundMaker Optimizers",
      feedback: "Feedback",
      termsOfUse: "Terms of Use",
      connectWallet: "Connect Wallet",
      disconnect: "Disconnect",
      searchVaults: "Search vaults...",
      searchProperties: "Search for properties...",
      editProperties: "Edit properties",
      myEarn: "My Earn",
      howDoesItWork: "How does it work?",
      depositInVault: "Deposit in a vault",
      totalDeposits: "Total Deposits",
      totalBorrow: "Total Borrow",
      projectsOnFundMaker: "Projects building on FundMaker",
      visit: "Visit",
      launchApp: "Launch App",
      overview: "Overview",
      fundmakerIntegration: "FundMaker integration",
      url: "URL",
      integrationDocs: "Integration Docs",
      social: "Social",
      docs: "Docs",
      totalFundMaker: "Total FundMaker",
      fundmakerMainnet: "FundMaker - Mainnet",
      fundmakerBase: "FundMaker - Base",
      fundmakerOptimizer: "FundMaker Optimizer",
      tvl: "TVL",
      marketsCreated: "Markets created",
      fundmakerVaults: "FundMaker Vaults",
      averageAPYImprovement: "Average APY Improvement",
      vaultInfo: "Vault Info",
      vaultAllocationBreakdown: "Vault Allocation Breakdown",
      vaultAllocationBreakdownNote:
        "The table below shows a breakdown of the market exposures of the vault. For example, the Supply APY represents the amount of interest earned by the vault for supplying liquidity to the market.",
      vaultReallocations: "Vault Reallocations",
      userActivity: "User Activity",
      supplyPositions: "Supply Positions",
      page: "Page",
      of: "of",
      proceed: "Proceed",
      howEarnWorks: "How Earn Works",
      depositInFundMakerVault: "Deposit in a FundMaker Vault",
      assetsAreSuppliedOnFundMaker: "Assets are supplied on FundMaker",
      earnYieldFromBorrowers: "Earn yield from borrowers",
      earnYieldByDepositingAssetIntoVault:
        "Earn yield by depositing an asset into a vault curated by third-party risk experts. Each vault has a unique risk profile and strategy determined by the curator. Creating FundMaker Vaults is permissionless, so users should assess a vault&apos;s curator and risk exposure before depositing.",
      fundmakerVaultAllocation:
        "A FundMaker Vault can only allocate deposits on FundMaker Markets primary listed by the curator. Depositors are exposed to risks related to the parameters of each market, including the collateral asset, liquidation LTV, and oracles.",
      vaultsGenerateYield:
        "Vaults generate a yield from over-collateralized lending. Borrowers deposit collateral and borrow liquidity from the underlying markets, paying interest to the vault.",
      fundmakerSecurityWithLinks:
        'FundMaker is committed to industry-leading security practices, but there are still risks associated with <a href="https://docs.morpho.org/morpho/concepts/risk-documentation" class="underline">FundMaker</a> and <a href="https://docs.morpho.org/morpho-vaults/concepts/risk-documentation" class="underline">FundMaker Vault</a>.',
      checkBoxConfirmationWithLink:
        'Check this box to confirm you have read the FundMaker <a href="https://cdn.morpho.org/documents/FundMaker_Terms_of_Use.pdf" class="underline">Terms of Use</a> and understand the associated risks.',
      claim: "Claim rewards",
      positions: "Positions",
      rewards: "Rewards",
      bundler: "Bundler",
      oneDayEarnAPY: "1D Earn APY",
      collateralExposure: "Collateral Exposure",
      cancel: "Cancel",
      finalizeTransactions: "Finalize Transactions",
      max: "Max",
      balance: "Balance",
      noClaimableRewards:
        "You currently have no claimable or accruing rewards on Ethereum.",
      noEarnPosition: "You currently have no Earn position on Ethereum.",
      switchWallet: "Switch Wallet",
      disconnectWallet: "Disconnect Wallet",
      switchWalletNetwork: "Switch wallet network",
      transactionConfrimTitle:
        "Are you sure you want to cancel your transactions?",
      noKeep: "No, keep",
      yesCancel: "Yes, cancel",
      insufficientValue: "You have an insufficient balance.",
      maxSupplyConfirmation: "You will not have ETH left to pay for gas.",
      iUnderstand: "I understand",
      undoMaxSupply: "Undo max supply",
    },
    table: {
      vaultName: "Vault Name",
      token: "Token",
      totalSupply: "Total Supply",
      netAPY: "Net APY",
      instantAPY: "Instant APY",
      supplyAPY: "Vault APY",
      curator: "Curator",
      collateral: "Collateral",
      rewards: "Rewards",
      performanceFee: "Performance Fee",
      utilization: "Utilization",
      vaultAddress: "Vault Address",
      liqudity: "Liquidity",
      guardianAddress: "Guardian Address",
      percentage: "Allocation %",
      dateTime: "Date & Time",
      wallet: "User",
      transactionType: "Transaction Type",
      amount: "Amount",
      vaultSupply: "Vault Supply",
      oracle: "Oracle",
      supplyCap: "Supply Cap",
      capPercentage: "Cap %",
      totalCollateral: "Total Collateral",
      rateAtUTarget: "Rate at uTarget",
      marketId: "Market ID",
      market: "Market",
      type: "Type",
      hash: "Hash",
      timestamp: "Timestamp",
      user: "User",
      supply: "Supply",
      share: "Share",
    },
    type: {
      all: "All Transaction Types",
      deposit: "Vault Deposit",
      withdraw: "Vault Withdraw",
      free: "Vault Free",
      transfer: "Vault Transfer",
    },
    ecosystem: {
      aragon:
        "Building full-stack DAO technology, enabling organizations to govern their protocols and assets on-chain.",
      "brahma-console":
        "Console is your universal multi-chain account to secure, navigate, and automate on-chain interactions.",
      contango:
        "Trade decentralized perpetual futures by automated hedging strategies on underlying lending protocols.",
      "delv-fixed-borrow":
        "DELV Fixed Borrow enables existing DeFi borrowers on FundMaker to fix their interest rates and gain predictability on borrow costs.",
      "defi-saver":
        "Advanced DeFi Management. All the essential tools for creating, tracking, and managing your DeFi portfolio.",
      definitive:
        "A non-custodial platform for advanced on-chain trade execution and DeFi yield.",
      furucombo:
        "Furucombo is a multi-chain DeFi aggregator designed to simplify & optimize DeFi trading for everyone!",
      hyperdrive:
        "Get yield, your way. Access fixed and variable yields at your control with Hyperdrive.",
      "idle-finance":
        "Yield optimization and risk tranching. Automated, diversified, DeFi yields.",
      instadapp:
        "The ultimate DeFi hub. Simplify your journey and enjoy a safer, more accessible experience.",
      "ionic-protocol":
        "Isolated Lending and Borrowing for Yield Bearing Assets on the Superchain.",
      moonwell:
        "Put your digital assets to work. Lend or borrow to handle whatever life throws your way.",
      origami: "Automated leverage for dummies.",
      oval: "Capture OEV from liquidations.",
      protocolink: "Linking the potential of Web3 using the most elastic SDK.",
      reserve:
        "A permissionless platform to launch and govern R1 asset-backed currencies.",
      safe: "The most trusted Smart Wallet.",
      "sommelier-finance":
        "Automated vaults to find best-in-class yields while mitigating risk.",
      stream: "A capital-efficient platform to supercharge DeFi adoption.",
      summerfi:
        "Power up your portfolio by Borrowing, Lending, and Multiplying your favorite assets using automated tools.",
      superform: "The Onchain Wealth App",
      vaultcraft:
        "Leading modular DeFi and RTCI vault protocol - now powered by Gnosis Safe.",
      opencover:
        "The leading cover aggregator to protect your portfolio against protocol risk.",
    },
  },
  es: {
    common: {
      earn: "Ganar",
      ecosystem: "Ecosistema",
      analytics: "Analítica",
      fundmakerAppV2: "FundMaker App V2",
      delegate: "Delegar",
      fundmakerDocs: "Documentos FundMaker",
      fundmakerOptimizers: "Optimizadores FundMaker",
      feedback: "Comentarios",
      termsOfUse: "Términos de Uso",
      connectWallet: "Conectar Billetera",
      disconnect: "Desconectar",
      searchVaults: "Buscar bóvedas...",
      searchProperties: "Buscar propiedades...",
      editProperties: "Editar propiedades",
      myEarn: "Mi Ganancia",
      howDoesItWork: "¿Cómo funciona?",
      depositInVault: "Depositar en bóveda",
      totalDeposits: "Depósitos Totales",
      totalBorrow: "Préstamo Total",
      projectsOnFundMaker: "Proyectos construyendo en FundMaker",
      visit: "Visitar",
      launchApp: "Iniciar App",
      overview: "Visión general",
      fundmakerIntegration: "Integración FundMaker",
      url: "URL",
      integrationDocs: "Documentos de Integración",
      social: "Social",
      docs: "Documentos",
      totalFundMaker: "FundMaker Total",
      fundmakerMainnet: "FundMaker - Red Principal",
      fundmakerBase: "FundMaker - Base",
      fundmakerOptimizer: "Optimizador FundMaker",
      tvl: "TVL",
      marketsCreated: "Mercados creados",
      fundmakerVaults: "Bóvedas FundMaker",
      averageAPYImprovement: "Mejora Promedio de APY",
      vaultInfo: "Información de Bóveda",
      vaultAllocationBreakdown: "Desglose de Asignación de Bóveda",
      vaultAllocationBreakdownNote:
        "La tabla a continuación muestra un desglose de las exposiciones al mercado de la bóveda. Por ejemplo, el APY de Suministro representa la cantidad de interés ganado por la bóveda por suministrar liquidez al mercado.",
      vaultReallocations: "Reasignaciones de Bóveda",
      page: "Página",
      of: "de",
      proceed: "Proceder",
      howEarnWorks: "Cómo funciona Earn",
      depositInFundMakerVault: "Depositar en un FundMaker Vault",
      assetsAreSuppliedOnFundMaker: "Los activos se suministran en FundMaker",
      earnYieldFromBorrowers: "Ganar rendimiento de los prestatarios",
      earnYieldByDepositingAssetIntoVault:
        "Ganar rendimiento depositando un activo en un vault curado por expertos en riesgos de terceros. Cada vault tiene un perfil de riesgo único y una estrategia determinada por el curador. Crear FundMaker Vaults es sin permisos, por lo que los usuarios deben evaluar al curador del vault y la exposición al riesgo antes de depositar.",
      fundmakerVaultAllocation:
        "Un FundMaker Vault solo puede asignar depósitos en los FundMaker Markets primarios listados por el curador. Los depositantes están expuestos a riesgos relacionados con los parámetros de cada mercado, incluyendo el activo colateral, el LTV de liquidación y los oráculos.",
      vaultsGenerateYield:
        "Los vaults generan rendimiento a partir de préstamos sobre-colateralizados. Los prestatarios depositan colateral y toman liquidez de los mercados subyacentes, pagando intereses al vault.",
      fundmakerSecurityWithLinks:
        'FundMaker está comprometido con las mejores prácticas de seguridad de la industria, pero aún existen riesgos asociados con <a href="https://docs.morpho.org/morpho/concepts/risk-documentation" class="underline">FundMaker</a> y <a href="https://docs.morpho.org/morpho-vaults/concepts/risk-documentation" class="underline">FundMaker Vault</a>.',
      checkBoxConfirmationWithLink:
        'Marque esta casilla para confirmar que ha leído los <a href="https://cdn.morpho.org/documents/FundMaker_Terms_of_Use.pdf" class="underline">Términos de Uso</a> de FundMaker y comprende los riesgos asociados.',
      claim: "Canjear recompensas",
      positions: "Posiciones",
      rewards: "Recompensas",
      bundler: "Agrupador",
      oneDayEarnAPY: "APY de ganancia 1D",
      collateralExposure: "Exposición colateral",
      cancel: "Cancelar",
      finalizeTransactions: "Finalizar transacciones",
      max: "Máx",
      balance: "Saldo",
      noClaimableRewards:
        "Actualmente no tienes recompensas reclamables o acumuladas en Ethereum.",
      noEarnPosition:
        "Actualmente no tienes ninguna posición Earn en Ethereum.",
      switchWallet: "Cambiar Cartera",
      disconnectWallet: "Desconectar Cartera",
      switchWalletNetwork: "Cambiar red de billetera",
      transactionConfrimTitle:
        "¿Estás seguro/a de que quieres cancelar tus transacciones?",
      noKeep: "No, conservar",
      yesCancel: "Sí, cancelar",
      insufficientValue: "No tiene saldo suficiente.",
      maxSupplyConfirmation: "No te quedará ETH para pagar el gas.",
      iUnderstand: "Entiendo",
      undoMaxSupply: "Deshacer máximo",
    },
    table: {
      vaultName: "Nombre de Bóveda",
      token: "Token",
      totalSupply: "Suministro Total",
      netAPY: "APY Neto",
      instantAPY: "APY Instantáneo",
      supplyAPY: "APY de Bóveda",
      curator: "Curador",
      collateral: "Colateral",
      rewards: "Recompensas",
      performanceFee: "Comisión de Rendimiento",
      utilization: "Utilización",
      vaultAddress: "Dirección de Bóveda",
      liquidity: "Liquidez",
      guardianAddress: "Dirección del Guardián",
      supplyPositions: "Posiciones de Suministro",
      userActivity: "Actividad del Usuario",
      percentage: "Asignación %",
      dateTime: "Fecha y Hora",
      wallet: "Usuario",
      transactionType: "Tipo de Transacción",
      amount: "Cantidad",
      vaultSupply: "Suministro de Bóveda",
      oracle: "Oráculo",
      supplyCap: "Límite de suministro",
      capPercentage: "Porcentaje de límite",
      totalCollateral: "Colateral total",
      rateAtUTarget: "Tasa en uTarget",
      marketId: "ID de mercado",
      market: "Mercado",
      type: "Tipo",
      hash: "Hash",
      timestamp: "Marca de tiempo",
      user: "Usuario",
      supply: "Suministro",
      share: "Compartir",
    },
    type: {
      all: "Todos los tipos de transacción",
      deposit: "Depósito de Bóveda",
      withdraw: "Retiro de Bóveda",
      free: "Bóveda Libre",
      transfer: "Transferencia de Bóveda",
    },
    ecosystem: {
      aragon:
        "Construyendo tecnología DAO de pila completa, permitiendo a las organizaciones gobernar sus protocolos y activos en la cadena.",
      "brahma-console":
        "Console es tu cuenta universal multi-cadena para asegurar, navegar y automatizar interacciones en la cadena.",
      contango:
        "Opera futuros perpetuos descentralizados mediante estrategias de cobertura automatizadas sobre protocolos de préstamos subyacentes.",
      "delv-fixed-borrow":
        "DELV Fixed Borrow permite a los prestatarios DeFi existentes en FundMaker fijar sus tasas de interés y obtener previsibilidad en los costos de los préstamos.",
      "defi-saver":
        "Gestión avanzada de DeFi. Todas las herramientas esenciales para crear, rastrear y gestionar tu portafolio DeFi.",
      definitive:
        "Una plataforma no custodial para la ejecución avanzada de operaciones en la cadena y rendimientos DeFi.",
      furucombo:
        "Furucombo es un agregador DeFi multi-cadena diseñado para simplificar y optimizar el comercio DeFi para todos.",
      hyperdrive:
        "Obtén rendimiento, a tu manera. Accede a rendimientos fijos y variables bajo tu control con Hyperdrive.",
      "idle-finance":
        "Optimización de rendimiento y tranching de riesgo. Rendimientos DeFi automatizados y diversificados.",
      instadapp:
        "El centro DeFi definitivo. Simplifica tu viaje y disfruta de una experiencia más segura y accesible.",
      "ionic-protocol":
        "Préstamos y préstamos aislados para activos generadores de rendimiento en la supercadena.",
      moonwell:
        "Pon tus activos digitales a trabajar. Presta o pide prestado para manejar lo que sea que la vida te depare.",
      origami: "Apalancamiento automatizado para principiantes.",
      oval: "Captura OEV de las liquidaciones.",
      protocolink:
        "Vinculando el potencial de Web3 usando el SDK más elástico.",
      reserve:
        "Una plataforma sin permisos para lanzar y gobernar monedas respaldadas por activos R1.",
      safe: "La billetera inteligente más confiable.",
      "sommelier-finance":
        "Bóvedas automatizadas para encontrar los mejores rendimientos mientras se mitiga el riesgo.",
      stream:
        "Una plataforma eficiente en capital para impulsar la adopción de DeFi.",
      summerfi:
        "Impulsa tu portafolio prestando, pidiendo prestado y multiplicando tus activos favoritos utilizando herramientas automatizadas.",
      superform: "La aplicación de riqueza en cadena",
      vaultcraft:
        "Protocolo modular líder de DeFi y RTCI Vault - ahora potenciado por Gnosis Safe.",
      opencover:
        "El principal agregador de coberturas para proteger tu portafolio contra riesgos de protocolo.",
    },
  },
  fr: {
    common: {
      earn: "Gagner",
      ecosystem: "Écosystème",
      analytics: "Analytique",
      fundmakerAppV2: "FundMaker App V2",
      delegate: "Déléguer",
      fundmakerDocs: "Docs FundMaker",
      fundmakerOptimizers: "Optimiseurs FundMaker",
      feedback: "Retour",
      termsOfUse: "Conditions d'Utilisation",
      connectWallet: "Connecter Portefeuille",
      disconnect: "Déconnecter",
      searchVaults: "Rechercher coffres...",
      searchProperties: "Rechercher des propriétés...",
      editProperties: "Modifier propriétés",
      myEarn: "Mon Gain",
      howDoesItWork: "Comment ça marche?",
      depositInVault: "Déposer dans un coffre",
      totalDeposits: "Dépôts Totaux",
      totalBorrow: "Emprunt Total",
      projectsOnFundMaker: "Projets construisant sur FundMaker",
      visit: "Visiter",
      launchApp: "Lancer App",
      overview: "Aperçu",
      fundmakerIntegration: "Intégration FundMaker",
      url: "URL",
      integrationDocs: "Docs d'Intégration",
      social: "Social",
      docs: "Docs",
      totalFundMaker: "FundMaker Total",
      fundmakerMainnet: "FundMaker - Réseau Principal",
      fundmakerBase: "FundMaker - Base",
      fundmakerOptimizer: "Optimiseur FundMaker",
      tvl: "TVL",
      marketsCreated: "Marchés créés",
      fundmakerVaults: "Coffres FundMaker",
      averageAPYImprovement: "Amélioration Moyenne d'APY",
      vaultInfo: "Informations du Coffre",
      vaultAllocationBreakdown: "Répartition de l'Allocation du Coffre",
      vaultAllocationBreakdownNote:
        "Le tableau ci-dessous montre une répartition des expositions du marché du coffre. Par exemple, l'APY de Fourniture représente le montant des intérêts gagnés par le coffre pour fournir de la liquidité au marché.",
      vaultReallocations: "Réaffectations du Coffre",
      supplyPositions: "Positions de Fourniture",
      userActivity: "Activité de l'Utilisateur",
      page: "Page",
      of: "de",
      proceed: "Procéder",
      howEarnWorks: "Comment Earn fonctionne",
      depositInFundMakerVault: "Déposer dans un FundMaker Vault",
      assetsAreSuppliedOnFundMaker: "Les actifs sont fournis sur FundMaker",
      earnYieldFromBorrowers: "Gagner des rendements des emprunteurs",
      earnYieldByDepositingAssetIntoVault:
        "Gagner des rendements en déposant un actif dans un coffre-fort curé par des experts en risques tiers. Chaque coffre-fort a un profil de risque unique et une stratégie déterminée par le curateur. La création de FundMaker Vaults est sans autorisation, de sorte que les utilisateurs doivent évaluer le curateur du coffre-fort et l'exposition au risque avant de déposer.",
      fundmakerVaultAllocation:
        "Un FundMaker Vault ne peut allouer des dépôts que sur les FundMaker Markets primaires listés par le curateur. Les déposants sont exposés à des risques liés aux paramètres de chaque marché, y compris l'actif collatéral, le LTV de liquidation et les oracles.",
      vaultsGenerateYield:
        "Les coffres génèrent des rendements à partir de prêts sur-collatéralisés. Les emprunteurs déposent des collatéraux et empruntent de la liquidité sur les marchés sous-jacents, payant des intérêts au coffre.",
      fundmakerSecurityWithLinks:
        'FundMaker s\'engage à respecter les meilleures pratiques de sécurité de l\'industrie, mais il existe encore des risques associés à <a href="https://docs.morpho.org/morpho/concepts/risk-documentation" class="underline">FundMaker</a> et <a href="https://docs.morpho.org/morpho-vaults/concepts/risk-documentation" class="underline">FundMaker Vault</a>.',
      checkBoxConfirmationWithLink:
        'Cochez cette case pour confirmer que vous avez lu les <a href="https://cdn.morpho.org/documents/FundMaker_Terms_of_Use.pdf" class="underline">Conditions d\'utilisation</a> de FundMaker et que vous comprenez les risques associés.',
      claim: "Recevoir les récompenses",
      positions: "Positions",
      rewards: "Récompenses",
      finalizeTransactions: "Finaliser les transactions",
      cancel: "Annuler",
      collateralExposure: "Exposition collatérale",
      oneDayEarnAPY: "APY de gain 1J",
      bundler: "Regroupeur",
      max: "Max",
      balance: "Solde",
      noEarnPosition:
        "Vous n'avez actuellement aucune position Earn sur Ethereum.",
      noClaimableRewards:
        "Vous n'avez actuellement aucune récompense réclamable ou accumulée sur Ethereum.",
      switchWallet: "Changer de Portefeuille",
      disconnectWallet: "Déconnecter le Portefeuille",
      switchWalletNetwork: "Changer de réseau de portefeuille",
      transactionConfrimTitle:
        "Êtes-vous sûr(e) de vouloir annuler vos transactions?",
      noKeep: "Non, garder",
      yesCancel: "Oui, annuler",
      insufficientValue: "Vous n'avez pas assez de solde.",
      maxSupplyConfirmation: "Il ne vous restera plus d'ETH pour payer le gas.",
      iUnderstand: "Je comprends",
      undoMaxSupply: "Annuler le max",
    },
    table: {
      vaultName: "Nom du Coffre",
      token: "Jeton",
      totalSupply: "Offre Totale",
      netAPY: "APY Net",
      instantAPY: "APY Instantané",
      supplyAPY: "APY du Coffre",
      curator: "Curateur",
      collateral: "Collatéral",
      rewards: "Récompenses",
      performanceFee: "Frais de Performance",
      utilization: "Utilisation",
      vaultAddress: "Adresse du Coffre",
      liquidity: "Liquidité",
      guardianAddress: "Adresse du Gardien",
      percentage: "Allocation %",
      dateTime: "Date et Heure",
      wallet: "Utilisateur",
      transactionType: "Type de Transaction",
      amount: "Montant",
      vaultSupply: "Approvisionnement du Coffre",
      oracle: "Oracle",
      supplyCap: "Plafond d'approvisionnement",
      totalCollateral: "Collatéral total",
      rateAtUTarget: "Taux à uTarget",
      marketId: "ID du marché",
      market: "Marché",
      type: "Type",
      hash: "Hash",
      timestamp: "Horodatage",
      user: "Utilisateur",
      supply: "Approvisionnement",
      share: "Partager",
    },
    type: {
      all: "Tous les types de transactions",
      deposit: "Dépôt de Coffre",
      withdraw: "Retrait de Coffre",
      free: "Coffre Libre",
      transfer: "Transfert de Coffre",
    },
    ecosystem: {
      aragon:
        "Construction de la technologie DAO full-stack, permettant aux organisations de gouverner leurs protocoles et actifs sur la blockchain.",
      "brahma-console":
        "Console est votre compte universel multi-chaînes pour sécuriser, naviguer et automatiser les interactions sur la blockchain.",
      contango:
        "Échangez des contrats à terme perpétuels décentralisés grâce à des stratégies de couverture automatisées sur les protocoles de prêt sous-jacents.",
      "delv-fixed-borrow":
        "DELV Fixed Borrow permet aux emprunteurs DeFi existants sur FundMaker de fixer leurs taux d'intérêt et d'obtenir une prévisibilité des coûts d'emprunt.",
      "defi-saver":
        "Gestion avancée de DeFi. Tous les outils essentiels pour créer, suivre et gérer votre portefeuille DeFi.",
      definitive:
        "Une plateforme non-custodienne pour l'exécution avancée des transactions sur la blockchain et les rendements DeFi.",
      furucombo:
        "Furucombo est un agrégateur DeFi multi-chaînes conçu pour simplifier et optimiser le trading DeFi pour tout le monde !",
      hyperdrive:
        "Obtenez du rendement, à votre façon. Accédez à des rendements fixes et variables sous votre contrôle avec Hyperdrive.",
      "idle-finance":
        "Optimisation des rendements et tranche de risque. Rendements DeFi automatisés et diversifiés.",
      instadapp:
        "Le centre DeFi ultime. Simplifiez votre parcours et profitez d'une expérience plus sûre et plus accessible.",
      "ionic-protocol":
        "Prêts et emprunts isolés pour des actifs générateurs de rendement sur la Superchaine.",
      moonwell:
        "Mettez vos actifs numériques au travail. Prêtez ou empruntez pour gérer ce que la vie vous réserve.",
      origami: "Levier automatisé pour les débutants.",
      oval: "Capturez OEV lors des liquidations.",
      protocolink: "Relier le potentiel de Web3 avec le SDK le plus élastique.",
      reserve:
        "Une plateforme sans autorisation pour lancer et gouverner des monnaies adossées à des actifs R1.",
      safe: "Le portefeuille intelligent le plus fiable.",
      "sommelier-finance":
        "Coffres automatisés pour trouver les rendements de classe mondiale tout en atténuant les risques.",
      stream:
        "Une plateforme efficace en capital pour accélérer l'adoption de DeFi.",
      summerfi:
        "Boostez votre portefeuille en empruntant, prêtant et multipliant vos actifs préférés à l'aide d'outils automatisés.",
      superform: "L'application de richesse en chaîne",
      vaultcraft:
        "Le principal protocole de coffre modulaire DeFi et RTCI - maintenant alimenté par Gnosis Safe.",
      opencover:
        "Le principal agrégateur de couverture pour protéger votre portefeuille contre les risques de protocole.",
    },
  },
  de: {
    common: {
      earn: "Verdienen",
      ecosystem: "Ökosystem",
      analytics: "Analytik",
      fundmakerAppV2: "FundMaker App V2",
      delegate: "Delegieren",
      fundmakerDocs: "FundMaker Dokumente",
      fundmakerOptimizers: "FundMaker Optimierer",
      feedback: "Feedback",
      termsOfUse: "Nutzungsbedingungen",
      connectWallet: "Wallet verbinden",
      disconnect: "Trennen",
      searchVaults: "Tresore suchen...",
      searchProperties: "Eigenschaften suchen...",
      editProperties: "Eigenschaften bearbeiten",
      myEarn: "Mein Verdienst",
      howDoesItWork: "Wie funktioniert es?",
      depositInVault: "In Tresor einzahlen",
      totalDeposits: "Gesamteinlagen",
      totalBorrow: "Gesamtausleihe",
      projectsOnFundMaker: "Projekte auf FundMaker",
      visit: "Besuchen",
      launchApp: "App starten",
      overview: "Überblick",
      fundmakerIntegration: "FundMaker Integration",
      url: "URL",
      integrationDocs: "Integrationsdokumente",
      social: "Sozial",
      docs: "Dokumente",
      totalFundMaker: "Gesamt FundMaker",
      fundmakerMainnet: "FundMaker - Hauptnetz",
      fundmakerBase: "FundMaker - Basis",
      fundmakerOptimizer: "FundMaker Optimierer",
      tvl: "TVL",
      marketsCreated: "Erstellte Märkte",
      fundmakerVaults: "FundMaker Tresore",
      averageAPYImprovement: "Durchschnittliche APY-Verbesserung",
      vaultInfo: "Tresor-Informationen",
      vaultAllocationBreakdown: "Aufschlüsselung der Tresorzuteilung",
      vaultAllocationBreakdownNote:
        "Die folgende Tabelle zeigt eine Aufschlüsselung der Marktexpositionen des Tresors. Zum Beispiel stellt das Supply-APY den Betrag der Zinsen dar, die der Tresor durch die Bereitstellung von Liquidität für den Markt verdient.",
      vaultReallocations: "Tresor-Neuverteilungen",
      supplyPositions: "Versorgungspositionen",
      userActivity: "Nutzeraktivität",
      page: "Seite",
      of: "von",
      proceed: "Fortfahren",
      howEarnWorks: "Wie Earn funktioniert",
      depositInFundMakerVault: "Einzahlen in ein FundMaker Vault",
      assetsAreSuppliedOnFundMaker:
        "Vermögenswerte werden auf FundMaker bereitgestellt",
      earnYieldFromBorrowers: "Erhalten Sie Erträge von den Kreditnehmern",
      earnYieldByDepositingAssetIntoVault:
        "Erzielen Sie Erträge, indem Sie ein Vermögen in ein Vault einzahlen, das von Drittanbieter-Risikoexperten kuratiert wird. Jedes Vault hat ein einzigartiges Risikoprofil und eine Strategie, die vom Kurator bestimmt wird. Das Erstellen von FundMaker Vaults ist ohne Berechtigungen, daher sollten Benutzer den Kurator eines Vaults und die Risikobelastung vor der Einzahlung bewerten.",
      fundmakerVaultAllocation:
        "Ein FundMaker Vault kann Einlagen nur auf den von den Kuratoren primär aufgelisteten FundMaker Markets zuweisen. Einzahler sind Risiken ausgesetzt, die mit den Parametern jedes Marktes verbunden sind, einschließlich des Sicherheitenassets, der Liquidations-LTV und der Orakel.",
      vaultsGenerateYield:
        "Vaults generieren Erträge aus überbesicherten Krediten. Kreditnehmer hinterlegen Sicherheiten und leihen Liquidität von den zugrunde liegenden Märkten, wobei sie Zinsen an das Vault zahlen.",
      fundmakerSecurityWithLinks:
        'FundMaker verpflichtet sich zu branchenführenden Sicherheitspraktiken, aber es bestehen weiterhin Risiken im Zusammenhang mit <a href="https://docs.morpho.org/morpho/concepts/risk-documentation" class="underline">FundMaker</a> und <a href="https://docs.morpho.org/morpho-vaults/concepts/risk-documentation" class="underline">FundMaker Vault</a>.',
      checkBoxConfirmationWithLink:
        'Markieren Sie dieses Feld, um zu bestätigen, dass Sie die <a href="https://cdn.morpho.org/documents/FundMaker_Terms_of_Use.pdf" class="underline">Nutzungsbedingungen</a> von FundMaker gelesen haben und die damit verbundenen Risiken verstehen.',
      claim: "Prämien einfordern",
      positions: "Positionen",
      rewards: "Belohnungen",
      bundler: "Bündler",
      cancel: "Abbrechen",
      oneDayEarnAPY: "1T Verdienen APY",
      collateralExposure: "Besicherungsrisiko",
      finalizeTransactions: "Transaktionen abschließen",
      max: "Max",
      balance: "Kontostand",
      noEarnPosition: "Sie haben derzeit keine Earn-Position auf Ethereum.",
      noClaimableRewards:
        "Sie haben derzeit keine einlösbaren oder anfallenden Belohnungen auf Ethereum.",
      switchWallet: "Wallet wechseln",
      disconnectWallet: "Wallet trennen",
      switchWalletNetwork: "Wallet-Netzwerk wechseln",
      transactionConfrimTitle:
        "Sind Sie sicher, dass Sie Ihre Transaktionen stornieren möchten?",
      noKeep: "Nein, beibehalten",
      yesCancel: "Ja, abbrechen",
      insufficientValue: "Sie haben nicht genug Guthaben.",
      maxSupplyConfirmation:
        "Sie werden kein ETH mehr übrig haben, um Gas zu bezahlen.",
      iUnderstand: "Ich verstehe",
      undoMaxSupply: "Maximalbetrag rückgängig machen",
    },
    table: {
      vaultName: "Tresorname",
      token: "Token",
      totalSupply: "Gesamtangebot",
      netAPY: "Netto-APY",
      instantAPY: "Sofort-APY",
      supplyAPY: "Tresor-APY",
      curator: "Kurator",
      collateral: "Sicherheit",
      rewards: "Belohnungen",
      performanceFee: "Leistungsgebühr",
      utilization: "Auslastung",
      vaultAddress: "Tresor-Adresse",
      liquidity: "Liquidität",
      guardianAddress: "Wächter-Adresse",
      percentage: "Zuteilung %",
      dateTime: "Datum & Uhrzeit",
      wallet: "Benutzer",
      transactionType: "Transaktionstyp",
      amount: "Betrag",
      vaultSupply: "Tresorangebot",
      oracle: "Oracle",
      supplyCap: "Versorgungshöchstgrenze",
      totalCollateral: "Gesamtsicherheit",
      rateAtUTarget: "Rate bei uTarget",
      marketId: "Markt-ID",
      market: "Markt",
      type: "Typ",
      hash: "Hash",
      timestamp: "Zeitstempel",
      user: "Benutzer",
      supply: "Versorgung",
      share: "Teilen",
    },
    type: {
      all: "Alle Transaktionsarten",
      deposit: "Tresor Einzahlung",
      withdraw: "Tresor Abhebung",
      free: "Tresor Frei",
      transfer: "Tresor Transfer",
    },
    ecosystem: {
      aragon:
        "Vollständige DAO-Technologie aufbauen, die es Organisationen ermöglicht, ihre Protokolle und Vermögenswerte on-chain zu verwalten.",
      "brahma-console":
        "Console ist dein universelles Multi-Chain-Konto, um on-chain Interaktionen zu sichern, zu navigieren und zu automatisieren.",
      contango:
        "Dezentralisierte perpetual Futures handeln durch automatisierte Absicherungsstrategien auf zugrunde liegenden Kreditprotokollen.",
      "delv-fixed-borrow":
        "DELV Fixed Borrow ermöglicht bestehenden DeFi-Kreditnehmern auf FundMaker, ihre Zinssätze festzulegen und Vorhersehbarkeit bei den Kreditkosten zu gewinnen.",
      "defi-saver":
        "Fortgeschrittene DeFi-Verwaltung. Alle wichtigen Werkzeuge zum Erstellen, Verfolgen und Verwalten deines DeFi-Portfolios.",
      definitive:
        "Eine nicht-hütscher Plattform für die fortgeschrittene Ausführung von On-Chain-Transaktionen und DeFi-Renditen.",
      furucombo:
        "Furucombo ist ein Multi-Chain DeFi-Aggregator, der entwickelt wurde, um den DeFi-Handel für alle zu vereinfachen und zu optimieren!",
      hyperdrive:
        "Erhalte Rendite, auf deine Weise. Greife auf feste und variable Renditen nach deinem Ermessen zu, mit Hyperdrive.",
      "idle-finance":
        "Rendite-Optimierung und Risiko-Tranchierung. Automatisierte, diversifizierte DeFi-Renditen.",
      instadapp:
        "Das ultimative DeFi-Zentrum. Vereinfache deine Reise und genieße eine sicherere, zugänglichere Erfahrung.",
      "ionic-protocol":
        "Isoliertes Verleihen und Ausleihen von renditebringenden Assets auf der Superchain.",
      moonwell:
        "Setze deine digitalen Assets für dich ein. Verleihe oder leihe, um mit allem klarzukommen, was das Leben dir bringt.",
      origami: "Automatisiertes Hebeln für Anfänger.",
      oval: "Erfasse OEV aus Liquidationen.",
      protocolink:
        "Verknüpfe das Potenzial von Web3 mit dem elastischsten SDK.",
      reserve:
        "Eine genehmigungsfreie Plattform, um R1-asset-unterstützte Währungen zu starten und zu regieren.",
      safe: "Die vertrauenswürdigste Smart Wallet.",
      "sommelier-finance":
        "Automatisierte Vaults, um die besten Renditen zu finden und gleichzeitig das Risiko zu minimieren.",
      stream:
        "Eine kapital-effiziente Plattform zur Beschleunigung der DeFi-Adoption.",
      summerfi:
        "Bringe dein Portfolio auf Touren, indem du deine bevorzugten Assets mit automatisierten Tools ausleihst, verleihst und vervielfachst.",
      superform: "Die Onchain Wealth App",
      vaultcraft:
        "Führendes modulares DeFi- und RTCI-Vault-Protokoll – jetzt powered by Gnosis Safe.",
      opencover:
        "Der führende Cover-Aggregator zum Schutz deines Portfolios vor Protokollrisiken.",
    },
  },
  ru: {
    common: {
      earn: "Заработать",
      ecosystem: "Экосистема",
      analytics: "Аналитика",
      fundmakerAppV2: "FundMaker App V2",
      delegate: "Делегировать",
      fundmakerDocs: "Документы FundMaker",
      fundmakerOptimizers: "Оптимизаторы FundMaker",
      feedback: "Обратная связь",
      termsOfUse: "Условия использования",
      connectWallet: "Подключить кошелек",
      disconnect: "Отключить",
      searchVaults: "Поиск хранилищ...",
      searchProperties: "Поиск свойств...",
      editProperties: "Редактировать свойства",
      myEarn: "Мой Заработок",
      howDoesItWork: "Как это работает?",
      depositInVault: "Депозит в хранилище",
      totalDeposits: "Всего депозитов",
      totalBorrow: "Всего заимствований",
      projectsOnFundMaker: "Проекты на FundMaker",
      visit: "Посетить",
      launchApp: "Запустить приложение",
      overview: "Обзор",
      fundmakerIntegration: "Интеграция FundMaker",
      url: "URL",
      integrationDocs: "Документы по интеграции",
      social: "Социальные сети",
      docs: "Документы",
      totalFundMaker: "Всего FundMaker",
      fundmakerMainnet: "FundMaker - Основная сеть",
      fundmakerBase: "FundMaker - База",
      fundmakerOptimizer: "Оптимизатор FundMaker",
      tvl: "TVL",
      marketsCreated: "Созданные рынки",
      fundmakerVaults: "Хранилища FundMaker",
      averageAPYImprovement: "Среднее улучшение APY",
      vaultInfo: "Информация о хранилище",
      vaultAllocationBreakdown: "Разбивка распределения хранилища",
      vaultAllocationBreakdownNote:
        "Таблица ниже показывает распределение рыночных рисков хранилища. Например, APY от предоставления показывает сумму процентов, полученную хранилищем за предоставление ликвидности на рынок.",
      vaultReallocations: "Перераспределения хранилища",
      supplyPositions: "Позиции по поставке",
      userActivity: "Деятельность пользователя",
      page: "Страница",
      of: "из",
      proceed: "Продолжить",
      howEarnWorks: "Как работает Earn",
      depositInFundMakerVault: "Внести в FundMaker Vault",
      assetsAreSuppliedOnFundMaker: "Активы предоставляются на FundMaker",
      earnYieldFromBorrowers: "Зарабатывайте доход от заемщиков",
      earnYieldByDepositingAssetIntoVault:
        "Зарабатывайте доход, вкладывая актив в хранилище, курируемое экспертами по рискам третьих сторон. Каждое хранилище имеет уникальный профиль рисков и стратегию, определенную куратором. Создание FundMaker Vaults не требует разрешений, поэтому пользователи должны оценить куратора хранилища и его риски перед внесением депозита.",
      fundmakerVaultAllocation:
        "FundMaker Vault может выделять депозиты только на FundMaker Markets, первично указанных куратором. Депозиторы подвержены рискам, связанным с параметрами каждого рынка, включая активы залога, LTV ликвидации и оракулы.",
      vaultsGenerateYield:
        "Vaults генерируют доход от избыточно обеспеченного кредитования. Заемщики вносят залог и занимают ликвидность на подлежащих рынках, выплачивая проценты в хранилище.",
      fundmakerSecurityWithLinks:
        'FundMaker стремится к соблюдению передовых практик безопасности в отрасли, но все равно существуют риски, связанные с <a href="https://docs.morpho.org/morpho/concepts/risk-documentation" class="underline">FundMaker</a> и <a href="https://docs.morpho.org/morpho-vaults/concepts/risk-documentation" class="underline">FundMaker Vault</a>.',
      checkBoxConfirmationWithLink:
        'Отметьте это поле, чтобы подтвердить, что вы прочитали <a href="https://cdn.morpho.org/documents/FundMaker_Terms_of_Use.pdf" class="underline">Условия использования</a> FundMaker и понимаете связанные с этим риски.',
      claim: "Забрать награды",
      positions: "Позиции",
      rewards: "Награды",
      max: "Макс",
      finalizeTransactions: "Завершить транзакции",
      cancel: "Отмена",
      collateralExposure: "Залоговая экспозиция",
      oneDayEarnAPY: "APY дохода за 1 день",
      bundler: "Упаковщик",
      balance: "Баланс",
      noClaimableRewards:
        "В настоящее время у вас нет доступных для получения или начисляемых наград в Ethereum.",
      noEarnPosition: "В настоящее время у вас нет позиции Earn на Ethereum.",
      switchWallet: "Сменить кошелек",
      disconnectWallet: "Отключить кошелек",
      switchWalletNetwork: "Сменить сеть кошелька",
      transactionConfrimTitle:
        "Вы уверены, что хотите отменить свои транзакции?",
      noKeep: "Нет, сохранить",
      yesCancel: "Да, отменить",
      insufficientValue: "У вас недостаточно средств.",
      maxSupplyConfirmation: "У вас не останется ETH для оплаты газа.",
      iUnderstand: "Я понимаю",
      undoMaxSupply: "Отменить максимум",
    },
    table: {
      vaultName: "Название хранилища",
      token: "Токен",
      totalSupply: "Общее предложение",
      netAPY: "Чистый APY",
      instantAPY: "Мгновенный APY",
      supplyAPY: "APY хранилища",
      curator: "Куратор",
      collateral: "Обеспечение",
      rewards: "Награды",
      performanceFee: "Комиссия за производительность",
      utilization: "Использование",
      vaultAddress: "Адрес хранилища",
      liquidity: "Ликвидность",
      guardianAddress: "Адрес Стража",
      percentage: "Распределение %",
      dateTime: "Дата и Время",
      wallet: "Пользователь",
      transactionType: "Тип транзакции",
      amount: "Сумма",
      vaultSupply: "Обеспечение хранилища",
      oracle: "Оракул",
      supplyCap: "Ограничение предложения",
      totalCollateral: "Общее обеспечение",
      marketId: "Идентификатор рынка",
      rateAtUTarget: "Ставка на uTarget",
      market: "Рынок",
      type: "Тип",
      hash: "Хэш",
      timestamp: "Метка времени",
      user: "Пользователь",
      supply: "Поставка",
      share: "Поделиться",
    },
    type: {
      all: "Все типы транзакций",
      deposit: "Депозит в Хранилище",
      withdraw: "Снятие с Хранилища",
      free: "Хранилище Свободно",
      transfer: "Перевод из Хранилища",
    },
    ecosystem: {
      aragon:
        "Создание полной стек-DAO технологии, позволяющей организациям управлять своими протоколами и активами на блокчейне.",
      "brahma-console":
        "Console — это ваш универсальный мульти-цепной аккаунт для обеспечения, навигации и автоматизации взаимодействий на блокчейне.",
      contango:
        "Торгуйте децентрализованными бессрочными фьючерсами с помощью автоматизированных хеджинговых стратегий на базовых кредитных протоколах.",
      "delv-fixed-borrow":
        "DELV Fixed Borrow позволяет существующим заёмщикам DeFi на FundMaker зафиксировать свои процентные ставки и получить предсказуемость стоимости заимствований.",
      "defi-saver":
        "Продвинутое управление DeFi. Все необходимые инструменты для создания, отслеживания и управления вашим DeFi-портфелем.",
      definitive:
        "Некустодиальная платформа для выполнения сложных сделок на блокчейне и получения дохода DeFi.",
      furucombo:
        "Furucombo — это мульти-цепной агрегатор DeFi, предназначенный для упрощения и оптимизации DeFi-торговли для всех!",
      hyperdrive:
        "Получайте доход по своему усмотрению. Доступ к фиксированным и переменным доходам под вашим контролем с Hyperdrive.",
      "idle-finance":
        "Оптимизация доходности и деление риска. Автоматизированный, диверсифицированный DeFi-доход.",
      instadapp:
        "Основной хаб DeFi. Упростите свой путь и получите более безопасный и доступный опыт.",
      "ionic-protocol":
        "Изолированное заимствование и кредитование активов с доходностью на суперцепи.",
      moonwell:
        "Пусть ваши цифровые активы работают. Одолжите или займитесь, чтобы справиться с любыми ситуациями.",
      origami: "Автоматизированное использование плеча для новичков.",
      oval: "Захватите OEV из ликвидаций.",
      protocolink: "Соединяя потенциал Web3 с самым эластичным SDK.",
      reserve:
        "Платформа без разрешений для запуска и управления валютами, обеспеченными активами R1.",
      safe: "Самый доверенный смарт-кошелек.",
      "sommelier-finance":
        "Автоматизированные хранилища для нахождения доходности высшего класса, снижая риски.",
      stream: "Капитало-эффективная платформа для ускорения внедрения DeFi.",
      summerfi:
        "Ускорьте свое портфолио, занимая, одалживая и умножая ваши любимые активы с помощью автоматизированных инструментов.",
      superform: "Приложение для богатства на блокчейне",
      vaultcraft:
        "Ведущий модульный DeFi и RTCI протокол хранилищ — теперь с поддержкой Gnosis Safe.",
      checkBoxConfirmationWithLink:
        'Отметьте это поле, чтобы подтвердить, что вы прочитали <a href="https://cdn.morpho.org/documents/FundMaker_Terms_of_Use.pdf" class="underline">Условия использования</a> FundMaker и понимаете связанные с этим риски.',
    },
  },
};

// Get translation for a key
export function getTranslation(language: string, key: string): string {
  const keys = key.split(".");
  let result: unknown = translations[language as keyof Translations];

  for (const k of keys) {
    if (typeof result !== "object" || result === null) return key;
    result = (result as Record<string, unknown>)[k];
  }

  return typeof result === "string" ? result : key;
}
