/** @format */

import { useSyncExternalStore } from "react";

/**
 * Returns false on the server and true on the client after hydration.
 * Drop-in replacement for the `useState(false)` + `useEffect(setMounted, [])`
 * pattern, without violating react-hooks/set-state-in-effect.
 *
 * Behavior mirrors the original two-render SSR pattern:
 *   - Server / hydration render  → false  (getServerSnapshot)
 *   - After hydration            → true   (React deferred update)
 */
export function useIsMounted(): boolean {
	return useSyncExternalStore(
		() => () => {}, // subscribe: value is constant after mount, no-op
		() => true, // getSnapshot: always true on the client
		() => false, // getServerSnapshot: always false on the server
	);
}
