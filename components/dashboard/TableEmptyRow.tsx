import { TableTd, TableTr } from "@mantine/core";

import NoDataCard from "@/components/dashboard/NoDataCard";

interface Props {
  colSpan: number;
  title?: string;
  message?: string;
}

export default function TableEmptyRow({ colSpan, message, title }: Props) {
  return (
    <TableTr>
      <TableTd className="px-6 py-8" colSpan={colSpan}>
        <NoDataCard message={message} title={title} />
      </TableTd>
    </TableTr>
  );
}
