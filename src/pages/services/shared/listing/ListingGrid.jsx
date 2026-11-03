import React from 'react';
import ListingCard from '../cards/ListingCard';
import EmptyState from '../EmptyState';

/**
 * Universal Listing Grid Component
 */
export default function ListingGrid({
  items = [],
  sector = 'property',
  renderCard,
  renderActions,
  emptyIcon = 'fa-solid fa-layer-group',
  emptyTitle = 'No listings found',
  emptySubtitle = 'Try adjusting your filters or search terms.',
  emptyAnimationType = 'emptyCatalog',
  onResetFilters,
  gridClass = 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3',
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        subtitle={emptySubtitle}
        onReset={onResetFilters}
        animationType={emptyAnimationType}
      />
    );
  }

  return (
    <div className={gridClass}>
      {items.map((item, idx) => {
        if (renderCard) return renderCard(item, idx);

        return (
          <ListingCard
            key={item._id || item.id || idx}
            item={item}
            sector={sector}
          >
            {renderActions ? renderActions(item, idx) : null}
          </ListingCard>
        );
      })}
    </div>
  );
}
