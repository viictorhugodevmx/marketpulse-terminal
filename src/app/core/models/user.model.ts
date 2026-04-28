export interface User {
  id: string;
  name: string;
  email: string;
  role: 'analyst' | 'trader' | 'admin';
}
