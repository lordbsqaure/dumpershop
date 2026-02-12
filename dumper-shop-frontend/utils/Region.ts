import { sdk } from '@/stores/lib/sdk';

export const fetchRegions = async () => {
  try {
    const { regions } = await sdk.store.region.list();
    return regions;
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
};

export const currentRegionId = async (): Promise<string | null> => {
  const regions = await fetchRegions();
  // First try to find a region with XAF currency that includes Cameroon
  const region = regions.find((r: any) => 
    r.currency_code === 'xaf' && 
    r.countries?.some((c: any) => c.iso_2 === 'CM')
  );

  if (region) {
    console.log('Found region with XAF and Cameroon:', region.id);
    return region.id;
  }

  // Fallback to any region with XAF currency
  const xafRegion = regions.find((r: any) => r.currency_code === 'xaf');
  if (xafRegion) {
    console.log('Found region with XAF currency:', xafRegion.id);
    return xafRegion.id;
  }

  console.error('No suitable region found');
  return null;
};
