export * from './register-user.js';
export * from './login-user.js';
export * from './get-me.js';

import { RegisterUser } from './register-user.js';
import { LoginUser } from './login-user.js';
import { GetMe } from './get-me.js';

export interface AuthUseCases {
  registerUser: RegisterUser;
  loginUser: LoginUser;
  getMe: GetMe;
}
