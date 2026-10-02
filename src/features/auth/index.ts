// Public entry point for the "auth" feature. Re-exports only what other layers may consume.
// Firebase Auth flows (login, register, session), auth hooks, guarded routes.
export { AuthProvider, useAuth } from "./auth-context";
