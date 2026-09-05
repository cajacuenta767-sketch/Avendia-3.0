import { afterEach, describe, expect, it, vi } from "vitest";

import { listRosters, listStudents } from "./rosterApi";
import type { Roster, Student } from "./rosterTypes";

const rosterBase: Roster = {
  id: "roster-1",
  school_year: 2026,
  institution_name: "I.E. Prueba",
  modality: "EBR",
  education_level: "Primaria",
  grade: "4° de Primaria",
  section: "A",
  active: true,
};

function response(items: unknown[], total: number, limit: number, offset: number) {
  return new Response(JSON.stringify({ items, total, limit, offset }), {
    headers: { "Content-Type": "application/json" },
  });
}

describe("rosterApi pagination", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads every roster page and both lifecycle states", async () => {
    const archived = { ...rosterBase, id: "roster-archived", active: false };
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("active=false")) return response([archived], 1, 200, 0);
      if (url.includes("offset=0")) return response([rosterBase], 2, 1, 0);
      return response([{ ...rosterBase, id: "roster-2", name: "Segundo" }], 2, 1, 1);
    });
    vi.stubGlobal("fetch", fetchMock);

    const rosters = await listRosters({ includeInactive: true });
    expect(rosters.map((item) => item.id)).toEqual(expect.arrayContaining(["roster-1", "roster-2", "roster-archived"]));
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes("offset=1"))).toBe(true);
  });

  it("loads every active and inactive student page", async () => {
    const student = (id: string, active: boolean, sort_order: number): Student => ({
      id,
      roster_id: rosterBase.id,
      full_name: id,
      sort_order,
      active,
    });
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("active=false")) return response([student("retired", false, 2)], 1, 5000, 0);
      if (url.includes("offset=0")) return response([student("active-1", true, 0)], 2, 1, 0);
      return response([student("active-2", true, 1)], 2, 1, 1);
    }));

    const students = await listStudents(rosterBase.id, { includeInactive: true });
    expect(students.map((item) => item.id)).toEqual(["active-1", "active-2", "retired"]);
  });
});
