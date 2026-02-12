import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconSearch } from '@tabler/icons-react';
import { ActionIcon, TextInput } from '@mantine/core';

interface SearchBarProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: string | number;
  hiddenFrom?: string;
  visibleFrom?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search products...',
  size = 'md',
  maxWidth,
  hiddenFrom,
  visibleFrom,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const router = useRouter();
  const style = maxWidth ? { maxWidth } : undefined;

  const handleSubmit = () => {
    if (localValue.trim()) {
      router.push(`/products?q=${encodeURIComponent(localValue.trim())}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <TextInput
      placeholder={placeholder}
      rightSection={<IconSearch onClick={handleSubmit} size={16} />}
      value={localValue}
      onChange={(event) => setLocalValue(event.currentTarget.value)}
      onKeyDown={handleKeyDown}
      size={size}
      style={[style]}
      hiddenFrom={hiddenFrom}
      visibleFrom={visibleFrom}
    />
  );
}
