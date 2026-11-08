/**
 * Classe de base pour toutes les erreurs du Domaine Métier (RFC 7807 Problem Details).
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly type: string,
    public readonly title: string
  ) {
    super(message);
    this.name = new.target.name;
  }
}
