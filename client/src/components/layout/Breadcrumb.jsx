/**
 * Breadcrumb Component
 * Provides consistent navigation across the app
 * Pattern: My FileTrace > [Category] > [Page]
 */

import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Breadcrumb Component
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of breadcrumb items
 * @param {string} props.items[].label - Display text for the breadcrumb item
 * @param {string} [props.items[].path] - Optional path for the link (last item should not have path)
 * @returns {React.ReactElement} Breadcrumb navigation
 *
 * @example
 * <Breadcrumb items={[
 *   { label: 'My FileTrace', path: '/dashboard' },
 *   { label: 'Personal', path: '/files/Personal' },
 *   { label: 'Upload' }
 * ]} />
 */
export default function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumb-container" aria-label="Breadcrumb navigation">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {/* Separator (not for first item) */}
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 text-text-muted flex-shrink-0"
                  aria-hidden="true"
                />
              )}

              {/* Link or current page */}
              {item.path && !isLast ? (
                <Link to={item.path} className="breadcrumb-link">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast ? 'breadcrumb-current' : 'text-text-secondary'
                  }
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
