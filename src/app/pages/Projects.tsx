import { useEffect, useMemo, useState } from "react";
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

            try {
                const data = await listApps(controller.signal);
                setApps(data);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") {
                    return;
                }

                setError(
                    err instanceof Error ? err.message : "Failed to load projects.",
                );
            } finally {
                setIsLoading(false);
            }
        };

        void run();

        return () => {
            controller.abort();
        };
    }, []);

    const totalApps = useMemo(() => apps.length, [apps]);

    return (
        <ProjectsUI
            isLoading={isLoading}
            error={error}
            apps={apps}
            totalApps={totalApps}
        />
    );
}
