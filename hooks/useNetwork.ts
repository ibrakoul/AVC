import { useNetworkState } from 'expo-network';

/** True when the device is known to be offline. Unknown state counts as online. */
export function useIsOffline(): boolean {
  try {
    const state = useNetworkState();
    return state.isConnected === false || state.isInternetReachable === false;
  } catch {
    return false;
  }
}
