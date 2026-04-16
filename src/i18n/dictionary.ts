import { authEn } from "@i18n/locales/en/auth";
import { clientsEn } from "@i18n/locales/en/clients";
import { commonEn } from "@i18n/locales/en/common";
import { dashboardEn } from "@i18n/locales/en/dashboard";
import { jobsEn } from "@i18n/locales/en/jobs";
import { navigationEn } from "@i18n/locales/en/navigation";
import { notificationsEn } from "@i18n/locales/en/notifications";
import { userMenuEn } from "@i18n/locales/en/user-menu";
import { usersEn } from "@i18n/locales/en/users";
import { authEs } from "@i18n/locales/es/auth";
import { clientsEs } from "@i18n/locales/es/clients";
import { commonEs } from "@i18n/locales/es/common";
import { dashboardEs } from "@i18n/locales/es/dashboard";
import { jobsEs } from "@i18n/locales/es/jobs";
import { navigationEs } from "@i18n/locales/es/navigation";
import { notificationsEs } from "@i18n/locales/es/notifications";
import { userMenuEs } from "@i18n/locales/es/user-menu";
import { usersEs } from "@i18n/locales/es/users";
import type { Locale, LocaleDictionary } from "@i18n/types";

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


