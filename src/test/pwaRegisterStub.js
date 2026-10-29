// Stand-in for vite-plugin-pwa's virtual module under Vitest.
export const useRegisterSW = () => ({
  needRefresh: [false, () => {}],
  offlineReady: [false, () => {}],
  updateServiceWorker: async () => {},
});
