'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconBrandGoogle, IconLock, IconMail, IconUser, IconPhone } from '@tabler/icons-react';
import {
  Anchor,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  Group,
  Loader,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useAuthStore } from '@/stores/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '+237',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: true,
  });

  useEffect(() => {
    const checkAuthentication = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    checkAuthentication();
  }, [checkAuth]);

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      router.push('/account');
    }
  }, [authChecked, isAuthenticated, router]);

  if (!authChecked || isLoading) {
    return (
      <Container size="sm" py="xl">
        <Stack gap="lg" align="center">
          <Loader size="lg" />
          <Text>Loading...</Text>
        </Stack>
      </Container>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      await register({
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      // Add a small delay to ensure auth state is persisted
      await new Promise(resolve => setTimeout(resolve, 500));

      router.push('/account');
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg" align="center">
        <div style={{ textAlign: 'center' }}>
          <Title order={1} mb="xs">
            Create Account
          </Title>
          <Text size="lg" c="dimmed">
            Join DumperShop for the best shopping experience
          </Text>
        </div>

        <Card padding="xl" radius="md" withBorder style={{ width: '100%', maxWidth: 400 }}>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {error && (
                <Text color="red" size="sm">
                  {error}
                </Text>
              )}

              <Group grow>
                <TextInput
                  label="First Name"
                  placeholder="John"
                  leftSection={<IconUser size={16} />}
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
                <TextInput
                  label="Last Name"
                  placeholder="Doe"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </Group>

              <TextInput
                label="Phone Number"
                placeholder="678338760"
                leftSection={<IconPhone size={16} />}
                required
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  // Ensure the calling code is always present
                  if (value.startsWith('+237')) {
                    handleInputChange('phone', value);
                  } else if (value === '') {
                    handleInputChange('phone', '+237');
                  } else {
                    handleInputChange('phone', '+237' + value);
                  }
                }}
              />



              <PasswordInput
                label="Password"
                placeholder="Create a password"
                leftSection={<IconLock size={16} />}
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                leftSection={<IconLock size={16} />}
                required
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />

              <Checkbox
                label="I agree to the Terms of Service and Privacy Policy"
                required
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.currentTarget.checked)}
              />

              <Checkbox
                label="Subscribe to our newsletter for exclusive deals"
                checked={formData.subscribeNewsletter}
                onChange={(e) => handleInputChange('subscribeNewsletter', e.currentTarget.checked)}
              />

              <Button type="submit" size="lg" color="purple" fullWidth loading={loading}>
                Create Account
              </Button>
            </Stack>
          </form>

          <Divider label="or" labelPosition="center" my="lg" />

          <Button variant="outline" size="lg" fullWidth leftSection={<IconBrandGoogle size={16} />}>
            Continue with Google
          </Button>

          <Text size="sm" c="dimmed" ta="center" mt="md">
            Already have an account?{' '}
            <Anchor component={Link} href="/login" fw={600}>
              Sign in
            </Anchor>
          </Text>
        </Card>

        <Text size="sm" c="dimmed" ta="center">
          By creating an account, you agree to our{' '}
          <Anchor component={Link} href="/terms">
            Terms of Service
          </Anchor>{' '}
          and{' '}
          <Anchor component={Link} href="/privacy">
            Privacy Policy
          </Anchor>
        </Text>
      </Stack>
    </Container>
  );
}
