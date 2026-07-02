import { FormControl } from '@angular/forms';

/**
 * Convierte una interfaz de dominio en un mapa de FormControl tipados.
 *
 * Uso:
 *   new FormGroup<FormGroupOf<MiInterfaz>>({ ... })
 *
 * Esto le dice a TypeScript que el FormGroup debe tener exactamente
 * los mismos campos que la interfaz, con los mismos tipos.
 * Si falta un campo o el tipo no coincide, el compilador lo marca.
 */
export type FormGroupOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};
