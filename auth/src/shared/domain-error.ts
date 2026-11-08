/**
 * Classe de base pour toutes les erreurs métier (Domain Errors).
 * Ces erreurs contiennent les informations standardisées de la RFC 7807 (Problem Details).
 * Elles permettent au domaine de signaler un échec sans dépendre directement d'Express.
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
