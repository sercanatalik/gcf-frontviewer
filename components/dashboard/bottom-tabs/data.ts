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
    label: "By Trading Location",
    groupBy: "hmsDesk",
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
    limit: 10,
  },
  {
    key: "wwrByCountry",
    label: "Wrong Way Risk by Country",
    groupBy: "countryOfRisk",
    groupLabel: "Country",
    limit: 10,
  },
]
