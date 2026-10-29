import { Router, Request, Response, NextFunction } from "express";
import {
  loadState,
  updateState,
  resetState,
  readHistory,
  HistoryEntry,
  tickState,
} from "../services/state-manager";
import { routerStatePatchSchema } from "../../config/router-schema";
import { RouterState, RouterStatePatch } from "../../shared/types/router-state";

const router: Router = Router();

router.get(
  "/:id/state",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const state: RouterState = await loadState(id);
      res.json(state);
    } catch (e: unknown) {
      next(e);
    }
  }
);

router.patch(
  "/:id/state",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const parsed = routerStatePatchSchema.parse(req.body);
      const patch: RouterStatePatch = parsed;
      const updated: RouterState = await updateState(id, patch);
      res.json({
        success: true,
        message: "Configuration updated successfully",
        updated: patch,
        state: updated,
      });
    } catch (e: unknown) {
      next(e);
    }
  }
);

router.post(
  "/:id/reset",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const state: RouterState = await resetState(id);
      res.json({
        success: true,
        message: "Configuration reset to initial state",
        state,
      });
    } catch (e: unknown) {
      next(e);
    }
  }
);

router.get(
  "/:id/history",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const limitRaw: unknown = req.query.limit;
      let limit: number | undefined;
      if (typeof limitRaw === "string") {
        const parsed = Number(limitRaw);
        if (Number.isInteger(parsed) && parsed > 0) limit = parsed;
      }
      const entries: HistoryEntry[] = await readHistory(id, limit);
      res.json({ router: id, count: entries.length, entries });
    } catch (e: unknown) {
      next(e);
    }
  }
);


router.post(
  "/:id/tick",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const raw = (req.body as { increment?: unknown } | undefined)?.increment;
      const increment =
        typeof raw === "number" && Number.isInteger(raw) && raw > 0 ? raw : 1;
      const state: RouterState = await tickState(id, increment);
      res.json({ success: true, state });
    } catch (e: unknown) {
      next(e);
    }
  }
);

export default router;