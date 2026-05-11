import { NextFunction, Request, Response } from 'express';

export interface IMeta {
  copyright: string;
  site: string;
  emails: string[];
  api: {
    version: number;
  };
}

export const meta: IMeta = {
  copyright: "Copyright 2025 Rajan Paudel.",
  site: "rajanpoudel.com.np",
  emails: ["rajan.rp50@gmail.com"],
  api: {
    version: 1
  }
};

export const addCommonMetadata = (req: Request, res: Response, next: NextFunction): void => {
  // Add metadata to response locals for use in controllers
  res.locals.meta = meta;
  next();
};

export default meta;
