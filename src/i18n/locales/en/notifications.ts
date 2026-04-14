import type { TranslationNamespace } from "../../types";

export const notificationsEn: TranslationNamespace = {
  "errors.load": "Failed to load notifications.",
  "errors.dismiss": "Failed to dismiss notification.",
  "errors.dismissAll": "Failed to clear notifications.",
  "errors.unauthorized": "You are not authenticated for this action.",
  "errors.forbidden": "You do not have permission to manage notifications.",
  "errors.notificationNotFound": "Notification not found or already dismissed (field: {{field}}).",
  "errors.validation": "Validation error on '{{field}}'. Reason: {{reason}}.",
  "errors.internal": "Internal error while processing notifications.",
  "fields.notificationId": "notification id",
  "fields.orgId": "organization",
  "fields.type": "notification type",
  "fields.unknown": "unknown field",
  "reasons.invalid_enum": "invalid value",
  "reasons.required": "required field",
  "reasons.unknown": "unknown reason",
};
