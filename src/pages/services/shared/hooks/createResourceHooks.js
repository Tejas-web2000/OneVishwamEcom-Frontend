import useCachedData from '../../../../hooks/useCachedData';
import { CACHE_TTL, deterministicKey } from '../../../../services/cache/cacheService';

function extractList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.data?.data?.items)) return res.data.data.items;
  return [];
}

function extractDetail(res) {
  if (!res) return null;
  return (
    res.data?.data?.item ||
    res.data?.data?.electronic ||
    res.data?.data?.bedding ||
    res.data?.data?.property ||
    res.data?.data?.vehicle ||
    res.data?.data?.garment ||
    res.data?.data?.grocery ||
    res.data?.data?.jewellery ||
    res.data?.item ||
    res.data?.electronic ||
    res.data?.bedding ||
    res.data?.vehicle ||
    res.data?.property ||
    res.data?.garment ||
    res.data?.grocery ||
    res.data?.jewellery ||
    (res.data?.data && typeof res.data.data === 'object' && !Array.isArray(res.data.data) ? res.data.data : null) ||
    res.data ||
    res
  );
}

/**
 * Creates standardized API resource hooks for list, detail, and similar items.
 */
export function createResourceHooks({
  singular,
  plural,
  api,
  listFallback = [],
  detailFallback = null,
}) {
  const useList = (params = {}) => {
    const key = `${plural}:${deterministicKey(params)}`;
    const { data, loading, error, retry } = useCachedData(
      key,
      () => api.getAll(params).then(extractList),
      { ttl: CACHE_TTL.products, fallback: listFallback }
    );
    const list = data || listFallback;
    return {
      [plural]: list,
      items: list,
      data: list,
      loading,
      error,
      retry,
    };
  };

  const useById = (id) => {
    const { data, loading, error, retry } = useCachedData(
      `${singular}:item:${id}`,
      () => api.getById(id).then(extractDetail),
      { ttl: CACHE_TTL.detail, fallback: detailFallback, enabled: !!id }
    );
    const itemData = data || detailFallback;
    return {
      [singular]: itemData,
      item: itemData,
      data: itemData,
      loading,
      error,
      retry,
    };
  };

  const useSimilar = (id) => {
    const { data, loading, error } = useCachedData(
      `${singular}:similar:${id}`,
      () => (api.getSimilar ? api.getSimilar(id).then(extractList) : Promise.resolve([])),
      { ttl: CACHE_TTL.similar, fallback: [], enabled: !!id }
    );
    return { similar: data || [], loading, error };
  };

  return { useList, useById, useSimilar };
}

export default createResourceHooks;
