import { useCallback, useEffect, useRef, useState } from "react";

import { createEvaluationInstrument, getEvaluationDraft, saveEvaluationDraft } from "./evaluationApi";
import type { EvaluationDraftPayload, EvaluationInstrument } from "./evaluationContracts";

type UseEvaluationInstrumentOptions = {
  instrumentId?: string;
  onLoaded?: (instrument: EvaluationInstrument) => void;
  onInstrumentIdChange?: (instrumentId: string) => void;
};

export function useEvaluationInstrument({
  instrumentId,
  onLoaded,
  onInstrumentIdChange,
}: UseEvaluationInstrumentOptions = {}) {
  const [activeId, setActiveId] = useState(instrumentId ?? "");
  const [revision, setRevision] = useState<number | undefined>();
  const [saving, setSaving] = useState(false);
  const [loadedInstrumentId, setLoadedInstrumentId] = useState(instrumentId ? "" : undefined);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const createPromise = useRef<Promise<EvaluationInstrument> | null>(null);

  useEffect(() => {
    if (!instrumentId) return;
    const controller = new AbortController();
    void getEvaluationDraft(instrumentId, controller.signal)
      .then((instrument) => {
        setActiveId(instrument.id);
        setRevision(instrument.revision);
        onLoaded?.(instrument);
        setError("");
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "No se pudo recuperar el borrador.");
      })
      .finally(() => setLoadedInstrumentId(instrumentId));
    return () => controller.abort();
  }, [instrumentId, onLoaded]);

  const loading = Boolean(instrumentId && loadedInstrumentId !== instrumentId);

  const remember = useCallback((instrument: EvaluationInstrument) => {
    setActiveId(instrument.id);
    setRevision(instrument.revision);
    onInstrumentIdChange?.(instrument.id);
    return instrument.id;
  }, [onInstrumentIdChange]);

  const ensureInstrument = useCallback(async (payload: EvaluationDraftPayload) => {
    if (activeId) return activeId;
    if (!createPromise.current) {
      createPromise.current = createEvaluationInstrument(payload).finally(() => {
        createPromise.current = null;
      });
    }
    return remember(await createPromise.current);
  }, [activeId, remember]);

  const persist = useCallback(async (payload: EvaluationDraftPayload) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const instrument = activeId
        ? await saveEvaluationDraft(activeId, { ...payload, expected_revision: revision })
        : await createEvaluationInstrument(payload);
      remember(instrument);
      setMessage("Borrador guardado. Puedes volver y continuar sin perder la información.");
      return instrument;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar el instrumento.");
      throw reason;
    } finally {
      setSaving(false);
    }
  }, [activeId, remember, revision]);

  const refresh = useCallback(async (instrumentIdOverride?: string) => {
    const targetId = instrumentIdOverride || activeId;
    if (!targetId) return undefined;
    setError("");
    try {
      const instrument = await getEvaluationDraft(targetId);
      setRevision(instrument.revision);
      onLoaded?.(instrument);
      return instrument;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo actualizar el borrador.");
      throw reason;
    }
  }, [activeId, onLoaded]);

  return {
    instrumentId: activeId,
    revision,
    saving,
    loading,
    message,
    error,
    ensureInstrument,
    persist,
    refresh,
    clearMessage: () => { setMessage(""); setError(""); },
  };
}
