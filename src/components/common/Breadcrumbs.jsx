import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({
  items,
  categoryName,
  categoryLink,
  itemTitle,
  theme = 'light',
  className = '',
}) {
  // Build items array if convenience props are provided
  const resolvedItems = React.useMemo(() => {
    if (Array.isArray(items) && items.length > 0) return items;

    const list = [{ label: 'Home', to: '/home' }];
    if (categoryName) {
      list.push({
        label: categoryName,
        to: itemTitle && categoryLink ? categoryLink : undefined,
      });
    }
    if (itemTitle) {
      list.push({
        label: itemTitle,
        truncate: true,
      });
    }
    return list;
  }, [items, categoryName, categoryLink, itemTitle]);

  const isDark = theme === 'dark';
  const containerCls = isDark
    ? 'flex items-center gap-2 text-xs text-white/70'
    : 'flex items-center gap-2 text-xs text-gray-500';
  const linkCls = isDark
    ? 'hover:text-white transition-colors'
    : 'hover:text-brand-blue transition-colors';
  const sepCls = isDark
    ? 'text-white/40 select-none'
    : 'text-gray-400 select-none';
  const activeCls = isDark
    ? 'text-white font-semibold truncate max-w-[200px]'
    : 'text-brand-charcoal font-semibold truncate max-w-[180px] sm:max-w-xs';

  return (
    <nav aria-label="Breadcrumb" className={`${containerCls} ${className}`.trim()}>
      <ol className="flex items-center gap-2 flex-wrap">
        {resolvedItems.map((item, idx) => {
          const isLast = idx === resolvedItems.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <span className={sepCls} aria-hidden="true">/</span>}
              <li className="inline-flex items-center">
                {item.to && !isLast ? (
                  <Link to={item.to} className={linkCls}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={item.truncate || isLast ? activeCls : (isDark ? 'text-white font-semibold' : 'text-brand-charcoal font-semibold')}>
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
