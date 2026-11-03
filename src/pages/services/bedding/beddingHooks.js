import { beddingAPI } from '../../../api';
import { createResourceHooks } from '../shared';

const {
  useList: useBedding,
  useById: useBeddingById,
  useSimilar: useSimilarBedding,
} = createResourceHooks({
  singular: 'bedding',
  plural: 'beddings',
  api: beddingAPI,
});

export { useBedding, useBeddingById, useSimilarBedding };
