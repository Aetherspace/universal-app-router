export const typeDefs = `type Query {
  healthCheck(args: HealthCheckArgs): HealthCheckData!
}

input HealthCheckArgs {
  echo: String
}

type HealthCheckData {
  echo: String
  status: String!
  alive: Boolean!
  kicking: Boolean!
  now: String!
  aliveTime: Float!
  aliveSince: String!
  serverTimezone: String!
  requestHost: String
  requestProtocol: String
  requestURL: String
  baseURL: String
  backendURL: String
  apiURL: String
  graphURL: String
  port: Int
  debugPort: Int
  nodeVersion: String
  v8Version: String
  systemArch: String
  systemPlatform: String
  systemRelease: String
  systemFreeMemory: Float
  systemTotalMemory: Float
  systemLoadAverage: [Float]
}

schema {
  query: Query
}`