export function ProtocolTable({
  headers,
  rows,
  highlightKey,
}: {
  headers: string[];
  rows: { key: string; cells: string[] }[];
  highlightKey?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-overlay/10 bg-bg-secondary/40">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-overlay/10">
            {headers.map((header) => (
              <th key={header} scope="col" className="text-start p-4 font-medium text-text-muted whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const hot = row.key === highlightKey;
            return (
              <tr
                key={row.key}
                className={`${i < rows.length - 1 ? "border-t border-overlay/5" : ""} ${hot ? "bg-accent-teal/5" : ""}`}
              >
                {row.cells.map((cell, ci) => {
                  const Tag = ci === 0 ? "th" : "td";
                  return (
                    <Tag
                      key={`${row.key}-${ci}`}
                      scope={ci === 0 ? "row" : undefined}
                      className={`p-4 whitespace-nowrap ${
                        ci === 0
                          ? `text-start font-medium ${hot ? "text-accent-teal" : "text-text-primary"}`
                          : hot
                            ? "text-accent-teal font-medium"
                            : "text-text-muted"
                      }`}
                    >
                      {cell}
                    </Tag>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
