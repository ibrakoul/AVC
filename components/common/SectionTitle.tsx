import { AppText } from './AppText';

export function SectionTitle({ children }: { children: string }) {
  return <AppText variant="heading">{children}</AppText>;
}
