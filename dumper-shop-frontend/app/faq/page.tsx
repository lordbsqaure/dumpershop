'use client';

import { IconCreditCard, IconPackage, IconQuestionMark, IconTruck } from '@tabler/icons-react';
import { Accordion, Badge, Card, Container, Group, Stack, Text, Title } from '@mantine/core';

const faqCategories = [
  {
    icon: IconPackage,
    title: 'Orders & Shipping',
    color: 'blue',
    questions: [
      {
        question: 'How long does shipping take?',
        answer:
          'Standard shipping typically takes 3-5 business days. Express shipping (1-2 days) and overnight shipping are also available for faster delivery.',
      },
      {
        question: 'Do you ship internationally?',
        answer:
          'Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. You can see exact rates during checkout.',
      },
      {
        question: 'How can I track my order?',
        answer:
          "Once your order ships, you'll receive a tracking number via email. You can also view your order status and tracking information in your account dashboard.",
      },
      {
        question: 'What if my package is damaged?',
        answer:
          "If your package arrives damaged, please contact our support team within 48 hours with photos of the damage. We'll arrange for a replacement or refund.",
      },
    ],
  },
  {
    icon: IconCreditCard,
    title: 'Payment & Returns',
    color: 'green',
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers.',
      },
      {
        question: 'Is my payment information secure?',
        answer:
          'Yes, all payments are processed through secure, encrypted connections. We use industry-standard SSL encryption and never store your full credit card information.',
      },
      {
        question: 'What is your return policy?',
        answer:
          'We offer a 30-day return policy on most items. Items must be unused and in original packaging. Return shipping costs may apply unless the item is defective.',
      },
      {
        question: 'How do I process a return?',
        answer:
          "Contact our support team to initiate a return. We'll provide a return label and instructions. Once received, refunds are processed within 3-5 business days.",
      },
    ],
  },
  {
    icon: IconTruck,
    title: 'Products & Warranty',
    color: 'purple',
    questions: [
      {
        question: 'Do your products come with warranty?',
        answer:
          'Most products include manufacturer warranties. Electronics typically have 1-2 year warranties, while other products may have different coverage periods.',
      },
      {
        question: 'Are your products authentic?',
        answer:
          'Yes, all our products are 100% authentic and sourced directly from authorized manufacturers and distributors.',
      },
      {
        question: 'Can I get a product manual?',
        answer:
          'Product manuals and documentation are available for download on each product page. You can also request physical copies for certain items.',
      },
    ],
  },
  {
    icon: IconQuestionMark,
    title: 'Account & Support',
    color: 'orange',
    questions: [
      {
        question: 'How do I create an account?',
        answer:
          'Click the "Sign Up" button in the top navigation. You can register with your email address or use Google sign-in for faster access.',
      },
      {
        question: 'How do I reset my password?',
        answer:
          'Click "Forgot Password" on the login page. We\'ll send you a secure link to reset your password.',
      },
      {
        question: 'How can I contact customer support?',
        answer:
          'You can reach us via email at support@dumpshop.com, phone at +1 (555) 123-4567, or through the contact form on our website.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div style={{ textAlign: 'center' }}>
          <Title order={1} size="3rem" mb="md">
            Frequently Asked Questions
          </Title>
          <Text size="xl" c="dimmed" maw={600}>
            Find answers to common questions about shopping, shipping, returns, and more.
          </Text>
        </div>

        {faqCategories.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <Card key={categoryIndex} padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group gap="sm">
                  <Icon size={24} color={`var(--mantine-color-${category.color}-6)`} />
                  <Title order={2}>{category.title}</Title>
                  <Badge color={category.color} variant="light">
                    {category.questions.length} questions
                  </Badge>
                </Group>

                <Accordion variant="separated">
                  {category.questions.map((faq, faqIndex) => (
                    <Accordion.Item key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                      <Accordion.Control>
                        <Text fw={600}>{faq.question}</Text>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text>{faq.answer}</Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Stack>
            </Card>
          );
        })}

        <Card padding="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
          <Stack gap="md">
            <Title order={2}>Still have questions?</Title>
            <Text size="lg" c="dimmed">
              Can't find what you're looking for? Our support team is here to help.
            </Text>
            <Group gap="md" justify="center">
              <Badge color="purple" size="lg">
                Email: support@dumpshop.com
              </Badge>
              <Badge color="blue" size="lg">
                Phone: +1 (555) 123-4567
              </Badge>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
