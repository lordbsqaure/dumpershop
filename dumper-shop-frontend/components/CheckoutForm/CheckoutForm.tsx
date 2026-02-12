'use client';

import { useState, useEffect } from 'react';
import { IconFlag } from '@tabler/icons-react';
import { Button, Card, Divider, Group, Select, Stack, Text, TextInput, Title, PasswordInput, Alert } from '@mantine/core';
import { useAuthStore } from '@/stores/auth-store';

interface CheckoutFormProps {
  onSubmit: (data: CheckoutData) => void;
  loading?: boolean;
}

export interface CheckoutData {
  shipping: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  deliveryMethod: string;
  paymentMethod: string;
  password?: string; // Optional password for new users
}

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
];

const states = [
  { value: 'centre', label: 'Centre' },
  { value: 'littoral', label: 'Littoral' },
  { value: 'north-west', label: 'North-West' },
  { value: 'south-west', label: 'South-West' },
  { value: 'west', label: 'West' },
  { value: 'north', label: 'North' },
  { value: 'far-north', label: 'Far-North' },
  { value: 'east', label: 'East' },
  { value: 'south', label: 'South' },
  { value: 'adamawa', label: 'Adamawa' },
];

const deliveryMethods = [
  { value: 'standard', label: 'Standard Shipping (3-5 days) - $9.99' },
  { value: 'express', label: 'Express Shipping (1-2 days) - $19.99' },
  { value: 'overnight', label: 'Overnight Shipping - $29.99' },
];

export function CheckoutForm({ onSubmit, loading = false }: CheckoutFormProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState<CheckoutData>({
    shipping: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      country: 'Cameroon',
    },
    deliveryMethod: 'standard',
    paymentMethod: 'cod', // Cash on Delivery as default
    password: '',
  });

  // Initialize form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        shipping: {
          ...prev.shipping,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          phone: user.phone || '',
          email: user.email || '',
        },
      }));
    }
  }, [isAuthenticated, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateShipping = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      shipping: { ...prev.shipping, [field]: value },
    }));
  };

  const handlePhoneChange = (value: string) => {
    // Remove any existing +237 and non-numeric characters, then add +237 back
    const cleaned = value.replace(/^\+237/, '').replace(/\D/g, '');
    const formatted = '+237' + cleaned;
    updateShipping('phone', formatted);
  };

  const displayPhoneValue = () => {
    const phone = formData.shipping.phone;
    // Only show the numbers after +237 since +237 is already shown as prefix
    return phone.replace(/^\+237/, '');
  };

  const renderPhoneInput = () => {
    const value = displayPhoneValue();
    return (
      <TextInput
        label="Phone"
        placeholder="6XX XXX XXX"
        required
        value={value}
        onChange={(e) => handlePhoneChange(e.target.value)}
        leftSection={`   +237`}
        styles={{
          input: {
            fontFamily: 'monospace',
            paddingLeft: '60px',
          },
          section: {
            fontSize: '14px',
            fontWeight: 600,
            color: '#666',
            padding: '0 12px 0 26px',
          },
        }}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="xl">
        {/* Shipping Information */}
        <Card padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">
            Shipping Information
          </Title>

          <Stack gap="md">
            {!isAuthenticated && (
              <Group grow>
                <TextInput
                  label="First Name"
                  placeholder="John"
                  required
                  value={formData.shipping.firstName}
                  onChange={(e) => updateShipping('firstName', e.target.value)}
                />
                <TextInput
                  label="Last Name"
                  placeholder="Doe"
                  required
                  value={formData.shipping.lastName}
                  onChange={(e) => updateShipping('lastName', e.target.value)}
                />
              </Group>
            )}

            {renderPhoneInput()}

            <TextInput
              label="Email"
              placeholder="your.email@example.com"
              required
              value={formData.shipping.email}
              onChange={(e) => updateShipping('email', e.target.value)}
            />

            <TextInput
              label="Address"
              placeholder="123 Main Street"
              required
              value={formData.shipping.address}
              onChange={(e) => updateShipping('address', e.target.value)}
            />

            <Group grow>
              <TextInput
                label="Town"
                placeholder="Douala"
                required
                value={formData.shipping.city}
                onChange={(e) => updateShipping('city', e.target.value)}
              />
              <Select
                label="Region"
                placeholder="Select region"
                data={states}
                required
                value={formData.shipping.state}
                onChange={(value) => value && updateShipping('state', value)}
              />
            </Group>

            <TextInput
              label="Country"
              value="Cameroon"
              readOnly
              styles={{
                input: {
                  backgroundColor: '#f8f9fa',
                  cursor: 'not-allowed',
                },
              }}
            />
          </Stack>
        </Card>

        {/* Delivery Method */}
        <Card padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">
            Delivery Method
          </Title>

          <TextInput
            label="Shipping Method"
            value="Standard Shipping"
            readOnly
            styles={{
              input: {
                backgroundColor: '#f8f9fa',
                cursor: 'not-allowed',
              },
            }}
          />
        </Card>

        {/* Payment Method */}
        <Card padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">
            Payment Method
          </Title>

          <Stack gap="sm">
            <Select
              label="Select Payment Method"
              data={[
                { value: 'cod', label: 'Pay on Delivery (Cash)' },
              ]}
              value={formData.paymentMethod}
              onChange={(value) => value && setFormData((prev) => ({ ...prev, paymentMethod: value }))}
              required
            />
            <Text size="sm" c="dimmed">
              You will pay in cash when your order is delivered.
            </Text>
          </Stack>
        </Card>

        {/* Account Information - Only for non-logged in users */}
        {!isAuthenticated && (
          <Card padding="lg" radius="md" withBorder>
            <Title order={4} mb="md">
              Create Account
            </Title>
            <Alert color="blue" mb="md" title="Create an account">
              Enter a password to create an account and track your orders.
            </Alert>
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            />
          </Card>
        )}

        {/* Submit Button */}
        <Button type="submit" size="lg" color="purple" fullWidth loading={loading}>
          Complete Order
        </Button>
      </Stack>
    </form>
  );
}
