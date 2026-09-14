const ITEMS = ["email", "phone", "name", "browsingHistory", "ipLogs", "connectionTimestamps"] as const;

export type CollectItemKey = (typeof ITEMS)[number];

function CollectIcon({ item }: { item: CollectItemKey }) {
  const common = {
    className: "w-5 h-5",
    fill: "none" as const,
    viewBox: "0 0 24 24",
    strokeWidth: 1.75,
    stroke: "currentColor",
    "aria-hidden": true as const,
  };

  if (item === "email") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    );
  }
  if (item === "phone") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    );
  }
  if (item === "name") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    );
  }
  if (item === "browsingHistory") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    );
  }
  if (item === "ipLogs") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-3.694 4.5-8.25S14.485 4.5 12 4.5 7.5 8.194 7.5 12.75 9.515 21 12 21Zm0-16.5a9.004 9.004 0 0 1 8.716 6.747M12 4.5a9.004 9.004 0 0 0-8.716 6.747" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

export function CollectItem({
  item,
  label,
  never,
}: {
  item: CollectItemKey;
  label: string;
  never: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-overlay/10 bg-bg-secondary/40 px-4 py-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-teal/20 bg-bg-secondary/80 text-accent-teal">
        <CollectIcon item={item} />
      </span>
      <div className="min-w-0 text-start">
        <h3 className="text-sm font-semibold leading-tight text-text-primary">{label}</h3>
        <p className="mt-0.5 text-xs text-text-muted">{never}</p>
      </div>
    </div>
  );
}
