import { authEn } from "./locales/en/auth";
import { clientsEn } from "./locales/en/clients";
import { commonEn } from "./locales/en/common";
import { dashboardEn } from "./locales/en/dashboard";
import { jobsEn } from "./locales/en/jobs";
import { navigationEn } from "./locales/en/navigation";
import { notificationsEn } from "./locales/en/notifications";
import { userMenuEn } from "./locales/en/user-menu";
import { usersEn } from "./locales/en/users";
import { authEs } from "./locales/es/auth";
import { clientsEs } from "./locales/es/clients";
import { commonEs } from "./locales/es/common";
import { dashboardEs } from "./locales/es/dashboard";
import { jobsEs } from "./locales/es/jobs";
import { navigationEs } from "./locales/es/navigation";
import { notificationsEs } from "./locales/es/notifications";
import { userMenuEs } from "./locales/es/user-menu";
import { usersEs } from "./locales/es/users";
import type { Locale, LocaleDictionary } from "./types";

export const dictionaries: Record<Locale, LocaleDictionary> = {
  es: {
    auth: authEs,
    common: commonEs,
    navigation: navigationEs,
    userMenu: userMenuEs,
    dashboard: dashboardEs,
    clients: clientsEs,
    users: usersEs,
    jobs: jobsEs,
    notifications: notificationsEs,
  },
  en: {
    auth: authEn,
    common: commonEn,
    navigation: navigationEn,
    userMenu: userMenuEn,
    dashboard: dashboardEn,
    clients: clientsEn,
    users: usersEn,
    jobs: jobsEn,
    notifications: notificationsEn,
  },
};
