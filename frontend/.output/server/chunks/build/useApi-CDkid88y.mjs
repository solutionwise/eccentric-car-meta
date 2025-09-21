import { u as useRuntimeConfig } from './server.mjs';

const useApi = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const apiCall = async (url, options = {}) => {
    const headers = {
      ...options.headers
    };
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    const fullUrl = url.startsWith("http") ? url : `${apiBase}${url}`;
    return await $fetch(fullUrl, {
      ...options,
      headers
    });
  };
  return {
    apiCall
  };
};

export { useApi as u };
//# sourceMappingURL=useApi-CDkid88y.mjs.map
