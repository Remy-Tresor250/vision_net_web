"use client";

import {
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import {
  HiOutlineArrowDownTray,
  HiOutlineDocumentArrowUp,
} from "react-icons/hi2";

import { getApiErrorMessage } from "@/lib/api/client";
import {
  agentExampleCsv,
  clientExampleCsv,
  previewCsvFile,
  type CsvPreview,
} from "@/lib/csv";
import {  downloadText } from "@/lib/download";
import {
  useImportAgentsMutation,
  useImportClientsMutation,
} from "@/lib/query/hooks";

interface Props {
  kind: "agents" | "clients";
  onImported?: () => void;
}

export default function ImportUsersModal({ kind, onImported }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const importAgents = useImportAgentsMutation();
  const importClients = useImportClientsMutation();
  const mutation = kind === "agents" ? importAgents : importClients;
  const isClients = kind === "clients";

  const dropzone = useDropzone({
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxFiles: 1,
    onDrop: async ([acceptedFile]) => {
      if (!acceptedFile) return;

      setFile(acceptedFile);
      setPreview(null);

      if (acceptedFile.name.toLowerCase().endsWith(".csv")) {
        setPreview(await previewCsvFile(acceptedFile));
      }
    },
  });

  function close() {
    setFile(null);
    setPreview(null);
  }

  function downloadExample() {
    downloadText(
      isClients ? clientExampleCsv : agentExampleCsv,
      `${kind}-example.csv`,
    );
  }

  function upload() {
    if (!file) {
      toast.error("Choose a CSV or XLSX file first.");
      return;
    }

    mutation.mutate(file, {
      onError: (error) => toast.error(getApiErrorMessage(error)),
      onSuccess: (report) => {
        toast.success(
          `${report.successCount} imported, ${report.failedCount} failed.`,
        );
        close();
        onImported?.();
      },
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[15px] font-semibold text-foreground">
          Import en masse
        </p>
        <p className="mt-1 text-[13px] text-text-muted">
          Ajoutez plusieurs {isClients ? "clients" : "agents"} avec un fichier
          CSV ou Excel.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={downloadExample}
          className="flex flex-row items-center gap-[4px] px-[12px] py-[6px] bg-brand rounded-[6px]"
        >
          <HiOutlineArrowDownTray className="size-4" color="white" />
          <p className="text-white text-[13px]">Exemple CSV</p>
        </button>
      </div>

      <div
        {...dropzone.getRootProps()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-border bg-surface-muted px-6 py-6 text-center transition-colors hover:border-brand"
      >
        <input {...dropzone.getInputProps()} />
        <div className="flex size-12 items-center justify-center rounded-md bg-surface text-text-muted">
          <HiOutlineDocumentArrowUp className="size-6" />
        </div>
        <p className="mt-4 text-[15px] font-semibold text-foreground">
          {file ? file.name : "Importer"}
        </p>
        <p className="mt-2 max-w-md text-[13px] leading-6 text-text-muted">
          CSV et XLSX uniquement. Les fichiers CSV peuvent etre verifies avant
          l&apos;envoi.
        </p>
      </div>

      {preview ? (
        <div className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border bg-surface-muted px-4 py-3">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-foreground">
              Apercu de {preview.rows.length} sur {preview.totalRows} lignes
            </p>
          </div>
          <TableScrollContainer minWidth={760} maxHeight={500}>
            <Table>
              <TableThead>
                <TableTr>
                  {preview.headers.map((header) => (
                    <TableTh
                      className="px-4 py-3 text-[12px] uppercase text-text-muted"
                      key={header}
                    >
                      {header}
                    </TableTh>
                  ))}
                </TableTr>
              </TableThead>
              <TableTbody>
                {preview.rows.map((row, rowIndex) => (
                  <TableTr key={rowIndex}>
                    {preview.headers.map((header, cellIndex) => (
                      <TableTd
                        className="px-4 py-3 text-[12px] text-text-muted"
                        key={`${header}-${cellIndex}`}
                      >
                        {row[cellIndex] || "-"}
                      </TableTd>
                    ))}
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </TableScrollContainer>
        </div>
      ) : null}

      <div className="flex justify-end gap-3">
        <button
          disabled={!file || mutation.isPending}
          onClick={upload}
          className="flex flex-row items-center gap-[4px] px-[12px] py-[6px] bg-brand rounded-[6px]"
        >
          <p className="text-[13px] text-white">
            {mutation.isPending ? "Importation..." : "Importer le fichier"}
          </p>
        </button>
      </div>
    </div>
  );
}
