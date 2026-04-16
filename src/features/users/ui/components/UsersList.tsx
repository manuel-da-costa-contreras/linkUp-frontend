"use client";

import { Card, Loader, SectionHeading } from "@components/ui";
import { useI18n } from "@i18n/I18nProvider";
import { useUsers } from "@features/users/ui/hooks/useUsers";

export function UsersList() {
  const { users, loading, error } = useUsers();
  const { t } = useI18n();

  function formatDate(value: Date | null) {
    if (!value) {
      return t("users.noDate");
    }

    return value.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <section className="space-y-4">
      <SectionHeading
        title={t("users.heading.title")}
        description={t("users.heading.description")}
      />

      {loading ? (
        <Card>
          <Loader centered label="" />
        </Card>
      ) : null}
      {error ? <Card className="border-red-200 text-red-700">{error}</Card> : null}

      {!loading && !error && users.length === 0 ? <Card>{t("users.empty")}</Card> : null}

      {!loading && !error ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {users.map((user) => (
            <Card key={user.id} className="space-y-1">
              <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
              <p className="text-sm text-neutral-600">{user.email || t("users.noEmail")}</p>
              <p className="text-xs uppercase tracking-wide text-neutral-500">{user.role}</p>
              <p className="text-xs text-neutral-400">
                {t("users.joinedPrefix")} {formatDate(user.createdAt)}
              </p>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}



