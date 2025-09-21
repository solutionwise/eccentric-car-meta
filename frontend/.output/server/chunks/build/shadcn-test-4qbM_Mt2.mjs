import { defineComponent, resolveComponent, mergeProps, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "shadcn-test",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Card = resolveComponent("Card");
      const _component_Button = resolveComponent("Button");
      const _component_Input = resolveComponent("Input");
      const _component_Badge = resolveComponent("Badge");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-background p-8" }, _attrs))}><div class="max-w-4xl mx-auto space-y-8"><div><h1 class="text-3xl font-bold text-foreground mb-2">shadcn/ui Components Test</h1><p class="text-muted-foreground">Testing the shadcn/ui components setup</p></div>`);
      _push(ssrRenderComponent(_component_Card, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col space-y-1.5 p-6"${_scopeId}><h2 class="text-xl font-semibold"${_scopeId}>Buttons</h2></div><div class="p-6 pt-0"${_scopeId}><div class="flex flex-wrap gap-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Button, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Default Button`);
                } else {
                  return [
                    createTextVNode("Default Button")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Button, { variant: "secondary" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Secondary`);
                } else {
                  return [
                    createTextVNode("Secondary")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Button, { variant: "outline" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Outline`);
                } else {
                  return [
                    createTextVNode("Outline")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Button, { variant: "destructive" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Destructive`);
                } else {
                  return [
                    createTextVNode("Destructive")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Button, { variant: "ghost" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Ghost`);
                } else {
                  return [
                    createTextVNode("Ghost")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Button, { variant: "link" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Link`);
                } else {
                  return [
                    createTextVNode("Link")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="flex flex-wrap gap-4 mt-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Button, { size: "sm" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Small`);
                } else {
                  return [
                    createTextVNode("Small")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Button, { size: "default" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Default`);
                } else {
                  return [
                    createTextVNode("Default")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Button, { size: "lg" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Large`);
                } else {
                  return [
                    createTextVNode("Large")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col space-y-1.5 p-6" }, [
                createVNode("h2", { class: "text-xl font-semibold" }, "Buttons")
              ]),
              createVNode("div", { class: "p-6 pt-0" }, [
                createVNode("div", { class: "flex flex-wrap gap-4" }, [
                  createVNode(_component_Button, null, {
                    default: withCtx(() => [
                      createTextVNode("Default Button")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_Button, { variant: "secondary" }, {
                    default: withCtx(() => [
                      createTextVNode("Secondary")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_Button, { variant: "outline" }, {
                    default: withCtx(() => [
                      createTextVNode("Outline")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_Button, { variant: "destructive" }, {
                    default: withCtx(() => [
                      createTextVNode("Destructive")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_Button, { variant: "ghost" }, {
                    default: withCtx(() => [
                      createTextVNode("Ghost")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_Button, { variant: "link" }, {
                    default: withCtx(() => [
                      createTextVNode("Link")
                    ]),
                    _: 1
                  })
                ]),
                createVNode("div", { class: "flex flex-wrap gap-4 mt-4" }, [
                  createVNode(_component_Button, { size: "sm" }, {
                    default: withCtx(() => [
                      createTextVNode("Small")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_Button, { size: "default" }, {
                    default: withCtx(() => [
                      createTextVNode("Default")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_Button, { size: "lg" }, {
                    default: withCtx(() => [
                      createTextVNode("Large")
                    ]),
                    _: 1
                  })
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Card, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col space-y-1.5 p-6"${_scopeId}><h2 class="text-xl font-semibold"${_scopeId}>Inputs</h2></div><div class="p-6 pt-0"${_scopeId}><div class="space-y-4"${_scopeId}><div${_scopeId}><label class="text-sm font-medium mb-2 block"${_scopeId}>Default Input</label>`);
            _push2(ssrRenderComponent(_component_Input, { placeholder: "Enter some text..." }, null, _parent2, _scopeId));
            _push2(`</div><div${_scopeId}><label class="text-sm font-medium mb-2 block"${_scopeId}>Search Input</label>`);
            _push2(ssrRenderComponent(_component_Input, { placeholder: "Search for images..." }, null, _parent2, _scopeId));
            _push2(`</div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col space-y-1.5 p-6" }, [
                createVNode("h2", { class: "text-xl font-semibold" }, "Inputs")
              ]),
              createVNode("div", { class: "p-6 pt-0" }, [
                createVNode("div", { class: "space-y-4" }, [
                  createVNode("div", null, [
                    createVNode("label", { class: "text-sm font-medium mb-2 block" }, "Default Input"),
                    createVNode(_component_Input, { placeholder: "Enter some text..." })
                  ]),
                  createVNode("div", null, [
                    createVNode("label", { class: "text-sm font-medium mb-2 block" }, "Search Input"),
                    createVNode(_component_Input, { placeholder: "Search for images..." })
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Card, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col space-y-1.5 p-6"${_scopeId}><h2 class="text-xl font-semibold"${_scopeId}>Badges</h2></div><div class="p-6 pt-0"${_scopeId}><div class="flex flex-wrap gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Badge, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Default`);
                } else {
                  return [
                    createTextVNode("Default")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Badge, { variant: "secondary" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Secondary`);
                } else {
                  return [
                    createTextVNode("Secondary")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Badge, { variant: "destructive" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Destructive`);
                } else {
                  return [
                    createTextVNode("Destructive")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Badge, { variant: "outline" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Outline`);
                } else {
                  return [
                    createTextVNode("Outline")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col space-y-1.5 p-6" }, [
                createVNode("h2", { class: "text-xl font-semibold" }, "Badges")
              ]),
              createVNode("div", { class: "p-6 pt-0" }, [
                createVNode("div", { class: "flex flex-wrap gap-2" }, [
                  createVNode(_component_Badge, null, {
                    default: withCtx(() => [
                      createTextVNode("Default")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_Badge, { variant: "secondary" }, {
                    default: withCtx(() => [
                      createTextVNode("Secondary")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_Badge, { variant: "destructive" }, {
                    default: withCtx(() => [
                      createTextVNode("Destructive")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_Badge, { variant: "outline" }, {
                    default: withCtx(() => [
                      createTextVNode("Outline")
                    ]),
                    _: 1
                  })
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-6">`);
      _push(ssrRenderComponent(_component_Card, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col space-y-1.5 p-6"${_scopeId}><h3 class="text-lg font-semibold"${_scopeId}>Image Search</h3></div><div class="p-6 pt-0"${_scopeId}><div class="space-y-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Input, { placeholder: "Describe what you're looking for..." }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Button, { class: "w-full" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Search Images`);
                } else {
                  return [
                    createTextVNode("Search Images")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col space-y-1.5 p-6" }, [
                createVNode("h3", { class: "text-lg font-semibold" }, "Image Search")
              ]),
              createVNode("div", { class: "p-6 pt-0" }, [
                createVNode("div", { class: "space-y-4" }, [
                  createVNode(_component_Input, { placeholder: "Describe what you're looking for..." }),
                  createVNode(_component_Button, { class: "w-full" }, {
                    default: withCtx(() => [
                      createTextVNode("Search Images")
                    ]),
                    _: 1
                  })
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Card, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col space-y-1.5 p-6"${_scopeId}><h3 class="text-lg font-semibold"${_scopeId}>Upload Status</h3></div><div class="p-6 pt-0"${_scopeId}><div class="space-y-2"${_scopeId}><div class="flex justify-between items-center"${_scopeId}><span class="text-sm"${_scopeId}>Upload Progress</span>`);
            _push2(ssrRenderComponent(_component_Badge, { variant: "secondary" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Processing`);
                } else {
                  return [
                    createTextVNode("Processing")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="flex justify-between items-center"${_scopeId}><span class="text-sm"${_scopeId}>Images Uploaded</span>`);
            _push2(ssrRenderComponent(_component_Badge, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`42`);
                } else {
                  return [
                    createTextVNode("42")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col space-y-1.5 p-6" }, [
                createVNode("h3", { class: "text-lg font-semibold" }, "Upload Status")
              ]),
              createVNode("div", { class: "p-6 pt-0" }, [
                createVNode("div", { class: "space-y-2" }, [
                  createVNode("div", { class: "flex justify-between items-center" }, [
                    createVNode("span", { class: "text-sm" }, "Upload Progress"),
                    createVNode(_component_Badge, { variant: "secondary" }, {
                      default: withCtx(() => [
                        createTextVNode("Processing")
                      ]),
                      _: 1
                    })
                  ]),
                  createVNode("div", { class: "flex justify-between items-center" }, [
                    createVNode("span", { class: "text-sm" }, "Images Uploaded"),
                    createVNode(_component_Badge, null, {
                      default: withCtx(() => [
                        createTextVNode("42")
                      ]),
                      _: 1
                    })
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex gap-4">`);
      _push(ssrRenderComponent(_component_Button, {
        variant: "outline",
        onClick: ($event) => _ctx.$router.push("/")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Back to Search `);
          } else {
            return [
              createTextVNode(" Back to Search ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Button, {
        variant: "outline",
        onClick: ($event) => _ctx.$router.push("/admin")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Go to Admin `);
          } else {
            return [
              createTextVNode(" Go to Admin ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/shadcn-test.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=shadcn-test-4qbM_Mt2.mjs.map
