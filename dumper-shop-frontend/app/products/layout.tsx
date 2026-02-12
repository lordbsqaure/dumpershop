import React, { Suspense } from 'react';

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
