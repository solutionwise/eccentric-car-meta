import { ref, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderAttr } from 'vue/server-renderer';
import { u as useApi } from './useApi-CDkid88y.mjs';

const _sfc_main$1 = {
  __name: "tags-input",
  __ssrInlineRender: true,
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: "Add a tag..."
    },
    disabled: {
      type: Boolean,
      default: false
    },
    containerClass: {
      type: String,
      default: ""
    },
    maxTags: {
      type: Number,
      default: void 0
    },
    validateTag: {
      type: Function,
      default: () => true
    },
    addOnBlur: {
      type: Boolean,
      default: true
    },
    duplicateTagBehavior: {
      type: String,
      default: "prevent",
      // 'prevent', 'allow', 'update'
      validator: (value) => ["prevent", "allow", "update"].includes(value)
    },
    trim: {
      type: Boolean,
      default: true
    },
    caseSensitive: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:modelValue", "tag:add", "tag:remove", "tag:update"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const containerRef = ref();
    ref();
    const inputValue = ref("");
    watch(() => props.modelValue, () => {
    }, { deep: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "containerRef",
        ref: containerRef,
        class: ["flex flex-wrap gap-1 border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md min-h-[40px]", __props.containerClass]
      }, _attrs))}><!--[-->`);
      ssrRenderList(__props.modelValue, (tag, index) => {
        _push(`<div class="inline-flex items-center gap-1 rounded-md border border-transparent bg-secondary px-2 py-1 text-sm font-medium text-secondary-foreground ring-offset-background transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"><span>${ssrInterpolate(tag)}</span><button type="button" class="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-secondary-foreground/20"${ssrIncludeBooleanAttr(__props.disabled) ? " disabled" : ""}><svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
      });
      _push(`<!--]--><input${ssrRenderAttr("value", inputValue.value)} type="text" class="flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 min-w-[120px]"${ssrRenderAttr("placeholder", __props.placeholder)}${ssrIncludeBooleanAttr(__props.disabled) ? " disabled" : ""}></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/tags-input.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "TagManager",
  __ssrInlineRender: true,
  props: {
    imageId: {
      type: [String, Number],
      required: true
    },
    initialTags: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    maxTags: {
      type: Number,
      default: void 0
    }
  },
  emits: ["tags-updated"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const localTags = ref([...props.initialTags]);
    const loading = ref(false);
    const loadingMessage = ref("");
    const error = ref("");
    const { apiCall } = useApi();
    watch(() => props.initialTags, (newTags) => {
      localTags.value = [...newTags];
    }, { deep: true });
    const validateTag = (tag) => {
      if (!tag || tag.trim().length === 0) {
        return "Tag cannot be empty";
      }
      if (tag.length > 50) {
        return "Tag cannot be longer than 50 characters";
      }
      if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
        return "Tag can only contain letters, numbers, spaces, hyphens, and underscores";
      }
      return true;
    };
    const handleTagAdd = async (tag) => {
      var _a;
      if (props.disabled || loading.value) return;
      loading.value = true;
      loadingMessage.value = "Adding tag...";
      error.value = "";
      try {
        const response = await apiCall(`/api/images/${props.imageId}/tags`, {
          method: "POST",
          body: { tag }
        });
        localTags.value = response.tags || [];
        emit("tags-updated", localTags.value);
      } catch (err) {
        error.value = ((_a = err.data) == null ? void 0 : _a.error) || "Failed to add tag";
        console.error("Add tag error:", err);
        localTags.value = [...props.initialTags];
      } finally {
        loading.value = false;
        loadingMessage.value = "";
      }
    };
    const handleTagRemove = async (tag, index) => {
      var _a;
      if (props.disabled || loading.value) return;
      loading.value = true;
      loadingMessage.value = "Removing tag...";
      error.value = "";
      try {
        const response = await apiCall(`/api/images/${props.imageId}/tags/${encodeURIComponent(tag)}`, {
          method: "DELETE"
        });
        localTags.value = response.tags || [];
        emit("tags-updated", localTags.value);
      } catch (err) {
        error.value = ((_a = err.data) == null ? void 0 : _a.error) || "Failed to remove tag";
        console.error("Remove tag error:", err);
        localTags.value = [...props.initialTags];
      } finally {
        loading.value = false;
        loadingMessage.value = "";
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-3" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$1, {
        modelValue: localTags.value,
        "onUpdate:modelValue": ($event) => localTags.value = $event,
        placeholder: "Add a tag...",
        disabled: __props.disabled || loading.value,
        "onTag:add": handleTagAdd,
        "onTag:remove": handleTagRemove,
        "validate-tag": validateTag,
        "max-tags": __props.maxTags,
        "duplicate-tag-behavior": "prevent",
        trim: ""
      }, null, _parent));
      if (loading.value) {
        _push(`<div class="text-sm text-gray-500">${ssrInterpolate(loadingMessage.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (error.value) {
        _push(`<div class="text-sm text-red-600">${ssrInterpolate(error.value)}</div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TagManager.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=TagManager-qrc6UM1p.mjs.map
