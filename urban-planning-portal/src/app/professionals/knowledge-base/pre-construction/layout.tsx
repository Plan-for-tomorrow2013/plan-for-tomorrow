'use client';

export default function PreConstructionLayout({ children }: { children: React.ReactNode }) {
  return <div className="container mx-auto p-6">{children}</div>;
}
