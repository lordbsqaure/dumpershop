'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconBrandGoogle, IconLock, IconPhone } from '@tabler/icons-react';
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
import { sdk } from '@/stores/lib/sdk';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [formData, setFormData] = useState({
    phone: '+237',
    password: '',
    rememberMe: false,
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

    if (!formData.phone || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Remove calling code from phone number before login
      const cleanPhone = formData.phone.replace(/^\+237/, '');
      await login(cleanPhone, formData.password);
      router.push('/account');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid phone number or password');
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
            Welcome Back
          </Title>
          <Text size="lg" c="dimmed">
            Sign in to your DumperShop account
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
                placeholder="Enter your password"
                leftSection={<IconLock size={16} />}
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />

              <Group justify="space-between" align="center">
                <Checkbox
                  label="Remember me"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.currentTarget.checked)}
                />
                <Anchor component={Link} href="/forgot-password" size="sm">
                  Forgot password?
                </Anchor>
              </Group>

              <Button type="submit" size="lg" color="purple" fullWidth loading={loading}>
                Sign In
              </Button>
            </Stack>
          </form>

          <Divider label="or" labelPosition="center" my="lg" />

          <Button variant="outline" size="lg" fullWidth leftSection={<IconBrandGoogle size={16} />}>
            Continue with Google
          </Button>

          <Text size="sm" c="dimmed" ta="center" mt="md">
            Don't have an account?{' '}
            <Anchor component={Link} href="/register" fw={600}>
              Sign up
            </Anchor>
          </Text>
        </Card>

        <Text size="sm" c="dimmed" ta="center">
          By signing in, you agree to our{' '}
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
