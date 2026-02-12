'use client';

import { Avatar, Card, Group, Stack, Text } from '@mantine/core';
import { Rating } from '../Rating/Rating';

interface ReviewCardProps {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
}

export function ReviewCard({
  id,
  userName,
  userAvatar,
  rating,
  comment,
  date,
  verified = false,
}: ReviewCardProps) {
  return (
    <Card padding="lg" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" align="start">
          <Group gap="sm">
            <Avatar src={userAvatar} alt={userName} radius="xl" size="md">
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Text fw={600} size="sm">
                {userName}
                {verified && (
                  <Text component="span" size="xs" c="green" ml="xs">
                    ✓ Verified
                  </Text>
                )}
              </Text>
              <Text size="xs" c="dimmed">
                {date}
              </Text>
            </div>
          </Group>
          <Rating value={rating} fontSize="1.2rem" showCount={false} />
        </Group>

        <Text size="sm" style={{ lineHeight: 1.5 }}>
          {comment}
        </Text>
      </Stack>
    </Card>
  );
}
