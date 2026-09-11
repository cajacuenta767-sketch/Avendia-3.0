import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  if (mode === "production" && !env.VITE_API_URL?.trim()) {
    throw new Error(
      "Falta VITE_API_URL para la compilación de producción. " +
        "Define la URL pública de la API (por ejemplo https://api.avendia.pe/api/v1); " +
        "sin ella la aplicación apuntaría a la máquina de un desarrollador.",
    );
  }
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api/v1": {
          target: "http://127.0.0.1:8001",
          changeOrigin: true,
        },
      },
    },
    preview: { port: 4173 },
  };
});
