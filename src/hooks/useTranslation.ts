import { useRouter } from "next/router";
import { en } from "../locales/en";
import { id } from "../locales/id";

/**
 * Custom hook to manage type-safe multi-language translations.
 * Reads the active locale from Next.js router.
 */
export function useTranslation() {
  const router = useRouter();
  const { locale } = router;
  const t = locale === "id" ? id : en;
  return { t, locale, router };
}

export default useTranslation;
