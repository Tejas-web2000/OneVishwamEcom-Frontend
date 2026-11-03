const mockAPI = {
  get: jest.fn().mockResolvedValue({ data: { data: { items: [], announcements: [] } } }),
  post: jest.fn().mockResolvedValue({ data: { success: true } }),
  put: jest.fn().mockResolvedValue({ data: { success: true } }),
  delete: jest.fn().mockResolvedValue({ data: { success: true } }),
  patch: jest.fn().mockResolvedValue({ data: { success: true } }),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

export default mockAPI;

