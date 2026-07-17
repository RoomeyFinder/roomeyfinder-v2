import type { useDiscovery } from "@/hooks/useDiscovery";
import type { useOnboardingFlow } from "@/hooks/useOnboardingFlow";

export type OnboardingFlow = ReturnType<typeof useOnboardingFlow>;
export type DiscoveryState = ReturnType<typeof useDiscovery>;
