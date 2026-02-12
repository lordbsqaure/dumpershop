import { sdk } from '@/stores/lib/sdk';
import { currentRegionId } from './Region';

export interface PaymentProvider {
  id: string;
  name: string;
  displayName: string;
  icon?: string;
  enabled: boolean;
  supportsRecurring?: boolean;
  supportsRefunds?: boolean;
}

export async function listPaymentProviders(): Promise<PaymentProvider[]> {
  try {
    const { payment_providers } = await sdk.store.payment.listPaymentProviders({
      region_id: await currentRegionId(),
    });
    console.log('Fetched payment providers:', payment_providers);
    return payment_providers.map((provider: any) => ({
      id: provider.id,
      name: provider.id,
      displayName: provider.id.charAt(0).toUpperCase() + provider.id.slice(1),
      enabled: provider.is_installed,
      supportsRecurring: false,
      supportsRefunds: true,
    }));
  } catch (error) {
    console.error('Error fetching payment providers:', error);
    return [];
  }
}

export async function getPaymentProviderById(id: string): Promise<PaymentProvider | undefined> {
  const providers = await listPaymentProviders();
  return providers.find((provider) => provider.id === id);
}
