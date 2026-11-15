import { router, type Href } from 'expo-router';

/** Goes back when possible (e.g. deep link opened directly), otherwise replaces with `fallback`. */
export function goBackOr(fallback: Href): void {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
