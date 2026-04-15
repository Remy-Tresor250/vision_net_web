import { Skeleton, TableTd, TableTr } from "@mantine/core";

interface Props {
  columns: number;
  rows: number;
}

export default function TableSkeletonRows({ columns, rows }: Props) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableTr
          className="border-b border-border last:border-b-0"
          key={rowIndex}
        >
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <TableTd className="px-8 py-6" key={cellIndex}>
              <Skeleton
                animate
                className="block h-5 min-h-5 w-full min-w-20 rounded-sm"
              />
            </TableTd>
          ))}
        </TableTr>
      ))}
    </>
  );
}
