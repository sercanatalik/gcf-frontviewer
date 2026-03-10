export interface TabDef {
  key: string
  label: string
  groupBy: string
  groupLabel: string
  limit?: number
}

export const tabs: TabDef[] = [
  {
    key: "location",
    label: "By Trading Desk",
    groupBy: "hmsSL1",
    groupLabel: "Location",
    limit: 10,
  },
  {
    key: "portfolio",
    label: "By Portfolio",
    groupBy: "hmsBook",
    groupLabel: "Portfolio",
    limit: 10,
  },
  {
    key: "clients",
    label: "Top Clients",
    groupBy: "counterpartyParentName",
    groupLabel: "Client",
    limit: 100,
  },
  {
    key: "wwrByCountry",
    label: "Wrong Way Risk by Country",
    groupBy: "i_countryOfRisk",
    groupLabel: "Country",
    limit: 10,
  },
]
