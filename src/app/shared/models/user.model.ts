export type Role = 'admin' | 'guide' | 'tourist';

export interface User {
  id?: string;
  username: string;
  email: string;
  password?: string;
  role: Role;
}
