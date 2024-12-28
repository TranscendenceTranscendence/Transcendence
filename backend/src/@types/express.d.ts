import 'express';

declare global {
  namespace Express {
    interface User {
      id: number; // for authgaurd
    }

    interface Request {
      user?: User;
    }
  }
}
