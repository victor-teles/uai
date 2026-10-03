"use client";

import { useState } from "react";
import {
  ResourceManager,
  ResourceManagerAction,
  ResourceManagerActions,
  ResourceManagerBody,
  ResourceManagerDelete,
  ResourceManagerDescription,
  ResourceManagerDetails,
  ResourceManagerEmpty,
  ResourceManagerForm,
  ResourceManagerHeader,
  ResourceManagerHeading,
  ResourceManagerInspector,
  ResourceManagerInspectorHeader,
  ResourceManagerInspectorTitle,
  ResourceManagerList,
  ResourceManagerRecord,
  ResourceManagerRecordMeta,
  ResourceManagerRecordStatus,
  ResourceManagerRecordTitle,
  ResourceManagerTitle,
  ResourceManagerToolbar,
  type ResourceManagerVariant,
} from "@/components/uai/resource-manager";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import {
  DataTableToolbarButton,
  DataTableToolbarSearch,
} from "@/components/ui/uai/data-table-toolbar";
import {
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import { FormField, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";

type Supplier = {
  id: string;
  name: string;
  owner: string;
  region: string;
  renewal: string;
  spend: string;
  archived: boolean;
};

const initialSuppliers: Supplier[] = [
  {
    id: "SUP-1042",
    name: "Northwind Freight",
    owner: "Priya Raman",
    region: "Rotterdam, NL",
    renewal: "Jan 14, 2027",
    spend: "$184,200",
    archived: false,
  },
  {
    id: "SUP-1057",
    name: "Halden Packaging",
    owner: "Marcus Lee",
    region: "Gothenburg, SE",
    renewal: "Nov 2, 2026",
    spend: "$62,950",
    archived: false,
  },
  {
    id: "SUP-1063",
    name: "Cobre Components",
    owner: "Ana Duarte",
    region: "Monterrey, MX",
    renewal: "Mar 30, 2027",
    spend: "$97,410",
    archived: false,
  },
  {
    id: "SUP-0988",
    name: "Lindqvist Textiles",
    owner: "Priya Raman",
    region: "Tampere, FI",
    renewal: "Ended Aug 31, 2026",
    spend: "$0",
    archived: true,
  },
];

export function ResourceManagerPreview({
  variant = "split",
}: {
  variant?: ResourceManagerVariant;
}) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [selected, setSelected] = useState("SUP-1042");
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", owner: "" });
  const query = search.trim().toLowerCase();
  const visible = suppliers.filter(
    (supplier) =>
      (showArchived || !supplier.archived) &&
      `${supplier.name} ${supplier.id}`.toLowerCase().includes(query),
  );
  const current = suppliers.find((supplier) => supplier.id === selected);
  const update = (patch: Partial<Supplier>) =>
    setSuppliers((list) =>
      list.map((supplier) => (supplier.id === selected ? { ...supplier, ...patch } : supplier)),
    );
  const inspect = (id: string) => {
    setSelected(id);
    setEditing(false);
  };
  const create = () => {
    const id = `SUP-${1100 + suppliers.length}`;
    const name = "New supplier";
    setSuppliers((list) => [
      { id, name, owner: "Unassigned", region: "—", renewal: "—", spend: "$0", archived: false },
      ...list,
    ]);
    setSelected(id);
    setDraft({ name, owner: "Unassigned" });
    setEditing(true);
  };

  return (
    <ResourceManager variant={variant} value={selected} onValueChange={inspect}>
      <ResourceManagerHeader>
        <ResourceManagerHeading>
          <ResourceManagerTitle>Suppliers</ResourceManagerTitle>
          <ResourceManagerDescription>
            {suppliers.filter((supplier) => !supplier.archived).length} active contracts ·
            Procurement EU
          </ResourceManagerDescription>
        </ResourceManagerHeading>
        <ResourceManagerActions>
          <ResourceManagerAction emphasis="primary" onClick={create}>
            New supplier
          </ResourceManagerAction>
        </ResourceManagerActions>
      </ResourceManagerHeader>
      <ResourceManagerToolbar search={search} onSearchChange={setSearch}>
        <DataTableToolbarSearch label="Search suppliers" placeholder="Search by name or ID…" />
        <DataTableToolbarButton
          aria-pressed={showArchived}
          onClick={() => setShowArchived((value) => !value)}
        >
          Show archived
        </DataTableToolbarButton>
      </ResourceManagerToolbar>
      <ResourceManagerBody>
        {visible.length ? (
          <ResourceManagerList aria-label="Suppliers">
            {visible.map((supplier) => (
              <ResourceManagerRecord key={supplier.id} value={supplier.id}>
                <ResourceManagerRecordTitle>{supplier.name}</ResourceManagerRecordTitle>
                <ResourceManagerRecordMeta>
                  {supplier.id} · {supplier.spend}
                </ResourceManagerRecordMeta>
                <ResourceManagerRecordStatus
                  tone={
                    supplier.archived
                      ? "neutral"
                      : supplier.renewal.startsWith("Nov")
                        ? "warning"
                        : "success"
                  }
                >
                  {supplier.archived
                    ? "Archived"
                    : supplier.renewal.startsWith("Nov")
                      ? "Renews soon"
                      : "Active"}
                </ResourceManagerRecordStatus>
              </ResourceManagerRecord>
            ))}
          </ResourceManagerList>
        ) : (
          <ResourceManagerEmpty style={{ flex: "999 1 320px" }}>
            <EmptyStateContent>
              <EmptyStateHeader>
                <EmptyStateTitle>No suppliers match “{search}”</EmptyStateTitle>
                <EmptyStateDescription>
                  Check the spelling or include archived suppliers.
                </EmptyStateDescription>
              </EmptyStateHeader>
            </EmptyStateContent>
          </ResourceManagerEmpty>
        )}
        {current ? (
          <ResourceManagerInspector>
            <ResourceManagerInspectorHeader>
              <ResourceManagerInspectorTitle>{current.name}</ResourceManagerInspectorTitle>
              {editing ? null : (
                <ResourceManagerActions>
                  <ResourceManagerAction
                    onClick={() => {
                      setDraft({ name: current.name, owner: current.owner });
                      setEditing(true);
                    }}
                  >
                    Edit
                  </ResourceManagerAction>
                  <ResourceManagerAction onClick={() => update({ archived: !current.archived })}>
                    {current.archived ? "Restore" : "Archive"}
                  </ResourceManagerAction>
                  <ResourceManagerDelete>
                    <ConfirmationDialogTrigger>Delete</ConfirmationDialogTrigger>
                    <ConfirmationDialogContent>
                      <ConfirmationDialogTitle>Delete {current.name}?</ConfirmationDialogTitle>
                      <ConfirmationDialogDescription>
                        <p style={{ margin: 0 }}>
                          Purchase orders keep their history, but the supplier record and its
                          contacts are removed.
                        </p>
                      </ConfirmationDialogDescription>
                      <ConfirmationDialogActions>
                        <ConfirmationDialogCancel>Keep supplier</ConfirmationDialogCancel>
                        <ConfirmationDialogConfirm
                          onClick={() => {
                            setSuppliers((list) => list.filter((item) => item.id !== current.id));
                            setSelected("");
                          }}
                        >
                          Delete supplier
                        </ConfirmationDialogConfirm>
                      </ConfirmationDialogActions>
                    </ConfirmationDialogContent>
                  </ResourceManagerDelete>
                </ResourceManagerActions>
              )}
            </ResourceManagerInspectorHeader>
            {editing ? (
              <ResourceManagerForm
                onSubmit={(event) => {
                  event.preventDefault();
                  update({ name: draft.name.trim() || current.name, owner: draft.owner });
                  setEditing(false);
                }}
              >
                <FormField
                  variant={variant === "compact" ? "compact" : "outlined"}
                  value={draft.name}
                  onValueChange={(name) => setDraft((value) => ({ ...value, name }))}
                  required
                >
                  <FormFieldLabel>Supplier name</FormFieldLabel>
                  <FormFieldInput name="name" />
                </FormField>
                <FormField
                  variant={variant === "compact" ? "compact" : "outlined"}
                  value={draft.owner}
                  onValueChange={(owner) => setDraft((value) => ({ ...value, owner }))}
                >
                  <FormFieldLabel>Account owner</FormFieldLabel>
                  <FormFieldInput name="owner" />
                </FormField>
                <ResourceManagerActions>
                  <ResourceManagerAction type="submit" emphasis="primary">
                    Save changes
                  </ResourceManagerAction>
                  <ResourceManagerAction onClick={() => setEditing(false)}>
                    Cancel
                  </ResourceManagerAction>
                </ResourceManagerActions>
              </ResourceManagerForm>
            ) : (
              <ResourceManagerDetails>
                <DescriptionListItem>
                  <DescriptionListTerm>Supplier ID</DescriptionListTerm>
                  <DescriptionListDetails>{current.id}</DescriptionListDetails>
                </DescriptionListItem>
                <DescriptionListItem>
                  <DescriptionListTerm>Account owner</DescriptionListTerm>
                  <DescriptionListDetails>{current.owner}</DescriptionListDetails>
                </DescriptionListItem>
                <DescriptionListItem>
                  <DescriptionListTerm>Region</DescriptionListTerm>
                  <DescriptionListDetails>{current.region}</DescriptionListDetails>
                </DescriptionListItem>
                <DescriptionListItem>
                  <DescriptionListTerm>Contract renewal</DescriptionListTerm>
                  <DescriptionListDetails>{current.renewal}</DescriptionListDetails>
                </DescriptionListItem>
                <DescriptionListItem>
                  <DescriptionListTerm>Spend, last 12 months</DescriptionListTerm>
                  <DescriptionListDetails>{current.spend}</DescriptionListDetails>
                </DescriptionListItem>
              </ResourceManagerDetails>
            )}
          </ResourceManagerInspector>
        ) : null}
      </ResourceManagerBody>
    </ResourceManager>
  );
}
