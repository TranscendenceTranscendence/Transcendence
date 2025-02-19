import 'express';
import { User as a } from '../users/user.entity';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends a {}

    interface Request {
      user?: User;
    }
  }
}
