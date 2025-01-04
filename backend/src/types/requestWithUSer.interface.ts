import { Request } from 'express';
import { User } from '../users/user.entity'; // Adjust the import path as necessary

export interface RequestWithUser extends Request {
  user: User;
}