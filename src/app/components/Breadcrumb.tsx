import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 flex-wrap" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} />}
          {item.path ? (
            <Link to={item.path}
              className="hover:text-white transition-colors"
              style={{ color: i === items.length - 1 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }}>
              {item.label}
            </Link>
          ) : (
            <span style={{ color: i === items.length - 1 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
