import { _ as _sfc_main$1 } from './TagManager-qrc6UM1p.mjs';
import { ref, resolveComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import './useApi-CDkid88y.mjs';
import './server.mjs';
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
  __name: "tags-demo",
  __ssrInlineRender: true,
  setup(__props) {
    const basicTags = ref(["vue", "nuxt", "javascript"]);
    const validatedTags = ref(["car", "automotive"]);
    const maxTags = ref(["tag1", "tag2"]);
    const disabledTags = ref(["disabled", "readonly"]);
    const managerTags = ref(["demo", "example"]);
    const handleTagAdd = (tag) => {
      console.log("Tag added:", tag);
    };
    const handleTagRemove = (tag, index) => {
      console.log("Tag removed:", tag, "at index:", index);
    };
    const handleTagsUpdated = (tags) => {
      managerTags.value = tags;
      console.log("Tags updated:", tags);
    };
    const validateTag = (tag) => {
      if (!tag || tag.trim().length === 0) {
        return "Tag cannot be empty";
      }
      if (tag.length > 20) {
        return "Tag cannot be longer than 20 characters";
      }
      if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
        return "Tag can only contain letters, numbers, spaces, hyphens, and underscores";
      }
      return true;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TagsInput = resolveComponent("TagsInput");
      const _component_TagManager = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50 p-8" }, _attrs))}><div class="max-w-4xl mx-auto"><h1 class="text-3xl font-bold text-gray-900 mb-8">Tags Input Demo</h1><div class="space-y-8"><div class="bg-white p-6 rounded-lg shadow"><h2 class="text-xl font-semibold mb-4">Basic Tags Input</h2>`);
      _push(ssrRenderComponent(_component_TagsInput, {
        modelValue: basicTags.value,
        "onUpdate:modelValue": ($event) => basicTags.value = $event,
        placeholder: "Add some tags...",
        "onTag:add": handleTagAdd,
        "onTag:remove": handleTagRemove
      }, null, _parent));
      _push(`<p class="mt-2 text-sm text-gray-600">Tags: ${ssrInterpolate(basicTags.value.join(", "))}</p></div><div class="bg-white p-6 rounded-lg shadow"><h2 class="text-xl font-semibold mb-4">Tags Input with Validation</h2>`);
      _push(ssrRenderComponent(_component_TagsInput, {
        modelValue: validatedTags.value,
        "onUpdate:modelValue": ($event) => validatedTags.value = $event,
        placeholder: "Add tags (letters, numbers, spaces only)...",
        "validate-tag": validateTag,
        "onTag:add": handleTagAdd,
        "onTag:remove": handleTagRemove
      }, null, _parent));
      _push(`<p class="mt-2 text-sm text-gray-600">Tags: ${ssrInterpolate(validatedTags.value.join(", "))}</p></div><div class="bg-white p-6 rounded-lg shadow"><h2 class="text-xl font-semibold mb-4">Tags Input with Max Tags (5)</h2>`);
      _push(ssrRenderComponent(_component_TagsInput, {
        modelValue: maxTags.value,
        "onUpdate:modelValue": ($event) => maxTags.value = $event,
        placeholder: "Add up to 5 tags...",
        "max-tags": 5,
        "onTag:add": handleTagAdd,
        "onTag:remove": handleTagRemove
      }, null, _parent));
      _push(`<p class="mt-2 text-sm text-gray-600">Tags: ${ssrInterpolate(maxTags.value.join(", "))}</p></div><div class="bg-white p-6 rounded-lg shadow"><h2 class="text-xl font-semibold mb-4">Disabled Tags Input</h2>`);
      _push(ssrRenderComponent(_component_TagsInput, {
        modelValue: disabledTags.value,
        "onUpdate:modelValue": ($event) => disabledTags.value = $event,
        placeholder: "This is disabled...",
        disabled: true
      }, null, _parent));
      _push(`<p class="mt-2 text-sm text-gray-600">Tags: ${ssrInterpolate(disabledTags.value.join(", "))}</p></div><div class="bg-white p-6 rounded-lg shadow"><h2 class="text-xl font-semibold mb-4">Tag Manager Component (Simulated)</h2>`);
      _push(ssrRenderComponent(_component_TagManager, {
        "image-id": 1,
        "initial-tags": managerTags.value,
        onTagsUpdated: handleTagsUpdated
      }, null, _parent));
      _push(`<p class="mt-2 text-sm text-gray-600">Tags: ${ssrInterpolate(managerTags.value.join(", "))}</p></div></div></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/tags-demo.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=tags-demo-yE7YbKib.mjs.map
