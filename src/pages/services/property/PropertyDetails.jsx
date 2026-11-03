import React, { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useProperties, usePropertyById } from '../../../hooks/useProperties';
import MasterDetailPage from '../../../components/common/templates/MasterDetailPage';
import { cleanProductName } from '../../../utils/searchUtils';
import {
  formatPropertyDisplayPrice,
  formatPropertyAddress,
  resolvePropertyLocality,
  isCornerProperty,
  isPlotOrLand,
  getBangaloreZone,
  getPropertyStatusPill,
} from './propertyHelpers';

/**
 * PropertyDetails
 * Centralized property detail view powered by the unified MasterDetailPage template.
 * Passes property-specific bento highlights, floor plans, and amenities via props.
 */
export default function PropertyDetails() {
  const { pathname } = useLocation();
  const params = useParams();
  const pathParts = pathname.split('/').filter(Boolean);
  const propertySlug = params.id || (pathParts.length > 0 ? pathParts[pathParts.length - 1] : null);

  const { properties, loading: listLoading } = useProperties();
  const { property: directProperty, loading: directLoading, error: directError } = usePropertyById(propertySlug);

  const rawProperty = directProperty || properties.find(
    (p) => p._id === propertySlug || String(p.id) === propertySlug
  ) || null;

  const property = useMemo(() => {
    if (!rawProperty) return null;
    const display = formatPropertyDisplayPrice(rawProperty);
    const resolvedAddress = formatPropertyAddress(rawProperty);
    const cleanAddr = (rawProperty.address || '').trim().toLowerCase();
    const isBareCity = !rawProperty.address || cleanAddr === 'bangalore' || cleanAddr === 'bengaluru' || (rawProperty.city && cleanAddr === rawProperty.city.toLowerCase());
    const locUrl = (
      rawProperty.mapUrl ||
      rawProperty.details?.mapUrl ||
      ''
    ).trim();

    const isPlot = isPlotOrLand(rawProperty);
    const statusPill = getPropertyStatusPill(rawProperty);

    // Build status badges
    const statusBadges = [];
    statusBadges.push({
      label: rawProperty.propertyType || rawProperty.subcategory || 'Property',
      className: 'bg-brand-blue/10 text-brand-blue font-bold',
    });
    statusBadges.push({
      label: statusPill?.label || rawProperty.possession || rawProperty.possessionStatus || (isPlot ? 'Ready for Registration' : 'Ready to Occupy'),
      className: statusPill?.cls || 'bg-emerald-100 text-emerald-700 font-bold',
    });
    if (rawProperty.loanApproved) {
      statusBadges.push({ label: 'Loan Pre-Approved', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold' });
    }
    if (rawProperty.facing) {
      statusBadges.push({ label: `Facing: ${rawProperty.facing}`, className: 'bg-amber-50 text-amber-800 border border-amber-200 font-bold' });
    }
    if (isCornerProperty(rawProperty)) {
      statusBadges.push({ label: isPlot ? 'Corner Site' : 'Corner Plot', className: 'bg-purple-50 text-purple-800 border border-purple-200 font-bold' });
    }

    // Build Bento Overview Highlights
    const overviewHighlights = [];
    if (rawProperty.bhk && !isPlot) {
      overviewHighlights.push({ label: 'Configuration', value: rawProperty.bhk, icon: 'fa-bed', color: 'text-blue-600 bg-blue-50' });
    }
    const areaVal = rawProperty.area || rawProperty.details?.superBuiltUpArea || rawProperty.dimensions;
    if (areaVal) {
      overviewHighlights.push({ label: isPlot ? 'Plot Area' : 'Built-up Area', value: String(areaVal), icon: 'fa-vector-square', color: 'text-emerald-600 bg-emerald-50' });
    }
    if (rawProperty.facing) {
      overviewHighlights.push({ label: 'Door Facing', value: rawProperty.facing, icon: 'fa-compass', color: 'text-amber-600 bg-amber-50' });
    }
    if (rawProperty.bathrooms) {
      overviewHighlights.push({ label: 'Bathrooms', value: `${rawProperty.bathrooms} Baths`, icon: 'fa-bath', color: 'text-cyan-600 bg-cyan-50' });
    }
    if (rawProperty.furnishing) {
      overviewHighlights.push({ label: 'Furnishing', value: rawProperty.furnishing, icon: 'fa-couch', color: 'text-indigo-600 bg-indigo-50' });
    }
    if (rawProperty.parking) {
      overviewHighlights.push({ label: 'Parking', value: rawProperty.parking, icon: 'fa-car', color: 'text-teal-600 bg-teal-50' });
    }

    const enterpriseName = rawProperty.channelPartnerName ||
      (rawProperty.vendorName && rawProperty.vendorName.toLowerCase() !== 'onevishwam' ? rawProperty.vendorName : null) ||
      rawProperty.agent?.name ||
      null;

    const enterpriseLogo = rawProperty.agent?.avatar || rawProperty.logo || rawProperty.channelPartner?.logo || null;

    // Floor plans
    const fp = rawProperty.floorPlanImages || rawProperty.floorPlans || rawProperty.floorPlanMap;
    const floorPlanImages = Array.isArray(fp) ? fp.filter(Boolean) : (typeof fp === 'string' && fp ? [fp] : []);
    const pdfUrl = rawProperty.pdfUrl || rawProperty.floorPlanPdf || rawProperty.pdf || null;

    return {
      ...rawProperty,
      id: rawProperty._id || rawProperty.id,
      title: cleanProductName(rawProperty.title),
      address: isBareCity ? resolvedAddress : rawProperty.address,
      locality: rawProperty.locality || resolvePropertyLocality(rawProperty),
      location: resolvedAddress,
      mapUrl: locUrl,
      zone: rawProperty.zone || getBangaloreZone(rawProperty),
      price: display.price,
      priceSuffix: display.priceSuffix,
      statusBadges,
      overviewHighlights: overviewHighlights.length > 0 ? overviewHighlights : undefined,
      features: (rawProperty.amenities?.length > 0
        ? rawProperty.amenities
        : ['Swimming Pool', '24×7 Security', 'Gym', 'Power Backup', 'Clubhouse', 'Garden', '2 Wheeler Parking', '4 Wheeler Parking']
      ),
      enterpriseName,
      enterpriseLogo,
      floorPlanImages,
      pdfUrl,
    };
  }, [rawProperty]);

  const loading = !property && (listLoading || directLoading);
  const error = !property && !loading ? (directError ? new Error(directError) : new Error('Property not found')) : null;

  const activeId = property ? (property._id || property.id) : null;
  const currentSubcat = property ? (property.propertyType || property.subcategory || '') : '';

  const similarProperties = useMemo(() => {
    if (!property) return [];
    const matched = properties.filter((p) => {
      const pId = p._id || p.id;
      if (String(pId) === String(activeId)) return false;
      const pSubcat = p.propertyType || p.subcategory || '';
      return (
        pSubcat.toLowerCase() === currentSubcat.toLowerCase() ||
        (p.city && property.city && p.city.toLowerCase() === property.city.toLowerCase())
      );
    });
    if (matched.length < 4) {
      const rest = properties.filter((p) => {
        const pId = p._id || p.id;
        return String(pId) !== String(activeId) && !matched.some((m) => String(m._id || m.id) === String(pId));
      });
      return [...matched, ...rest].slice(0, 8);
    }
    return matched.slice(0, 8);
  }, [property, properties, activeId, currentSubcat]);

  return (
    <MasterDetailPage
      item={property}
      categoryName="Properties"
      categoryLink="/categories/properties"
      similarItems={similarProperties}
      itemLinkPrefix="/property/"
      loading={loading}
      error={error}
      bentoTitle="Overview"
      featuresTitle="Features & Amenities"
      floorPlans={property?.floorPlanImages || []}
      pdfUrl={property?.pdfUrl || null}
    />
  );
}
