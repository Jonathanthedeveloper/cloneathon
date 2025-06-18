"use client"
import { useMediaQuery } from "@uidotdev/usehooks"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT }px)`)
  return isMobile
}
