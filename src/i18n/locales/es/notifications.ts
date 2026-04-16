import type { TranslationNamespace } from "@i18n/types";

export const notificationsEs: TranslationNamespace = {
  "errors.load": "No se pudieron cargar las notificaciones.",
  "errors.dismiss": "No se pudo descartar la notificacion.",
  "errors.dismissAll": "No se pudieron limpiar las notificaciones.",
  "errors.unauthorized": "No tienes sesion activa para esta accion.",
  "errors.forbidden": "No tienes permisos para gestionar notificaciones.",
  "errors.notificationNotFound": "La notificacion no existe o ya fue descartada (campo: {{field}}).",
  "errors.validation": "Error de validacion en el campo '{{field}}'. Motivo: {{reason}}.",
  "errors.internal": "Error interno al procesar notificaciones.",
  "fields.notificationId": "identificador de notificacion",
  "fields.orgId": "organizacion",
  "fields.type": "tipo de notificacion",
  "fields.unknown": "campo desconocido",
  "reasons.invalid_enum": "valor no permitido",
  "reasons.required": "campo obligatorio",
  "reasons.unknown": "motivo desconocido",
};


