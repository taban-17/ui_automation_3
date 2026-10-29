import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ success: false, errors: err.issues });
    return;
  }

  if (isErrnoException(err) && err.code === "ENOENT") {
    res.status(404).json({ success: false, message: "Router not found" });
    return;
  }

  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
}

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && "code" in err;
}