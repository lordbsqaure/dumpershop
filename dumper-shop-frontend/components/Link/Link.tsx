'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface LinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

export function CustomLink({ href, children, className, ...props }: LinkProps) {
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
