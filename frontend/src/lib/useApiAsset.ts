import { useEffect, useState } from "react";
import { apiAssetAsDataUrl, isApiAssetPath, resolveApiAssetUrl } from "./api";

export type ApiAssetState = { src: string; status: "empty" | "loading" | "ready" | "error" };

type LoadedAsset = { path: string; src: string; status: "ready" | "error" };

/**
 * Resuelve la fuente de una imagen para `<img>`. Los recursos de la API propia
 * se descargan con la sesión (un `<img src>` no puede enviar el token) y las URL
 * externas o embebidas se usan tal cual.
 */
export function useApiAsset(path: string | undefined): ApiAssetState {
  const [loaded, setLoaded] = useState<LoadedAsset | null>(null);

  useEffect(() => {
    if (!path || !isApiAssetPath(path)) return;
    let active = true;
    apiAssetAsDataUrl(path)
      .then((src) => { if (active) setLoaded({ path, src, status: "ready" }); })
      .catch(() => { if (active) setLoaded({ path, src: "", status: "error" }); });
    return () => { active = false; };
  }, [path]);

  if (!path) return { src: "", status: "empty" };
  if (!isApiAssetPath(path)) return { src: resolveApiAssetUrl(path), status: "ready" };
  if (loaded?.path === path) return { src: loaded.src, status: loaded.status };
  return { src: "", status: "loading" };
}
