import { DomainError } from '../../../shared/domain-error.js';

/**
 * Erreur levée lorsqu'un utilisateur tente de s'inscrire avec une adresse email déjà enregistrée.
 * Code HTTP : 409 Conflict
 */
export class EmailAlreadyUsed extends DomainError {
  constructor(email: string) {
    super(
      `Email '${email}' is already registered`,
      409,
      'https://polyshop.fr/problems/email-already-used',
      'Email already used'
    );
  }
}

/**
 * Erreur levée lorsque les identifiants de connexion (email ou mot de passe) sont incorrects.
 * Code HTTP : 401 Unauthorized
 */
export class InvalidCredentials extends DomainError {
  constructor() {
    super(
      'Invalid email or password',
      401,
      'https://polyshop.fr/problems/invalid-credentials',
      'Invalid credentials'
    );
  }
}

/**
 * Erreur levée lorsqu'un utilisateur recherché par son identifiant n'existe pas.
 * Code HTTP : 404 Not Found
 */
export class UserNotFound extends DomainError {
  constructor(id: string) {
    super(
      `No user with id '${id}'`,
      404,
      'https://polyshop.fr/problems/user-not-found',
      'User not found'
    );
  }
}
