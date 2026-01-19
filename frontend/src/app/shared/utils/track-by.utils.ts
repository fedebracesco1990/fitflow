/**
 * Track by utility functions for Angular @for loops
 * Using trackBy improves performance by helping Angular identify which items changed
 */

/**
 * Track by id - use for entities with 'id' property
 */
export function trackById<T extends { id: string | number }>(index: number, item: T): string | number {
  return item.id;
}

/**
 * Track by index - use when items don't have unique identifiers
 */
export function trackByIndex(index: number): number {
  return index;
}

/**
 * Track by property - generic function to track by any property
 */
export function trackByProperty<T>(property: keyof T) {
  return (index: number, item: T): unknown => item[property];
}
