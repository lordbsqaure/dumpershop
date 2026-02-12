'use client';

import { useState } from 'react';
import { IconClock, IconMail, IconMapPin, IconPhone, IconSend } from '@tabler/icons-react';
import {
  Button,
  Card,
  Container,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';

const contactInfo = [
  {
    icon: IconMail,
    title: 'Email Us',
    content: 'support@dumpshop.com',
    description: 'Send us an email anytime',
  },
  {
    icon: IconPhone,
    title: 'Call Us',
    content: '+1 (555) 123-4567',
    description: 'Mon-Fri 9AM-6PM EST',
  },
  {
    icon: IconMapPin,
    title: 'Visit Us',
    content: '123 Commerce St, New York, NY 10001',
    description: 'Our office location',
  },
  {
    icon: IconClock,
    title: 'Business Hours',
    content: 'Mon-Fri: 9AM-6PM',
    description: 'Sat-Sun: 10AM-4PM',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log('Contact form submitted:', formData);
    setLoading(false);

    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Container fluid pl={0} pr={0} ml={0} mr={0}>
      <Stack gap="xl">
        <div style={{ width: '100%', position: 'relative' }}>
          <Image
            src="/contactUs.jpg"
            alt="Contact Us"
            h={{ base: 300, sm: 400, md: 600 }}
            fit="cover"
            style={{
              width: '100%',
              borderRadius: 'var(--mantine-radius-lg)',
            }}
          />
          {/* Title Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              padding: '1rem',
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: 800, padding: '0 1rem' }}>
              <Title
                order={1}
                style={{
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  fontSize: 'clamp(2rem, 8vw, 4rem)',
                }}
              >
                Contact Us
              </Title>
              <Text
                size="lg"
                style={{
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  marginTop: '1rem',
                  fontSize: 'clamp(0.8rem, 4vw, 1.5rem)',
                }}
              >
                We'd love to hear from you. Get in touch with our team for any questions or support.
              </Text>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 2rem' }}>
          <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="lg">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card key={index} padding="lg" radius="md" withBorder ta="center">
                  <Stack gap="md" align="center">
                    <Icon size={32} color="var(--mantine-color-purple-6)" />
                    <div>
                      <Text fw={600} size="lg">
                        {info.title}
                      </Text>
                      <Text size="md" c="purple">
                        {info.content}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {info.description}
                      </Text>
                    </div>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>

          <Card padding="xl" radius="md" withBorder style={{ maxWidth: 800, margin: '2rem auto' }}>
            <Title order={2} mb="lg" ta="center">
              Send us a Message
            </Title>

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <Group grow>
                  <TextInput
                    label="Your Name"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                  <TextInput
                    label="Email Address"
                    placeholder="john@example.com"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </Group>

                <TextInput
                  label="Subject"
                  placeholder="How can we help you?"
                  required
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                />

                <Textarea
                  label="Message"
                  placeholder="Tell us more about your inquiry..."
                  minRows={4}
                  required
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                />

                <Button
                  type="submit"
                  size="lg"
                  color="purple"
                  leftSection={<IconSend size={16} />}
                  loading={loading}
                  style={{ alignSelf: 'flex-start' }}
                >
                  Send Message
                </Button>
              </Stack>
            </form>
          </Card>
        </div>
      </Stack>
    </Container>
  );
}
