import { IconAward, IconHeart, IconTarget, IconUsers } from '@tabler/icons-react';
import { Box, Card, Container, Group, Image, SimpleGrid, Stack, Text, Title } from '@mantine/core';

const values = [
  {
    icon: IconTarget,
    title: 'Our Mission',
    description:
      'To provide exceptional products with outstanding customer service and sustainable practices.',
  },
  {
    icon: IconUsers,
    title: 'Our Team',
    description:
      'A dedicated group of professionals passionate about delivering quality and innovation.',
  },
  {
    icon: IconAward,
    title: 'Quality First',
    description:
      'We carefully select and test every product to ensure it meets our high standards.',
  },
  {
    icon: IconHeart,
    title: 'Customer Focused',
    description:
      'Your satisfaction is our priority. We listen to feedback and continuously improve.',
  },
];

export default function AboutPage() {
  return (
    <Container fluid pl={0} pr={0} ml={0} mr={0}>
      <Stack gap="xl" align="center">
        {/* Hero Image with Title Overlay */}
        <div style={{ width: '100%', position: 'relative' }}>
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400"
            alt="Dumper Shop Professional Team"
            h={{ base: 300, sm: 400, md: 600 }}
            fit="cover"
            style={{
              width: '100%',
              borderRadius: 0,
              '@media (min-width: 48em)': {
                borderRadius: 'var(--mantine-radius-lg)',
              },
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
              color: 'white',
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: 800 }}>
              <Title
                order={1}
                mb="md"
                style={{
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  fontSize: 'clamp(2rem, 8vw, 4rem)',
                }}
              >
                About Dumper Shop
              </Title>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', maxWidth: 800 }}>
          <Text size="xl" c="dimmed" mx={{ base: 10 }}>
            We're more than just an ecommerce store. We're your trusted partner in discovering
            premium products that enhance your lifestyle.
          </Text>
        </div>

        <Card padding="xl" radius="md" withBorder style={{ width: '100%', maxWidth: 1000 }}>
          <Stack gap="lg">
            <Title order={2} ta="center">
              Our Story
            </Title>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Text size="lg">
                Founded in 2022, DumperShop started with a simple mission: to make premium products
                accessible to everyone. We believe that quality shouldn't come with a premium price
                tag. Through careful curation and partnerships with trusted manufacturers, we bring
                you products that combine exceptional quality, innovative design, and great value.
              </Text>
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400"
                alt="Team working together"
                radius="md"
                fit="cover"
              />
            </SimpleGrid>
          </Stack>
        </Card>

        <div style={{ width: '100%', maxWidth: 1200 }}>
          <Title order={2} ta="center" mb="lg">
            What Drives Us
          </Title>
          <SimpleGrid mx={{ base: 10 }} cols={{ base: 1, md: 2, lg: 4 }} spacing="lg">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} padding="lg" radius="md" withBorder ta="center">
                  <Stack gap="md" align="center">
                    <Icon size={48} color="var(--mantine-color-purple-6)" />
                    <Title order={3}>{value.title}</Title>
                    <Text size="sm" c="dimmed">
                      {value.description}
                    </Text>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        </div>

        <Card padding="xl" radius="md" withBorder style={{ width: '100%', maxWidth: 800 }}>
          <Stack gap="md" align="center">
            <Title order={2}>Join Our Journey</Title>
            <Text size="lg" ta="center" c="dimmed">
              We're always looking for ways to improve and grow. Your feedback helps us serve you
              better. Thank you for choosing DumperShop for your shopping needs.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
