import { electronicsAPI } from '../../../api';
import { createResourceHooks } from '../shared';

const {
  useList: useElectronics,
  useById: useElectronicById,
  useSimilar: useSimilarElectronics,
} = createResourceHooks({
  singular: 'electronic',
  plural: 'electronics',
  api: electronicsAPI,
});

export { useElectronics, useElectronicById, useSimilarElectronics };
