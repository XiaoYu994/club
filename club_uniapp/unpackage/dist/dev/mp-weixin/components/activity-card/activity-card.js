"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_common = require("../../utils/common.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "activity-card",
  props: {
    activity: {
      type: Object,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  emits: ["detail", "edit", "delete"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const statusText = common_vendor.computed(() => {
      if (props.activity.status === 0) {
        return "已取消";
      }
      const now = Date.now();
      const startTime = Number(props.activity.startTime || 0);
      const endTime = Number(props.activity.endTime || 0);
      if (now > endTime) {
        return "已结束";
      } else if (now >= startTime && now <= endTime) {
        return "进行中";
      } else {
        return "报名中";
      }
    });
    const getStatusClass = common_vendor.computed(() => {
      if (props.activity.status === 0) {
        return "cancelled";
      }
      const now = Date.now();
      const startTime = Number(props.activity.startTime || 0);
      const endTime = Number(props.activity.endTime || 0);
      if (now > endTime) {
        return "ended";
      } else if (now >= startTime && now <= endTime) {
        return "ongoing";
      } else {
        return "signup";
      }
    });
    const goToActivityDetail = () => {
      emit("detail", props.activity);
    };
    const editActivity = () => {
      emit("edit", props.activity);
    };
    const deleteActivity = () => {
      emit("delete", props.activity);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.activity.poster || "/static/images/default-club.png",
        b: common_vendor.t(__props.activity.title),
        c: common_vendor.p({
          type: "calendar",
          size: "14",
          color: "#666"
        }),
        d: common_vendor.t(common_vendor.unref(utils_common.formatDate)(__props.activity.startTime)),
        e: common_vendor.p({
          type: "location",
          size: "14",
          color: "#666"
        }),
        f: common_vendor.t(__props.activity.address || "未设置地点"),
        g: common_vendor.t(statusText.value),
        h: common_vendor.n(getStatusClass.value.value),
        i: common_vendor.t(__props.activity.joinCount || 0),
        j: __props.isAdmin
      }, __props.isAdmin ? {
        k: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#2979ff"
        }),
        l: common_vendor.o(editActivity),
        m: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#f44336"
        }),
        n: common_vendor.o(deleteActivity)
      } : {}, {
        o: common_vendor.o(goToActivityDetail)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c7fee59a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/activity-card/activity-card.js.map
