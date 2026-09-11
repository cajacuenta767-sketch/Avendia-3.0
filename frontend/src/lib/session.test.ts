import { afterEach, describe, expect, it } from "vitest";

import { endSession, readAccessToken, saveSession } from "./session";

afterEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

describe("endSession", () => {
  it("removes the device drafts of the user who logs out and keeps everything else", () => {
    saveSession("token", { id: "user-1", full_name: "Docente Uno" });
    localStorage.setItem("avendia.draft.workflow.sesion.v2.user-1", JSON.stringify({ values: { estudiante: "Ana" } }));
    localStorage.setItem("avendia.evaluations.rubric.v1.user-1", JSON.stringify({ records: [{ student: "Luis" }] }));
    localStorage.setItem("avendia.workflow.sesion.user-1", "{}");
    localStorage.setItem("avendia.draft.workflow.sesion.v2.user-2", "{}");
    localStorage.setItem("avendia.theme", "dark");

    endSession();

    expect(readAccessToken()).toBeNull();
    expect(localStorage.getItem("avendia.draft.workflow.sesion.v2.user-1")).toBeNull();
    expect(localStorage.getItem("avendia.evaluations.rubric.v1.user-1")).toBeNull();
    expect(localStorage.getItem("avendia.workflow.sesion.user-1")).toBeNull();
    expect(localStorage.getItem("avendia.draft.workflow.sesion.v2.user-2")).toBe("{}");
    expect(localStorage.getItem("avendia.theme")).toBe("dark");
  });
});
