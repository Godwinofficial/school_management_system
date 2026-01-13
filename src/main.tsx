import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import ErrorBoundary from "./components/ErrorBoundary";
import { syncFromSupabaseToLocal } from "./lib/supabaseSync";

async function bootstrap() {
    // Attempt to sync from Supabase to localStorage before rendering so existing StorageService continues to work
    try {
        await syncFromSupabaseToLocal();
    } catch (err) {
        console.warn('Initial Supabase sync failed, continuing with local data', err);
    }

    createRoot(document.getElementById("root")!).render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
}

bootstrap();
