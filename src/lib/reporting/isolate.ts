/**
 * Payment fulfilment has already committed before this runs.
 * A reporting failure is logged and swallowed so checkout and entitlement
 * grants do not depend on the reporting store.
 */
export async function fulfilThenObserve<T>(
  fulfil: () => Promise<T>,
  observe: () => Promise<void>,
): Promise<T> {
  const result = await fulfil();
  try {
    await observe();
  } catch (error) {
    console.error(
      "[reporting] observation_failed",
      error instanceof Error ? error.name : "unknown",
    );
  }
  return result;
}
