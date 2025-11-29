import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
        console.error('[Client Error]', errorMessage);
      } else {
        // Server-side error
        console.error(`[Server Error] Status: ${error.status}`, error.error);

        switch (error.status) {
          case 0:
            errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
            break;
          case 400:
            errorMessage = extractMessage(error) || 'Solicitud inválida';
            break;
          case 401:
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 409:
            errorMessage = extractMessage(error) || 'Conflicto con los datos existentes';
            break;
          case 422:
            errorMessage = extractMessage(error) || 'Datos de entrada inválidos';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta más tarde.';
            break;
          default:
            errorMessage = extractMessage(error) || errorMessage;
        }
      }

      return throwError(() => ({
        ...error,
        friendlyMessage: errorMessage,
      }));
    })
  );
};

function extractMessage(error: HttpErrorResponse): string | null {
  if (error.error?.message) {
    return Array.isArray(error.error.message) ? error.error.message[0] : error.error.message;
  }
  return null;
}
