/**
 * TP1 - Définition du modèle Produit et catalogue en mémoire
 * Utilisé pour initialiser notre premier microservice sans base de données.
 */

export interface Product {
  id: string;
  name: string;
  priceCents: number;
  tags: string[];
}

export const products: Product[] = [
  { id: '1', name: 'Clavier mécanique', priceCents: 8990, tags: ['peripherique', 'usb'] },
  { id: '2', name: 'Souris sans fil', priceCents: 3490, tags: ['peripherique', 'bluetooth'] },
  { id: '3', name: 'Écran 27" 4K', priceCents: 42900, tags: ['ecran'] },
  { id: '4', name: 'Casque audio', priceCents: 12900, tags: ['audio', 'bluetooth'] },
  { id: '5', name: 'Webcam 1080p', priceCents: 5990, tags: ['peripherique', 'usb'] },
];
