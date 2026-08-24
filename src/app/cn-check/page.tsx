import { CnCheckClient } from "./cn-check-client";

export const dynamic = "force-static";

/**
 * A reachability probe the user can hand to testers in mainland China (or Iran,
 * or anywhere else behind a national filter) to answer one question we cannot
 * answer from here: which of the hosts Doppler's sideload build depends on are
 * actually reachable from there.
 *
 * The result decides where the standalone APK is hosted — a free redirect to a
 * GitHub release, or the bytes served from our own infrastructure.
 */
export default function CnCheckPage() {
  return <CnCheckClient />;
}
