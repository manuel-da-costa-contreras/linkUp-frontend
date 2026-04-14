"use client";

import { FormEvent, useMemo, useState } from "react";
import { Card, Loader, Modal, SectionHeading, TablePagination, TableSortHeader } from "@/components/ui";
import { useI18n } from "@/i18n/I18nProvider";
import type { Client } from "../../domain/entities/Client";
import type { ClientSortBy } from "../../domain/repositories/ClientRepository";
import { useClients } from "../hooks/useClients";

type ClientsTableProps = {
  orgId: string;
};

export function ClientsTable({ orgId }: ClientsTableProps) {
  const { t } = useI18n();
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

  async function handleDelete(clientId: string) {
    await deleteClient(clientId);
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
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition-colors focus:border-cyan-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="h-10 rounded-lg bg-cyan-600 px-4 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-zinc-500">
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
                    <tr key={client.id} className="border-b border-zinc-100 text-zinc-700 last:border-b-0">
                      <td className="py-3 pr-3 font-medium text-cyan-700">
                        <button
                          type="button"
                          onClick={() => openEditModal(client)}
                          className="rounded px-1 py-0.5 text-left underline-offset-2 hover:underline"
                        >
                          {client.name}
                        </button>
                      </td>
                      <td className="py-3 px-3">{client.totalJobs}</td>
                      <td className="py-3 px-3">{client.pendingJobs}</td>
                      <td className="py-3 px-3">{client.inProgressJobs}</td>
                      <td className="py-3 px-3">{client.completedJobs}</td>
                      <td className="py-3 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(client.id)}
                          disabled={deletingClientId === client.id}
                          title={t("clients.tooltip.delete")}
                          aria-label={t("clients.tooltip.delete")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
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
              {clients.length === 0 ? <p className="py-4 text-sm text-zinc-500">{t("clients.table.empty")}</p> : null}
              {deleteError ? <p className="pt-2 text-xs text-red-700">{deleteError}</p> : null}
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
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              {t("common.actions.cancel")}
            </button>
            <button
              type="submit"
              form="create-client-form"
              disabled={!canSubmit}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? t("clients.modal.status.creating") : t("common.actions.accept")}
            </button>
          </>
        }
      >
        <form id="create-client-form" onSubmit={handleCreateSubmit} className="space-y-3">
          <label className="block text-sm font-medium text-zinc-700" htmlFor="client-name-input">
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
            className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800 outline-none transition-colors focus:border-cyan-500"
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
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              {t("common.actions.cancel")}
            </button>
            <button
              type="submit"
              form="edit-client-form"
              disabled={!canEditSubmit}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editing ? t("clients.modal.status.saving") : t("common.actions.accept")}
            </button>
          </>
        }
      >
        <form id="edit-client-form" onSubmit={handleEditSubmit} className="space-y-3">
          <label className="block text-sm font-medium text-zinc-700" htmlFor="edit-client-name-input">
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
            className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm text-zinc-800 outline-none transition-colors focus:border-cyan-500"
          />
          {editNameError ? <p className="text-xs text-red-700">{editNameError}</p> : null}
          {editError ? <p className="text-xs text-red-700">{editError}</p> : null}
        </form>
      </Modal>
    </div>
  );
}

