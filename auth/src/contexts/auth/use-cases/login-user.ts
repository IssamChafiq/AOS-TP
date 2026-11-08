import type { PasswordHasher } from '../domain/password-hasher.js';
import type { TokenIssuer } from '../domain/token-issuer.js';
import { InvalidCredentials } from '../domain/user.errors.js';
import type { UserRepository } from '../domain/user.repository.js';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

/**
 * Cas d'usage : Connexion d'un utilisateur
 * 1. Recherche l'utilisateur par son adresse email.
 * 2. Vérifie la correspondance du mot de passe avec le hash.
 * 3. Émet un jeton JWT contenant l'identifiant et le rôle.
 */
export class LoginUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenIssuer,
    private readonly tokenLifetimeSeconds: number = 900
  ) {}

  async execute(input: LoginUserInput): Promise<LoginResult> {
    const user = await this.users.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentials();
    }

    const isValid = await this.hasher.verify(input.password, user.passwordHash);
    if (!isValid) {
      throw new InvalidCredentials();
    }

    const accessToken = this.tokens.issue({
      sub: user.id,
      role: user.role,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.tokenLifetimeSeconds,
    };
  }
}
