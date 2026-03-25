import * as path from 'path';
import { JsonRepository } from './json-store';
import { User } from '../models';

const userRepo = new JsonRepository<User>(path.join(process.cwd(), 'src', 'data', 'users.json'));

export function findById(id: string): User | undefined {
  return userRepo.findById(id);
}

export function findByEmail(email: string): User | undefined {
  return userRepo.findAll({ email } as Partial<User>)[0];
}

export function findAll(): User[] {
  return userRepo.findAll();
}
