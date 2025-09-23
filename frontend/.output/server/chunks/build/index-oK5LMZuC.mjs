import { _ as __nuxt_component_0 } from './nuxt-link-jEyLDFup.mjs';
import { ref, resolveComponent, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { u as useApi } from './useApi-CDkid88y.mjs';
import { a as useNuxtApp, u as useRuntimeConfig } from './server.mjs';
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

const _sfc_main$1 = {
  __name: "TagDisplay",
  __ssrInlineRender: true,
  props: {
    tags: {
      type: Array,
      default: () => []
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Badge = resolveComponent("Badge");
      if (__props.tags && __props.tags.length > 0) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-wrap gap-1" }, _attrs))}><!--[-->`);
        ssrRenderList(__props.tags, (tag) => {
          _push(ssrRenderComponent(_component_Badge, {
            key: tag,
            variant: "outline",
            class: "text-xs"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(tag)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(tag), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-xs text-gray-400" }, _attrs))}> No tags </div>`);
      }
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TagDisplay.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const searchQuery = ref("");
    const results = ref([]);
    const loading = ref(false);
    const hasSearched = ref(false);
    const selectedImage = ref(null);
    const { apiCall } = useApi();
    const searchImages = async () => {
      if (!searchQuery.value.trim()) return;
      loading.value = true;
      hasSearched.value = true;
      try {
        const response = await apiCall("/api/search", {
          method: "POST",
          body: {
            query: searchQuery.value
          }
        });
        results.value = response.results || [];
      } catch (error) {
        console.error("Search error:", error);
        results.value = [];
      } finally {
        loading.value = false;
      }
    };
    const getImageUrl = (filename) => {
      const apiBaseUrl = useRuntimeConfig().public.apiBase;
      return `${apiBaseUrl}/uploads/${filename}`;
    };
    const openModal = (image) => {
      selectedImage.value = image;
    };
    const logout = async () => {
      try {
        const { $auth } = useNuxtApp();
        if ($auth && typeof $auth.removeToken === "function") {
          $auth.removeToken();
        }
        (void 0).location.reload();
      } catch (error) {
        console.error("Logout error:", error);
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_Button = resolveComponent("Button");
      const _component_Input = resolveComponent("Input");
      const _component_Card = resolveComponent("Card");
      const _component_Badge = resolveComponent("Badge");
      const _component_TagDisplay = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50" }, _attrs))}><header class="bg-white shadow-sm border-b"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-16"><div class="flex items-center"><h1 class="text-xl font-semibold text-gray-900">Eccentric Car Finder</h1></div><div class="flex items-center space-x-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/admin" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Button, { variant: "ghost" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Admin`);
                } else {
                  return [
                    createTextVNode("Admin")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_Button, { variant: "ghost" }, {
                default: withCtx(() => [
                  createTextVNode("Admin")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/login" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Button, { variant: "ghost" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Login`);
                } else {
                  return [
                    createTextVNode("Login")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_Button, { variant: "ghost" }, {
                default: withCtx(() => [
                  createTextVNode("Login")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Button, {
        variant: "ghost",
        onClick: logout
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Logout`);
          } else {
            return [
              createTextVNode("Logout")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/shadcn-test" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Button, {
              variant: "outline",
              size: "sm"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`UI Test`);
                } else {
                  return [
                    createTextVNode("UI Test")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_Button, {
                variant: "outline",
                size: "sm"
              }, {
                default: withCtx(() => [
                  createTextVNode("UI Test")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></header><main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="mb-8"><div class="max-w-2xl mx-auto"><h2 class="text-2xl font-bold text-gray-900 mb-4">Search Images</h2><div class="flex space-x-4">`);
      _push(ssrRenderComponent(_component_Input, {
        modelValue: searchQuery.value,
        "onUpdate:modelValue": ($event) => searchQuery.value = $event,
        type: "text",
        placeholder: "Describe what you're looking for...",
        class: "flex-1",
        onKeyup: searchImages
      }, null, _parent));
      _push(ssrRenderComponent(_component_Button, {
        onClick: searchImages,
        disabled: loading.value
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(loading.value ? "Searching..." : "Search")}`);
          } else {
            return [
              createTextVNode(toDisplayString(loading.value ? "Searching..." : "Search"), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
      if (results.value.length > 0) {
        _push(`<div class="mb-8"><h3 class="text-lg font-semibold text-gray-900 mb-4">Search Results</h3><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"><!--[-->`);
        ssrRenderList(results.value, (result) => {
          _push(ssrRenderComponent(_component_Card, {
            key: result.id,
            class: "overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
            onClick: ($event) => openModal(result)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<img${ssrRenderAttr("src", getImageUrl(result.filename))}${ssrRenderAttr("alt", result.filename)} class="w-full h-48 object-cover"${_scopeId}><div class="p-4"${_scopeId}><h4 class="font-medium text-foreground truncate"${_scopeId}>${ssrInterpolate(result.filename)}</h4><div class="flex items-center justify-between mt-2"${_scopeId}><p class="text-sm text-muted-foreground"${_scopeId}>Similarity:</p>`);
                _push2(ssrRenderComponent(_component_Badge, { variant: "secondary" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate((result.similarity * 100).toFixed(1))}%`);
                    } else {
                      return [
                        createTextVNode(toDisplayString((result.similarity * 100).toFixed(1)) + "%", 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</div><div class="mt-3"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_TagDisplay, {
                  tags: result.tags || []
                }, null, _parent2, _scopeId));
                _push2(`</div></div>`);
              } else {
                return [
                  createVNode("img", {
                    src: getImageUrl(result.filename),
                    alt: result.filename,
                    class: "w-full h-48 object-cover"
                  }, null, 8, ["src", "alt"]),
                  createVNode("div", { class: "p-4" }, [
                    createVNode("h4", { class: "font-medium text-foreground truncate" }, toDisplayString(result.filename), 1),
                    createVNode("div", { class: "flex items-center justify-between mt-2" }, [
                      createVNode("p", { class: "text-sm text-muted-foreground" }, "Similarity:"),
                      createVNode(_component_Badge, { variant: "secondary" }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString((result.similarity * 100).toFixed(1)) + "%", 1)
                        ]),
                        _: 2
                      }, 1024)
                    ]),
                    createVNode("div", { class: "mt-3" }, [
                      createVNode(_component_TagDisplay, {
                        tags: result.tags || []
                      }, null, 8, ["tags"])
                    ])
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!loading.value && results.value.length === 0 && hasSearched.value) {
        _push(`<div class="text-center py-12"><p class="text-gray-500">No images found matching your search.</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</main>`);
      if (selectedImage.value) {
        _push(`<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div class="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"><div class="p-6"><div class="flex justify-between items-start mb-4"><h3 class="text-lg font-semibold">${ssrInterpolate(selectedImage.value.filename)}</h3><button class="text-gray-400 hover:text-gray-600"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><img${ssrRenderAttr("src", selectedImage.value.url)}${ssrRenderAttr("alt", selectedImage.value.filename)} class="max-w-full max-h-[70vh] object-contain mx-auto"><div class="mt-4 text-sm text-gray-600"><p>Similarity Score: ${ssrInterpolate((selectedImage.value.similarity * 100).toFixed(1))}%</p><p>Uploaded: ${ssrInterpolate(new Date(selectedImage.value.uploadedAt).toLocaleDateString())}</p><div class="mt-3"><p class="text-sm font-medium text-gray-700 mb-2">Tags:</p>`);
        _push(ssrRenderComponent(_component_TagDisplay, {
          tags: selectedImage.value.tags || []
        }, null, _parent));
        _push(`</div></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-oK5LMZuC.mjs.map
