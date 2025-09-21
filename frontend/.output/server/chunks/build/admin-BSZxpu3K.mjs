import { _ as __nuxt_component_0 } from './nuxt-link-jEyLDFup.mjs';
import { ref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { _ as _sfc_main$1 } from './TagManager-qrc6UM1p.mjs';
import { u as useApi } from './useApi-CDkid88y.mjs';
import { u as useRuntimeConfig } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = {
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    const images = ref([]);
    const uploading = ref(false);
    const uploadProgress = ref(0);
    const uploadedCount = ref(0);
    const totalFiles = ref(0);
    useApi();
    const updateImageTags = (imageId, updatedTags) => {
      const image = images.value.find((img) => img.id === imageId);
      if (image) {
        image.tags = updatedTags;
      }
    };
    const getImageUrl = (filename) => {
      const apiBaseUrl = useRuntimeConfig().public.apiBase;
      return `${apiBaseUrl}/uploads/${filename}`;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50" }, _attrs))}><header class="bg-white shadow-sm border-b"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-16"><div class="flex items-center"><h1 class="text-xl font-semibold text-gray-900">Admin Panel</h1></div><div class="flex items-center space-x-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "text-gray-600 hover:text-gray-900"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Home`);
          } else {
            return [
              createTextVNode("Home")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="text-gray-600 hover:text-gray-900">Logout</button></div></div></div></header><main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="mb-8"><h2 class="text-2xl font-bold text-gray-900 mb-4">Image Management</h2><div class="bg-white rounded-lg shadow-sm border p-6 mb-8"><h3 class="text-lg font-semibold text-gray-900 mb-4">Upload Images</h3><div class="border-2 border-dashed border-gray-300 rounded-lg p-6"><input type="file" multiple accept="image/*" class="hidden"><div class="text-center"><svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg><div class="mt-4"><button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"> Select Images </button><p class="mt-2 text-sm text-gray-500">or drag and drop images here (up to 100 images)</p></div></div></div>`);
      if (uploading.value) {
        _push(`<div class="mt-4"><div class="flex items-center justify-between text-sm text-gray-600 mb-2"><span>Uploading...</span><span>${ssrInterpolate(uploadedCount.value)} / ${ssrInterpolate(totalFiles.value)}</span></div><div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-blue-600 h-2 rounded-full" style="${ssrRenderStyle({ width: uploadProgress.value + "%" })}"></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="bg-white rounded-lg shadow-sm border"><div class="p-6 border-b"><h3 class="text-lg font-semibold text-gray-900">All Images</h3></div><div class="p-6">`);
      if (images.value.length === 0) {
        _push(`<div class="text-center py-8 text-gray-500"> No images uploaded yet. </div>`);
      } else {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"><!--[-->`);
        ssrRenderList(images.value, (image) => {
          _push(`<div class="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"><img${ssrRenderAttr("src", getImageUrl(image.filename))}${ssrRenderAttr("alt", image.filename)} class="w-full h-48 object-cover"><div class="p-4"><h4 class="font-medium text-gray-900 truncate">${ssrInterpolate(image.filename)}</h4><p class="text-sm text-gray-600">Uploaded: ${ssrInterpolate(new Date(image.uploadedAt).toLocaleDateString())}</p><div class="mt-3">`);
          _push(ssrRenderComponent(_sfc_main$1, {
            "image-id": image.id,
            "initial-tags": image.tags || [],
            onTagsUpdated: (updatedTags) => updateImageTags(image.id, updatedTags)
          }, null, _parent));
          _push(`</div><button class="mt-3 text-sm text-red-600 hover:text-red-800"> Delete </button></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div></div></main></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=admin-BSZxpu3K.mjs.map
