import { Router, Request, Response, NextFunction } from "express";
import { listRouters, loadState } from "../services/state-manager";
import { RouterState } from "../../shared/types/router-state";

const router: Router = Router();

router.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ids: string[] = await listRouters();
      res.json({ routers: ids });
    } catch (e: unknown) {
      next(e);
    }
  }
);

router.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const state: RouterState = await loadState(id);
      res.json(state.device);
    } catch (e: unknown) {
      next(e);
    }
  }
);

export default router;