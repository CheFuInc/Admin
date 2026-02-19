import { useEffect, useState } from "react";
import { listApps, type FirebaseWebApp } from "../api/listApps";
import ProjectsUI from "../components/CustomUI/ProjectsUI";

export function Projects() {
    const [apps, setApps] = useState<FirebaseWebApp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const run = async () => {
            setIsLoading(true);
            setError(null);
            let didAbort = false;

            try {
                const data = await listApps(controller.signal);
                setApps(data);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") {
                    didAbort = true;
                    return;
                }

                setError(
                    err instanceof Error ? err.message : "Failed to load projects.",
                );
            } finally {
                if (!didAbort) {
                    setIsLoading(false);
                }
            }
        };

        void run();

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <ProjectsUI
            isLoading={isLoading}
            error={error}
            apps={apps}
        />
    );
}
