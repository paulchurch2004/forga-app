// Hook wrapper React Query pour `fetchPartnerOffers`.
// Cache : 5 min — les offres bougent rarement, pas besoin de re-fetch
// à chaque mount du tab. L'admin peut toujours forcer un refresh via
// le pull-to-refresh côté UI.

import { useQuery } from '@tanstack/react-query';
import { fetchPartnerOffers, type PartnerOffer } from '../services/partnersOffers';

export function usePartnerOffers() {
  return useQuery<PartnerOffer[]>({
    queryKey: ['partner-offers'],
    queryFn: fetchPartnerOffers,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 30 * 60 * 1000,   // garde en mémoire 30 min
  });
}
