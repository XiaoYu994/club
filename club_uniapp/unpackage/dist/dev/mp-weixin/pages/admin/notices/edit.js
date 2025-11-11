"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_api = require("../../../api/api.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_custom_nav_bar2 + _easycom_uni_icons2 + _easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_select2 + _easycom_uni_forms2)();
}
const _easycom_custom_nav_bar = () => "../../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_easyinput = () => "../../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_select = () => "../../../uni_modules/uni-data-select/components/uni-data-select/uni-data-select.js";
const _easycom_uni_forms = () => "../../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_icons + _easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_select + _easycom_uni_forms)();
}
const _sfc_main = {
  __name: "edit",
  setup(__props) {
    const noticeId = common_vendor.ref(null);
    const isEdit = common_vendor.computed(() => !!noticeId.value);
    const loading = common_vendor.ref(false);
    const submitting = common_vendor.ref(false);
    const form = common_vendor.ref(null);
    const editorHeight = common_vendor.ref("300px");
    const formData = common_vendor.reactive({
      title: "",
      content: "",
      coverImage: "",
      type: 0,
      isTop: 0
    });
    const typeOptions = common_vendor.ref([
      { value: 0, text: "普通公告" },
      { value: 1, text: "重要公告" },
      { value: 2, text: "紧急公告" }
    ]);
    const rules = {
      title: {
        rules: [
          { required: true, errorMessage: "请输入公告标题" },
          { minLength: 2, maxLength: 50, errorMessage: "标题长度应在2-50个字符之间" }
        ]
      },
      content: {
        rules: [
          { required: true, errorMessage: "请输入公告内容" },
          { minLength: 5, errorMessage: "内容不能少于5个字符" }
        ]
      }
    };
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/admin/notices/edit.vue:138", "onLoad options:", options);
      if (options && options.id) {
        noticeId.value = options.id;
        common_vendor.index.__f__("log", "at pages/admin/notices/edit.vue:141", "Setting noticeId in onLoad to:", noticeId.value);
        loadNoticeDetail();
      }
    });
    common_vendor.onMounted(() => {
      const token = common_vendor.index.getStorageSync("adminToken");
      if (!token) {
        common_vendor.index.reLaunch({
          url: "/pages/admin/login"
        });
        return;
      }
      common_vendor.index.getSystemInfo({
        success: (res) => {
          const windowHeight = res.windowHeight;
          editorHeight.value = windowHeight * 0.4 + "px";
        }
      });
    });
    const loadNoticeDetail = async () => {
      loading.value = true;
      try {
        const response = await api_api.apiModule.admin.notice.getNoticeDetail(noticeId.value);
        common_vendor.index.__f__("log", "at pages/admin/notices/edit.vue:175", "Notice detail response:", response);
        if (response.code === 200 && response.data) {
          const detail = response.data;
          formData.title = detail.title || "";
          formData.content = detail.content || "";
          formData.coverImage = detail.coverImage || "";
          formData.type = detail.type || 0;
          formData.isTop = detail.isTop || 0;
        } else {
          common_vendor.index.showToast({
            title: response.message || "获取公告详情失败",
            icon: "none"
          });
          setTimeout(() => {
            goBack();
          }, 1500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/notices/edit.vue:197", "获取公告详情失败:", error);
        common_vendor.index.showToast({
          title: "获取公告详情失败，请重试",
          icon: "none"
        });
        setTimeout(() => {
          goBack();
        }, 1500);
      } finally {
        loading.value = false;
      }
    };
    const chooseImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          uploadImage(res.tempFilePaths[0]);
        }
      });
    };
    const uploadImage = async (filePath) => {
      common_vendor.index.showLoading({
        title: "上传中..."
      });
      try {
        const res = await api_api.apiModule.common.upload(filePath);
        if (res && res.code === 200) {
          formData.coverImage = res.data;
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "上传成功",
            icon: "success"
          });
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: (res == null ? void 0 : res.message) || "上传失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/notices/edit.vue:251", "上传图片失败:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "上传失败，请重试",
          icon: "none"
        });
      }
    };
    const previewImage = () => {
      if (formData.coverImage) {
        common_vendor.index.previewImage({
          urls: [formData.coverImage],
          current: 0
        });
      }
    };
    const removeImage = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要移除封面图片吗？",
        success: (res) => {
          if (res.confirm) {
            formData.coverImage = "";
          }
        }
      });
    };
    const submitForm = () => {
      form.value.validate().then(async (res) => {
        if (res) {
          submitting.value = true;
          try {
            let response;
            if (isEdit.value) {
              response = await api_api.apiModule.admin.notice.updateNotice(noticeId.value, formData);
            } else {
              response = await api_api.apiModule.admin.notice.createNotice(formData);
            }
            if (response.code === 200) {
              common_vendor.index.showToast({
                title: isEdit.value ? "修改成功" : "发布成功",
                icon: "success"
              });
              setTimeout(() => {
                goBack();
              }, 1500);
            } else {
              common_vendor.index.showToast({
                title: response.message || (isEdit.value ? "修改失败" : "发布失败"),
                icon: "none"
              });
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/admin/notices/edit.vue:324", isEdit.value ? "修改公告失败:" : "发布公告失败:", error);
            common_vendor.index.showToast({
              title: isEdit.value ? "修改失败，请重试" : "发布失败，请重试",
              icon: "none"
            });
          } finally {
            submitting.value = false;
          }
        }
      });
    };
    const onTopChange = (e) => {
      formData.isTop = e.detail.value ? 1 : 0;
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: isEdit.value ? "编辑公告" : "发布公告"
        }),
        b: loading.value
      }, loading.value ? {
        c: common_vendor.p({
          type: "spinner-cycle",
          size: "32",
          color: "#2979ff"
        })
      } : common_vendor.e({
        d: common_vendor.o(($event) => formData.title = $event),
        e: common_vendor.p({
          placeholder: "请输入公告标题",
          maxlength: "50",
          trim: "both",
          modelValue: formData.title
        }),
        f: common_vendor.p({
          label: "标题",
          name: "title",
          required: true
        }),
        g: !formData.coverImage
      }, !formData.coverImage ? {
        h: common_vendor.p({
          type: "image",
          size: "32",
          color: "#999"
        }),
        i: common_vendor.o(chooseImage)
      } : {
        j: formData.coverImage,
        k: common_vendor.o(previewImage),
        l: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#fff"
        }),
        m: common_vendor.o(removeImage)
      }, {
        n: common_vendor.p({
          label: "封面图",
          name: "coverImage"
        }),
        o: editorHeight.value,
        p: formData.content,
        q: common_vendor.o(($event) => formData.content = $event.detail.value),
        r: common_vendor.t(formData.content.length),
        s: common_vendor.p({
          label: "内容",
          name: "content",
          required: true
        }),
        t: common_vendor.o(($event) => formData.type = $event),
        v: common_vendor.p({
          localdata: typeOptions.value,
          clear: false,
          placeholder: "请选择公告类型",
          modelValue: formData.type
        }),
        w: common_vendor.p({
          label: "类型",
          name: "type"
        }),
        x: formData.isTop === 1,
        y: common_vendor.o(onTopChange),
        z: common_vendor.p({
          label: "置顶",
          name: "isTop"
        }),
        A: common_vendor.sr(form, "f7acf352-2", {
          "k": "form"
        }),
        B: common_vendor.p({
          modelValue: formData,
          rules,
          labelWidth: "80px"
        }),
        C: common_vendor.o(goBack),
        D: common_vendor.t(submitting.value ? "提交中..." : isEdit.value ? "保存修改" : "发布公告"),
        E: submitting.value,
        F: common_vendor.o(submitForm)
      }));
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f7acf352"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/admin/notices/edit.js.map
