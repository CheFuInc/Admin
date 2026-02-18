import { RouterProvider } from "react-router";
import { ThemeProvider } from "./providers/theme-provider";
import { router } from "./routes";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
