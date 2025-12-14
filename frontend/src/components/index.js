// Root components barrel file for easier imports and clearer structure.
// Import like: `import { ForecastChart } from '@/components'` if desired.

export { default as ForecastChart } from "./forecast/ForecastChart";
export { default as ErrorBoundary } from "./ErrorBoundary";
export { default as PrivateRoute } from "./PrivateRoute";

// Re-export grouped common components
export * as Common from "./common";
