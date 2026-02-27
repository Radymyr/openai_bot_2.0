import { beforeEach, describe, expect, it, vi } from "vitest";

const startMock = vi.fn();
const onMock = vi.fn();
const handleUpdateMock = vi.fn();

vi.mock("../src/initializers.js", () => ({
  bot: {
    start: startMock,
    on: onMock,
    handleUpdate: handleUpdateMock,
  },
}));

interface MockRes {
  statusCode: number;
  body: unknown;
  status: (code: number) => MockRes;
  json: (payload: unknown) => MockRes;
}

function createRes(): MockRes {
  return {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
}

describe("api/bot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers bot handlers on module load", async () => {
    vi.resetModules();
    await import("../api/bot.ts");

    expect(startMock).toHaveBeenCalledTimes(1);
    expect(onMock).toHaveBeenCalledWith("message", expect.any(Function));
  });

  it("returns 405 for non-POST requests", async () => {
    const { default: handler } = await import("../api/bot.ts");

    const req = { method: "GET", body: null };
    const res = createRes();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(405);
    expect(res.body).toEqual({ error: "Method Not Allowed" });
    expect(handleUpdateMock).not.toHaveBeenCalled();
  });

  it("returns ok=true for valid POST", async () => {
    const { default: handler } = await import("../api/bot.ts");
    handleUpdateMock.mockResolvedValueOnce(undefined);

    const req = { method: "POST", body: { update_id: 1 } };
    const res = createRes();

    await handler(req as never, res as never);

    expect(handleUpdateMock).toHaveBeenCalledWith({ update_id: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("returns ok=false when update handling throws", async () => {
    const { default: handler } = await import("../api/bot.ts");
    handleUpdateMock.mockRejectedValueOnce(new Error("boom"));

    const req = { method: "POST", body: { update_id: 2 } };
    const res = createRes();

    await handler(req as never, res as never);

    expect(handleUpdateMock).toHaveBeenCalledWith({ update_id: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: false });
  });
});
