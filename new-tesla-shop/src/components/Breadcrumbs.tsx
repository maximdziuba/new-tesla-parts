'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: Props) => {
  return (
    <nav className="breadcrumbs">
      <Link href="/">Головна</Link>
      {items.map((item, index) => (
        <span key={index}>
          <span> &gt; </span>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
