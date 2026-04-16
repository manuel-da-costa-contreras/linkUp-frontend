"use client";

import { FormEvent, useMemo, useState } from "react";
import { Card, Loader, Modal, SectionHeading, TablePagination, TableSortHeader } from "@components/ui";
import { useI18n } from "@i18n/I18nProvider";
import { useAuth } from "@lib/auth";
import type { Client } from "@features/clients/domain/entities/Client";
import type { ClientSortBy } from "@features/clients/domain/repositories/ClientRepository";
import { useClients } from "@features/clients/ui/hooks/useClients";

type ClientsTableProps = {
  orgId: string;
};

export function ClientsTable({ orgId }: ClientsTableProps) {
  const { t } = useI18n();
  const { canManageClients } = useAuth();
  const {
    search,
    setSearch,
    sortBy,
    sortDir,
    toggleSort,
    pagination,
    pageSizeOptions,
    setPage,
    setPageSize,
    clients,
    loading,
    error,
    creating,
    createError,
    createClient,
    editing,
    editError,
    updateClient,
    deletingClientId,
    deleteError,
    deleteClient,
  } = useClients(orgId);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editClientName, setEditClientName] = useState("");
  const [editNameError, setEditNameError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetClient, setDeleteTargetClient] = useState<Client | null>(null);

  const canSubmit = useMemo(() => newClientName.trim().length >= 2 && !creating, [creating, newClientName]);
  const canEditSubmit = useMemo(() => editClientName.trim().length >= 2 && !editing, [editClientName, editing]);

  function handleCloseAddModal() {
    if (creating) {
      return;
    }

    setAddModalOpen(false);
    setNewClientName("");
    setNameError(null);
  }

  function openEditModal(client: Client) {
    setEditingClient(client);
    setEditClientName(client.name);
    setEditNameError(null);
    setEditModalOpen(true);
  }

  function handleCloseEditModal() {
    if (editing) {
      return;
    }

    setEditModalOpen(false);
    setEditingClient(null);
    setEditClientName("");
    setEditNameError(null);
  }

  async function handleCreateSubmit(event: FormEvent) {
    event.preventDefault();

    const normalized = newClientName.trim();
    if (normalized.length < 2) {
      setNameError(t("clients.modal.validation.nameMin"));
      return;
    }

    const ok = await createClient(normalized);
    if (ok) {
      handleCloseAddModal();
    }
  }

  async function handleEditSubmit(event: FormEvent) {
    event.preventDefault();

    if (!editingClient) {
      return;
    }

    const normalized = editClientName.trim();
    if (normalized.length < 2) {
      setEditNameError(t("clients.modal.validation.nameMin"));
      return;
    }

    const ok = await updateClient(editingClient.id, normalized);
    if (ok) {
      handleCloseEditModal();
    }
  }

  function openDeleteModal(client: Client) {
    setDeleteTargetClient(client);
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (deleteTargetClient && deletingClientId === deleteTargetClient.id) {
      return;
    }

    setDeleteModalOpen(false);
    setDeleteTargetClient(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTargetClient) {
      return;
    }

    const ok = await deleteClient(deleteTargetClient.id);
    if (ok) {
      closeDeleteModal();
    }
  }

  function renderSortHeader(label: string, field: ClientSortBy) {
    return (
      <TableSortHeader
        label={label}
        active={sortBy === field}
        direction={sortBy === field ? sortDir : "asc"}
        onToggle={() => toggleSort(field)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading title={t("clients.heading.title")} description={t("clients.heading.description")} />

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("clients.search.placeholder")}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition-colors focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
            />
          </div>
          <button
            type="button"
            disabled={!canManageClients}
            onClick={() => setAddModalOpen(true)}
            title={!canManageClients ? t("auth.errors.forbiddenMutation") : undefined}
            className="h-10 rounded-lg bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
          >
            {t("clients.actions.add")}
          </button>
        </div>

        {loading ? (
          <Loader centered label="" />
        ) : error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : (
          <>
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="py-3 pr-3 font-medium">{renderSortHeader(t("clients.table.column.name"), "name")}</th>
                    <th className="py-3 px-3 font-medium">{renderSortHeader(t("clients.table.column.totalJobs"), "totalJobs")}</th>
                    <th className="py-3 px-3 font-medium">{renderSortHeader(t("clients.table.column.pending"), "pendingJobs")}</th>
                    <th className="py-3 px-3 font-medium">
                      {renderSortHeader(t("clients.table.column.inProgress"), "inProgressJobs")}
                    </th>
                    <th className="py-3 px-3 font-medium">
                      {renderSortHeader(t("clients.table.column.completed"), "completedJobs")}
                    </th>
                    <th className="py-3 pl-3 text-right font-medium">&nbsp;</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-neutral-100 text-neutral-700 last:border-b-0">
                      <td className="py-3 pr-3 font-medium text-primary-700">
                        {canManageClients ? (
                          <button
                            type="button"
                            onClick={() => openEditModal(client)}
                            className="rounded px-1 py-0.5 text-left underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                          >
                            {client.name}
                          </button>
                        ) : (
                          <span className="px-1 py-0.5 text-neutral-900">{client.name}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">{client.totalJobs}</td>
                      <td className="py-3 px-3">{client.pendingJobs}</td>
                      <td className="py-3 px-3">{client.inProgressJobs}</td>
                      <td className="py-3 px-3">{client.completedJobs}</td>
                      <td className="py-3 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => openDeleteModal(client)}
                          data-testid="client-row-delete"
                          disabled={deletingClientId === client.id || !canManageClients}
                          title={!canManageClients ? t("auth.errors.forbiddenMutation") : t("clients.tooltip.delete")}
                          aria-label={t("clients.tooltip.delete")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                            <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clients.length === 0 ? <p className="py-4 text-sm text-neutral-500">{t("clients.table.empty")}</p> : null}
              {deleteError ? <p className="pt-2 text-xs text-red-700">{deleteError}</p> : null}

              {deletingClientId ? (
                <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-white/70 backdrop-blur-[2px]">
                  <Loader centered label={t("clients.modal.status.deleting")} />
                </div>
              ) : null}
            </div>

            <TablePagination
              pagination={pagination}
              pageSizeOptions={pageSizeOptions}
              disabled={loading}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </Card>

      <Modal
        open={addModalOpen}
        title={t("clients.modal.create.title")}
        onClose={handleCloseAddModal}
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseAddModal}
               className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
            >
              {t("common.actions.cancel")}
            </button>
            <button
              type="submit"
              form="create-client-form"
              disabled={!canSubmit}
               className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? t("clients.modal.status.creating") : t("common.actions.accept")}
            </button>
          </>
        }
      >
        <form id="create-client-form" onSubmit={handleCreateSubmit} className="space-y-3">
          <label className="block text-sm font-medium text-neutral-700" htmlFor="client-name-input">
            {t("clients.modal.field.name")}
          </label>
          <input
            id="client-name-input"
            value={newClientName}
            onChange={(event) => {
              setNewClientName(event.target.value);
              if (nameError) {
                setNameError(null);
              }
            }}
            placeholder={t("clients.modal.field.placeholder")}
            className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-800 outline-none transition-colors focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
          />
          {nameError ? <p className="text-xs text-red-700">{nameError}</p> : null}
          {createError ? <p className="text-xs text-red-700">{createError}</p> : null}
        </form>
      </Modal>

      <Modal
        open={editModalOpen}
        title={t("clients.modal.edit.title")}
        onClose={handleCloseEditModal}
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseEditModal}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
            >
              {t("common.actions.cancel")}
            </button>
            <button
              type="submit"
              form="edit-client-form"
              disabled={!canEditSubmit}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editing ? t("clients.modal.status.saving") : t("common.actions.accept")}
            </button>
          </>
        }
      >
        <form id="edit-client-form" onSubmit={handleEditSubmit} className="space-y-3">
          <label className="block text-sm font-medium text-neutral-700" htmlFor="edit-client-name-input">
            {t("clients.modal.field.name")}
          </label>
          <input
            id="edit-client-name-input"
            value={editClientName}
            onChange={(event) => {
              setEditClientName(event.target.value);
              if (editNameError) {
                setEditNameError(null);
              }
            }}
            placeholder={t("clients.modal.field.placeholder")}
            className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-800 outline-none transition-colors focus:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
          />
          {editNameError ? <p className="text-xs text-red-700">{editNameError}</p> : null}
          {editError ? <p className="text-xs text-red-700">{editError}</p> : null}
        </form>
      </Modal>

      <Modal
        open={deleteModalOpen}
        title={t("clients.modal.delete.title")}
        onClose={closeDeleteModal}
        testId="client-delete-modal"
        footer={
          <>
            <button
              type="button"
              onClick={closeDeleteModal}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
            >
              {t("common.actions.cancel")}
            </button>
            <button
              type="button"
              onClick={() => void handleConfirmDelete()}
              data-testid="client-delete-confirm"
              disabled={!deleteTargetClient || deletingClientId === deleteTargetClient?.id}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteTargetClient && deletingClientId === deleteTargetClient.id
                ? t("clients.modal.status.deleting")
                : t("common.actions.delete")}
            </button>
          </>
        }
      >
        {deleteTargetClient ? (
          <div className="space-y-2">
            <p className="text-sm text-neutral-700">
              {t("clients.modal.delete.description", { name: deleteTargetClient.name })}
            </p>
            <p className="text-xs text-neutral-500">
              {deleteTargetClient.totalJobs > 0
                ? t("clients.modal.delete.withJobs", { total: deleteTargetClient.totalJobs })
                : t("clients.modal.delete.withoutJobs")}
            </p>
            {deleteError ? <p className="pt-1 text-xs text-red-700">{deleteError}</p> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}





