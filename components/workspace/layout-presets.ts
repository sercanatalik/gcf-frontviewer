// Matches PerspectiveWorkspaceConfig from @perspective-dev/workspace
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface WorkspaceLayout {
  sizes: number[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewers: Record<string, any>
  detail: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    main: any
  }
  master?: {
    sizes: number[]
    widgets: string[]
  }
}

export interface LayoutPreset {
  id: string
  name: string
  description: string
  icon: string
  layout: WorkspaceLayout
}

const TABLE = "gcf_risk_mv"

export const layoutPresets: LayoutPreset[] = [
  // ── 1. Overview Grid ─────────────────────────────────────────────
  {
    id: "overview",
    name: "Overview",
    description: "Full data grid with key trade columns",
    icon: "table",
    layout: {
      sizes: [1],
      detail: {
        main: {
          type: "tab-area",
          widgets: ["v-overview"],
          currentIndex: 0,
        },
      },
      viewers: {
        "v-overview": {
          plugin: "Datagrid",
          table: TABLE,
          title: "Trade Overview",
          columns: [
            "asofDate",
            "tradeId",
            "counterParty",
            "productType",
            "side",
            "fundingAmount",
            "collateralAmount",
            "financingExposure",
            "fundingMargin",
            "tenor",
            "tradeDt",
            "maturityDt",
            "hmsDesk",
            "hmsBook",
          ],
          sort: [["asofDate", "desc"]],
          group_by: [],
          split_by: [],
          filter: [],
          expressions: {},
          aggregates: {},
        },
      },
    },
  },

  // ── 2. Risk Dashboard ────────────────────────────────────────────
  {
    id: "risk-dashboard",
    name: "Risk Dashboard",
    description: "Exposure by desk, counterparty breakdown, and blotter",
    icon: "shield",
    layout: {
      sizes: [1],
      detail: {
        main: {
          type: "split-area",
          orientation: "vertical",
          children: [
            {
              type: "split-area",
              orientation: "horizontal",
              children: [
                {
                  type: "tab-area",
                  widgets: ["v-exposure-desk"],
                  currentIndex: 0,
                },
                {
                  type: "tab-area",
                  widgets: ["v-cp-bar"],
                  currentIndex: 0,
                },
              ],
              sizes: [0.5, 0.5],
            },
            {
              type: "tab-area",
              widgets: ["v-blotter"],
              currentIndex: 0,
            },
          ],
          sizes: [0.45, 0.55],
        },
      },
      viewers: {
        "v-exposure-desk": {
          plugin: "Y Bar",
          table: TABLE,
          title: "Exposure by Desk",
          group_by: ["hmsDesk"],
          split_by: ["side"],
          columns: ["financingExposure"],
          sort: [["financingExposure", "desc"]],
          filter: [],
          expressions: {},
          aggregates: { financingExposure: "sum" },
        },
        "v-cp-bar": {
          plugin: "Treemap",
          table: TABLE,
          title: "Counterparty Exposure",
          group_by: ["cpType", "counterParty"],
          split_by: [],
          columns: ["financingExposure", "fundingAmount", null],
          sort: [["financingExposure", "desc"]],
          filter: [],
          expressions: {},
          aggregates: { financingExposure: "sum", fundingAmount: "sum" },
        },
        "v-blotter": {
          plugin: "Datagrid",
          table: TABLE,
          title: "Trade Blotter",
          columns: [
            "tradeId",
            "counterParty",
            "side",
            "productType",
            "fundingAmount",
            "financingExposure",
            "fundingMargin",
            "tenor",
            "hmsDesk",
          ],
          sort: [["fundingAmount", "desc"]],
          group_by: [],
          split_by: [],
          filter: [],
          expressions: {},
          aggregates: {},
        },
      },
    },
  },

  // ── 3. Counterparty Analysis ─────────────────────────────────────
  {
    id: "counterparty",
    name: "Counterparty Analysis",
    description: "Deep-dive into counterparty risk and concentration",
    icon: "users",
    layout: {
      sizes: [1],
      detail: {
        main: {
          type: "split-area",
          orientation: "horizontal",
          children: [
            {
              type: "split-area",
              orientation: "vertical",
              children: [
                {
                  type: "tab-area",
                  widgets: ["v-cp-exposure"],
                  currentIndex: 0,
                },
                {
                  type: "tab-area",
                  widgets: ["v-cp-type-sunburst"],
                  currentIndex: 0,
                },
              ],
              sizes: [0.55, 0.45],
            },
            {
              type: "tab-area",
              widgets: ["v-cp-grid", "v-cp-rating"],
              currentIndex: 0,
            },
          ],
          sizes: [0.4, 0.6],
        },
      },
      viewers: {
        "v-cp-exposure": {
          plugin: "X Bar",
          table: TABLE,
          title: "Top Counterparties by Exposure",
          group_by: ["counterParty"],
          split_by: ["productType"],
          columns: ["financingExposure"],
          sort: [["financingExposure", "desc"]],
          filter: [],
          expressions: {},
          aggregates: { financingExposure: "sum" },
        },
        "v-cp-type-sunburst": {
          plugin: "Sunburst",
          table: TABLE,
          title: "Counterparty Type Breakdown",
          group_by: ["cpType", "counterpartyParentName"],
          split_by: [],
          columns: ["fundingAmount", null, null],
          sort: [],
          filter: [],
          expressions: {},
          aggregates: { fundingAmount: "sum" },
        },
        "v-cp-grid": {
          plugin: "Datagrid",
          table: TABLE,
          title: "Counterparty Details",
          group_by: ["counterParty"],
          split_by: [],
          columns: [
            "financingExposure",
            "fundingAmount",
            "collateralAmount",
            "fundingMargin",
            "cpRatingMoodys",
            "cpRatingSnp",
            "countryOfRisk",
          ],
          sort: [["financingExposure", "desc"]],
          filter: [],
          expressions: {},
          aggregates: {
            financingExposure: "sum",
            fundingAmount: "sum",
            collateralAmount: "sum",
            fundingMargin: "avg",
          },
        },
        "v-cp-rating": {
          plugin: "Heatmap",
          table: TABLE,
          title: "Rating Heatmap",
          group_by: ["cpRatingMoodys"],
          split_by: ["cpType"],
          columns: ["financingExposure"],
          sort: [],
          filter: [],
          expressions: {},
          aggregates: { financingExposure: "sum" },
        },
      },
    },
  },

  // ── 4. Collateral & Maturity ─────────────────────────────────────
  {
    id: "collateral-maturity",
    name: "Collateral & Maturity",
    description: "Collateral allocation and maturity tenor profile",
    icon: "shield-check",
    layout: {
      sizes: [1],
      detail: {
        main: {
          type: "split-area",
          orientation: "vertical",
          children: [
            {
              type: "split-area",
              orientation: "horizontal",
              children: [
                {
                  type: "tab-area",
                  widgets: ["v-collat-type"],
                  currentIndex: 0,
                },
                {
                  type: "tab-area",
                  widgets: ["v-tenor-profile"],
                  currentIndex: 0,
                },
              ],
              sizes: [0.5, 0.5],
            },
            {
              type: "split-area",
              orientation: "horizontal",
              children: [
                {
                  type: "tab-area",
                  widgets: ["v-collat-heatmap"],
                  currentIndex: 0,
                },
                {
                  type: "tab-area",
                  widgets: ["v-maturity-grid"],
                  currentIndex: 0,
                },
              ],
              sizes: [0.5, 0.5],
            },
          ],
          sizes: [0.5, 0.5],
        },
      },
      viewers: {
        "v-collat-type": {
          plugin: "Treemap",
          table: TABLE,
          title: "Collateral Allocation",
          group_by: ["collateralType", "collateralDesc"],
          split_by: [],
          columns: ["collateralAmount", "fundingAmount", null],
          sort: [["collateralAmount", "desc"]],
          filter: [],
          expressions: {},
          aggregates: { collateralAmount: "sum", fundingAmount: "sum" },
        },
        "v-tenor-profile": {
          plugin: "Y Bar",
          table: TABLE,
          title: "Tenor Profile",
          group_by: ["tenor"],
          split_by: ["side"],
          columns: ["fundingAmount"],
          sort: [],
          filter: [],
          expressions: {},
          aggregates: { fundingAmount: "sum" },
        },
        "v-collat-heatmap": {
          plugin: "Heatmap",
          table: TABLE,
          title: "Collateral x Currency",
          group_by: ["collateralDesc"],
          split_by: ["collatCurrency"],
          columns: ["collateralAmount"],
          sort: [],
          filter: [],
          expressions: {},
          aggregates: { collateralAmount: "sum" },
        },
        "v-maturity-grid": {
          plugin: "Datagrid",
          table: TABLE,
          title: "Maturity Schedule",
          group_by: ["maturityDt"],
          split_by: [],
          columns: [
            "fundingAmount",
            "collateralAmount",
            "financingExposure",
            "counterParty",
            "tenor",
          ],
          sort: [["maturityDt", "asc"]],
          filter: [],
          expressions: {},
          aggregates: {
            fundingAmount: "sum",
            collateralAmount: "sum",
            financingExposure: "sum",
            counterParty: "count",
          },
        },
      },
    },
  },

  // ── 5. Desk P&L View ─────────────────────────────────────────────
  {
    id: "desk-pnl",
    name: "Desk & Book Hierarchy",
    description: "Desk-level metrics with book hierarchy drill-down",
    icon: "bar-chart",
    layout: {
      sizes: [1],
      detail: {
        main: {
          type: "split-area",
          orientation: "horizontal",
          children: [
            {
              type: "split-area",
              orientation: "vertical",
              children: [
                {
                  type: "tab-area",
                  widgets: ["v-desk-sunburst"],
                  currentIndex: 0,
                },
                {
                  type: "tab-area",
                  widgets: ["v-desk-margin"],
                  currentIndex: 0,
                },
              ],
              sizes: [0.55, 0.45],
            },
            {
              type: "tab-area",
              widgets: ["v-desk-grid", "v-accrual-bar"],
              currentIndex: 0,
            },
          ],
          sizes: [0.4, 0.6],
        },
      },
      viewers: {
        "v-desk-sunburst": {
          plugin: "Sunburst",
          table: TABLE,
          title: "Desk / Book Hierarchy",
          group_by: ["hmsDesk", "hmsBook", "hmsPortfolio"],
          split_by: [],
          columns: ["fundingAmount", null, null],
          sort: [],
          filter: [],
          expressions: {},
          aggregates: { fundingAmount: "sum" },
        },
        "v-desk-margin": {
          plugin: "Y Bar",
          table: TABLE,
          title: "Margin by Desk",
          group_by: ["hmsDesk"],
          split_by: [],
          columns: ["fundingMargin"],
          sort: [["fundingMargin", "desc"]],
          filter: [],
          expressions: {},
          aggregates: { fundingMargin: "avg" },
        },
        "v-desk-grid": {
          plugin: "Datagrid",
          table: TABLE,
          title: "Desk Summary",
          group_by: ["hmsDesk", "hmsBook"],
          split_by: [],
          columns: [
            "fundingAmount",
            "collateralAmount",
            "financingExposure",
            "fundingMargin",
            "cashOut",
            "accrualDaily",
          ],
          sort: [["fundingAmount", "desc"]],
          filter: [],
          expressions: {},
          aggregates: {
            fundingAmount: "sum",
            collateralAmount: "sum",
            financingExposure: "sum",
            fundingMargin: "avg",
            cashOut: "sum",
            accrualDaily: "sum",
          },
        },
        "v-accrual-bar": {
          plugin: "Y Bar",
          table: TABLE,
          title: "Accruals by Desk",
          group_by: ["hmsDesk"],
          split_by: [],
          columns: ["accrualDaily", "accrualProjected", "accrualRealised"],
          sort: [["accrualDaily", "desc"]],
          filter: [],
          expressions: {},
          aggregates: {
            accrualDaily: "sum",
            accrualProjected: "sum",
            accrualRealised: "sum",
          },
        },
      },
    },
  },

  // ── 6. Regional & Currency View ──────────────────────────────────
  {
    id: "regional-currency",
    name: "Regional & Currency",
    description: "Geographic and currency exposure distribution",
    icon: "globe",
    layout: {
      sizes: [1],
      detail: {
        main: {
          type: "split-area",
          orientation: "vertical",
          children: [
            {
              type: "split-area",
              orientation: "horizontal",
              children: [
                {
                  type: "tab-area",
                  widgets: ["v-region-bar"],
                  currentIndex: 0,
                },
                {
                  type: "tab-area",
                  widgets: ["v-ccy-treemap"],
                  currentIndex: 0,
                },
                {
                  type: "tab-area",
                  widgets: ["v-country-heatmap"],
                  currentIndex: 0,
                },
              ],
              sizes: [0.33, 0.34, 0.33],
            },
            {
              type: "tab-area",
              widgets: ["v-regional-grid"],
              currentIndex: 0,
            },
          ],
          sizes: [0.5, 0.5],
        },
      },
      viewers: {
        "v-region-bar": {
          plugin: "Y Bar",
          table: TABLE,
          title: "Exposure by Region",
          group_by: ["region"],
          split_by: ["side"],
          columns: ["financingExposure"],
          sort: [["financingExposure", "desc"]],
          filter: [],
          expressions: {},
          aggregates: { financingExposure: "sum" },
        },
        "v-ccy-treemap": {
          plugin: "Treemap",
          table: TABLE,
          title: "Funding Currency Mix",
          group_by: ["fundingCurrency", "collatCurrency"],
          split_by: [],
          columns: ["fundingAmount", "collateralAmount", null],
          sort: [],
          filter: [],
          expressions: {},
          aggregates: { fundingAmount: "sum", collateralAmount: "sum" },
        },
        "v-country-heatmap": {
          plugin: "Heatmap",
          table: TABLE,
          title: "Country of Risk",
          group_by: ["countryOfRisk"],
          split_by: ["productType"],
          columns: ["financingExposure"],
          sort: [],
          filter: [],
          expressions: {},
          aggregates: { financingExposure: "sum" },
        },
        "v-regional-grid": {
          plugin: "Datagrid",
          table: TABLE,
          title: "Regional Breakdown",
          group_by: ["region", "subRegion", "tradingLocation"],
          split_by: [],
          columns: [
            "fundingAmount",
            "collateralAmount",
            "financingExposure",
            "fundingMargin",
            "counterParty",
          ],
          sort: [["fundingAmount", "desc"]],
          filter: [],
          expressions: {},
          aggregates: {
            fundingAmount: "sum",
            collateralAmount: "sum",
            financingExposure: "sum",
            fundingMargin: "avg",
            counterParty: "count",
          },
        },
      },
    },
  },

  // ── 7. Product Deep-Dive ─────────────────────────────────────────
  {
    id: "product-deepdive",
    name: "Product Deep-Dive",
    description: "Analyze by product type, asset class, and instrument",
    icon: "layers",
    layout: {
      sizes: [1],
      detail: {
        main: {
          type: "split-area",
          orientation: "vertical",
          children: [
            {
              type: "split-area",
              orientation: "horizontal",
              children: [
                {
                  type: "tab-area",
                  widgets: ["v-product-bar"],
                  currentIndex: 0,
                },
                {
                  type: "tab-area",
                  widgets: ["v-asset-sunburst"],
                  currentIndex: 0,
                },
              ],
              sizes: [0.5, 0.5],
            },
            {
              type: "tab-area",
              widgets: ["v-instrument-grid", "v-product-scatter"],
              currentIndex: 0,
            },
          ],
          sizes: [0.45, 0.55],
        },
      },
      viewers: {
        "v-product-bar": {
          plugin: "Y Bar",
          table: TABLE,
          title: "Funding by Product Type",
          group_by: ["productType"],
          split_by: ["fundingType"],
          columns: ["fundingAmount"],
          sort: [["fundingAmount", "desc"]],
          filter: [],
          expressions: {},
          aggregates: { fundingAmount: "sum" },
        },
        "v-asset-sunburst": {
          plugin: "Sunburst",
          table: TABLE,
          title: "Asset Class Hierarchy",
          group_by: ["assetClass", "instrumentType", "collateralType"],
          split_by: [],
          columns: ["collateralAmount", null, null],
          sort: [],
          filter: [],
          expressions: {},
          aggregates: { collateralAmount: "sum" },
        },
        "v-instrument-grid": {
          plugin: "Datagrid",
          table: TABLE,
          title: "Instrument Details",
          group_by: ["productType", "productSubType"],
          split_by: [],
          columns: [
            "fundingAmount",
            "collateralAmount",
            "financingExposure",
            "haircut",
            "fixedRate",
            "fundingMargin",
            "coupon",
          ],
          sort: [["fundingAmount", "desc"]],
          filter: [],
          expressions: {},
          aggregates: {
            fundingAmount: "sum",
            collateralAmount: "sum",
            financingExposure: "sum",
            haircut: "avg",
            fixedRate: "avg",
            fundingMargin: "avg",
            coupon: "avg",
          },
        },
        "v-product-scatter": {
          plugin: "Y Scatter",
          table: TABLE,
          title: "Margin vs Exposure",
          group_by: ["counterParty"],
          split_by: ["productType"],
          columns: ["fundingMargin"],
          sort: [],
          filter: [],
          expressions: {},
          aggregates: { fundingMargin: "avg" },
        },
      },
    },
  },
]
