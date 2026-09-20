// `server-only` throws unless it is resolved under React's "react-server"
// condition, which Vitest does not set. The guard exists to stop a *bundler*
// pulling a secret-reading module into a client chunk; under test there is no
// bundle, so stubbing it is safe and keeps those modules testable.
export {};
