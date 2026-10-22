// Disable SSR for the entire audio player client to guarantee 100% client-side execution,
// preventing any server-side rendering exceptions with Web Audio, Canvas, and browser storage APIs.
export const ssr = false;
export const prerender = false;
