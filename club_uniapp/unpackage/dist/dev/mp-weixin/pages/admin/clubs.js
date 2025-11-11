"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  (_easycom_custom_nav_bar2 + _easycom_uni_popup2 + _easycom_uni_popup_dialog2)();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
const _easycom_uni_popup_dialog = () => "../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_popup + _easycom_uni_popup_dialog)();
}
const _sfc_main = {
  __name: "clubs",
  setup(__props) {
    const clubs = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const searchKeyword = common_vendor.ref("");
    const clubForm = common_vendor.ref({
      name: "",
      description: "",
      logo: "",
      // 可以后续添加上传功能
      orderNum: 9999,
      type: 0,
      address: "",
      contact: "",
      createUserId: null
    });
    const clubTypeIndex = common_vendor.ref(0);
    const clubTypes = ["普通社团", "院级社团", "校级社团"];
    const confirmPopup = common_vendor.ref(null);
    const confirmDialogTitle = common_vendor.ref("");
    const confirmDialogContent = common_vendor.ref("");
    const confirmAction = common_vendor.ref("");
    const currentClub = common_vendor.ref(null);
    const confirmStatus = common_vendor.ref(false);
    const actionPopup = common_vendor.ref(null);
    const actionButtons = common_vendor.ref([]);
    const createPopup = common_vendor.ref(null);
    const userSelectorPopup = common_vendor.ref(null);
    const users = common_vendor.ref([]);
    const filteredUsers = common_vendor.ref([]);
    const selectedUser = common_vendor.ref(null);
    const userSearchKeyword = common_vendor.ref("");
    const loadingUsers = common_vendor.ref(false);
    const orderPopup = common_vendor.ref(null);
    const orderForm = common_vendor.ref({
      clubId: null,
      orderNum: 9999
    });
    const detailPopup = common_vendor.ref(null);
    const clubDetail = common_vendor.ref(null);
    const editPopup = common_vendor.ref(null);
    const editForm = common_vendor.ref({
      name: "",
      description: "",
      type: 0,
      address: "",
      contact: ""
    });
    const editTypeIndex = common_vendor.ref(0);
    function loadUsers() {
      loadingUsers.value = true;
      api_api.apiModule.admin.user.getUsers({ pageSize: 50 }).then((res) => {
        if (res.code === 200) {
          users.value = res.data.list || [];
          filteredUsers.value = [...users.value];
        } else {
          common_vendor.index.showToast({
            title: "加载用户失败",
            icon: "none"
          });
        }
        loadingUsers.value = false;
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/admin/clubs.vue:381", "加载用户列表失败", err);
        loadingUsers.value = false;
        common_vendor.index.showToast({
          title: "加载用户失败",
          icon: "none"
        });
      });
    }
    function showUserSelector() {
      if (users.value.length === 0) {
        loadUsers();
      }
      userSearchKeyword.value = "";
      filteredUsers.value = [...users.value];
      userSelectorPopup.value.open();
    }
    function closeUserSelector() {
      userSelectorPopup.value.close();
    }
    function selectUser(user) {
      selectedUser.value = user;
      clubForm.value.createUserId = user.id;
      userSelectorPopup.value.close();
    }
    function searchUsers() {
      if (!userSearchKeyword.value) {
        filteredUsers.value = [...users.value];
        return;
      }
      const keyword = userSearchKeyword.value.toLowerCase();
      filteredUsers.value = users.value.filter(
        (user) => user.username && user.username.toLowerCase().includes(keyword) || user.mobile && user.mobile.includes(keyword) || user.id.toString().includes(keyword)
      );
    }
    function getUserInitial(user) {
      const name = user.username || "";
      return name ? name.charAt(0).toUpperCase() : "#";
    }
    function chooseLogo() {
      common_vendor.index.chooseImage({
        count: 1,
        // 限制只能选择一张图片
        sizeType: ["compressed"],
        // 压缩图片
        sourceType: ["album", "camera"],
        // 可以从相册或拍照
        success: (res) => {
          common_vendor.index.showLoading({
            title: "上传中...",
            mask: true
          });
          const tempFilePath = res.tempFilePaths[0];
          uploadLogo(tempFilePath);
        }
      });
    }
    function uploadLogo(filePath) {
      api_api.apiModule.common.upload(filePath).then((res) => {
        common_vendor.index.hideLoading();
        if (res.code === 200 && res.data && res.data.url) {
          clubForm.value.logo = res.data.url;
          common_vendor.index.showToast({
            title: "上传成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: "上传失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "上传失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/admin/clubs.vue:476", "上传Logo失败", err);
      });
    }
    function previewImage() {
      if (clubForm.value.logo) {
        common_vendor.index.previewImage({
          urls: [clubForm.value.logo],
          current: clubForm.value.logo
        });
      }
    }
    function removeLogo(e) {
      e && e.stopPropagation();
      common_vendor.index.showModal({
        title: "删除确认",
        content: "确定要删除已上传的Logo吗？",
        success: (res) => {
          if (res.confirm) {
            clubForm.value.logo = "";
            common_vendor.index.showToast({
              title: "已删除",
              icon: "success"
            });
          }
        }
      });
    }
    function loadClubs() {
      api_api.apiModule.admin.club.getClubs({
        pageNo: page.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value
      }).then((res) => {
        if (res.code === 200) {
          clubs.value = res.data.list;
          total.value = res.data.total;
        }
      });
    }
    function handleTypeChange(e) {
      clubTypeIndex.value = e.detail.value;
      clubForm.value.type = parseInt(e.detail.value);
    }
    function showActionMenu(club) {
      currentClub.value = club;
      const opts = [];
      if (club.status) {
        opts.push({ text: "禁用", value: "disable" });
      } else {
        opts.push({ text: "启用", value: "enable" });
      }
      opts.push({ text: "查看详情", value: "detail" });
      opts.push({ text: "编辑信息", value: "edit" });
      opts.push({ text: "设置排序", value: "order" });
      opts.push({ text: "删除", value: "delete" });
      actionButtons.value = opts;
      actionPopup.value.open();
    }
    function handleActionMenuItem(btn) {
      switch (btn.value) {
        case "enable":
          showStatusConfirm(currentClub.value, true);
          break;
        case "disable":
          showStatusConfirm(currentClub.value, false);
          break;
        case "detail":
          showClubDetail(currentClub.value);
          break;
        case "edit":
          showEditClub(currentClub.value);
          break;
        case "order":
          showOrderUpdate(currentClub.value);
          break;
        case "delete":
          showDeleteConfirm(currentClub.value);
          break;
      }
      actionPopup.value.close();
    }
    function showStatusConfirm(club, status) {
      confirmDialogTitle.value = `${status ? "启用" : "禁用"}确认`;
      confirmDialogContent.value = `确定要${status ? "启用" : "禁用"}社团"${club.name}"吗？`;
      currentClub.value = club;
      confirmAction.value = "status";
      confirmStatus.value = status;
      confirmPopup.value.open();
    }
    function showDeleteConfirm(club) {
      confirmDialogTitle.value = "删除确认";
      confirmDialogContent.value = `确定要删除社团"${club.name}"吗？此操作不可撤销。`;
      currentClub.value = club;
      confirmAction.value = "delete";
      confirmPopup.value.open();
    }
    function handleConfirmAction() {
      if (!currentClub.value)
        return;
      if (confirmAction.value === "delete") {
        deleteClub(currentClub.value);
      } else if (confirmAction.value === "status") {
        updateClubStatus(currentClub.value, confirmStatus.value);
      }
      confirmPopup.value.close();
    }
    function updateClubStatus(club, status) {
      const updateData = {
        clubId: club.id,
        status: status ? 1 : 0
        // 转换布尔值为整数
      };
      api_api.apiModule.admin.club.updateClubStatus(updateData).then((res) => {
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "状态更新成功",
            icon: "success"
          });
          loadClubs();
        } else {
          common_vendor.index.showToast({
            title: res.message || "更新失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/admin/clubs.vue:653", "更新社团状态失败", err);
      });
    }
    function deleteClub(club) {
      api_api.apiModule.admin.club.deleteClub(club.id).then((res) => {
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
          loadClubs();
        } else {
          common_vendor.index.showToast({
            title: res.message || "删除失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/admin/clubs.vue:680", "删除社团失败", err);
      });
    }
    function showCreateModal() {
      clubForm.value = {
        name: "",
        description: "",
        logo: "",
        orderNum: 9999,
        type: 0,
        address: "",
        contact: "",
        createUserId: null
      };
      clubTypeIndex.value = 0;
      selectedUser.value = null;
      createPopup.value.open();
    }
    function submitCreate() {
      if (!clubForm.value.name) {
        common_vendor.index.showToast({
          title: "请输入社团名称",
          icon: "none"
        });
        return;
      }
      if (!clubForm.value.createUserId) {
        common_vendor.index.showToast({
          title: "请选择创建人",
          icon: "none"
        });
        return;
      }
      api_api.apiModule.admin.club.createClub(clubForm.value).then((res) => {
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "创建成功",
            icon: "success"
          });
          createPopup.value.close();
          loadClubs();
        } else {
          common_vendor.index.showToast({
            title: res.message || "创建失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.showToast({
          title: "创建失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/admin/clubs.vue:742", "创建社团失败", err);
      });
    }
    function cancelCreate() {
      createPopup.value.close();
    }
    function prevPage() {
      if (page.value > 1) {
        page.value--;
        loadClubs();
      }
    }
    function nextPage() {
      if (page.value * pageSize.value < total.value) {
        page.value++;
        loadClubs();
      }
    }
    function showOrderUpdate(club) {
      orderForm.value.clubId = club.id;
      orderForm.value.orderNum = club.orderNum;
      orderPopup.value.open();
    }
    function submitOrderUpdate() {
      if (!orderForm.value.clubId)
        return;
      if (isNaN(orderForm.value.orderNum) || orderForm.value.orderNum < 0) {
        common_vendor.index.showToast({
          title: "请输入有效的数字",
          icon: "none"
        });
        return;
      }
      api_api.apiModule.admin.club.updateClubOrder(orderForm.value).then((res) => {
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "排序更新成功",
            icon: "success"
          });
          orderPopup.value.close();
          loadClubs();
        } else {
          common_vendor.index.showToast({
            title: res.message || "更新失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/admin/clubs.vue:799", "更新排序失败", err);
      });
    }
    function cancelOrderUpdate() {
      orderPopup.value.close();
    }
    function getClubTypeName(type) {
      return clubTypes[type] || "未知类型";
    }
    function showClubDetail(club) {
      common_vendor.index.showLoading({
        title: "加载中...",
        mask: true
      });
      api_api.apiModule.admin.club.getClubDetail(club.id).then((res) => {
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          clubDetail.value = res.data;
          detailPopup.value.open();
        } else {
          common_vendor.index.showToast({
            title: res.message || "获取详情失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("warn", "at pages/admin/clubs.vue:833", "API not implemented, using mock data", err);
        clubDetail.value = {
          ...club,
          president: { username: "张三" },
          // 模拟社长信息
          totalMembers: 25,
          normalMembers: 20,
          officers: 3,
          teachers: 2,
          activityCount: 8,
          recruitmentCount: 2,
          applicationCount: 15
        };
        detailPopup.value.open();
      });
    }
    function closeDetailPopup() {
      detailPopup.value.close();
    }
    function showEditClub(club) {
      editForm.value = {
        name: club.name,
        description: club.description || "",
        type: club.type || 0,
        address: club.address || "",
        contact: club.contact || ""
      };
      editTypeIndex.value = club.type || 0;
      currentClub.value = club;
      editPopup.value.open();
    }
    function handleEditTypeChange(e) {
      editTypeIndex.value = e.detail.value;
      editForm.value.type = parseInt(e.detail.value);
    }
    function submitEditClub() {
      if (!editForm.value.name) {
        common_vendor.index.showToast({
          title: "请输入社团名称",
          icon: "none"
        });
        return;
      }
      const updateData = {
        ...editForm.value
      };
      api_api.apiModule.admin.club.updateClub(currentClub.value.id, updateData).then((res) => {
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "更新成功",
            icon: "success"
          });
          editPopup.value.close();
          loadClubs();
        } else {
          common_vendor.index.showToast({
            title: res.message || "更新失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.showToast({
          title: "更新失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/admin/clubs.vue:908", "更新社团失败", err);
      });
    }
    function cancelEditClub() {
      editPopup.value.close();
    }
    common_vendor.onMounted(() => {
      loadClubs();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "社团管理"
        }),
        b: searchKeyword.value,
        c: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        d: common_vendor.o(loadClubs),
        e: common_vendor.o(showCreateModal),
        f: common_vendor.f(clubs.value, (club, idx, i0) => {
          return {
            a: common_vendor.t((page.value - 1) * pageSize.value + idx + 1),
            b: common_vendor.t(club.name),
            c: common_vendor.t(clubTypes[club.type || 0]),
            d: common_vendor.t(club.status ? "启用" : "禁用"),
            e: common_vendor.n(club.status ? "status-active" : "status-inactive"),
            f: common_vendor.o(($event) => showActionMenu(club), club.id),
            g: club.id
          };
        }),
        g: common_vendor.o(prevPage),
        h: page.value === 1,
        i: common_vendor.t(page.value),
        j: common_vendor.o(nextPage),
        k: page.value * pageSize.value >= total.value,
        l: clubForm.value.name,
        m: common_vendor.o(($event) => clubForm.value.name = $event.detail.value),
        n: clubForm.value.description,
        o: common_vendor.o(($event) => clubForm.value.description = $event.detail.value),
        p: common_vendor.t(clubTypes[clubTypeIndex.value]),
        q: clubTypeIndex.value,
        r: clubTypes,
        s: common_vendor.o(handleTypeChange),
        t: clubForm.value.logo
      }, clubForm.value.logo ? {
        v: clubForm.value.logo,
        w: common_vendor.o(removeLogo),
        x: common_vendor.o(previewImage)
      } : {
        y: common_vendor.o(chooseLogo)
      }, {
        z: clubForm.value.orderNum,
        A: common_vendor.o(($event) => clubForm.value.orderNum = $event.detail.value),
        B: clubForm.value.address,
        C: common_vendor.o(($event) => clubForm.value.address = $event.detail.value),
        D: clubForm.value.contact,
        E: common_vendor.o(($event) => clubForm.value.contact = $event.detail.value),
        F: selectedUser.value
      }, selectedUser.value ? {
        G: common_vendor.t(selectedUser.value.username || "用户" + selectedUser.value.id)
      } : {}, {
        H: common_vendor.o(showUserSelector),
        I: common_vendor.o(cancelCreate),
        J: common_vendor.o(submitCreate),
        K: common_vendor.sr(createPopup, "15b47829-1", {
          "k": "createPopup"
        }),
        L: common_vendor.p({
          type: "center",
          ["background-color"]: "transparent"
        }),
        M: orderForm.value.orderNum,
        N: common_vendor.o(($event) => orderForm.value.orderNum = $event.detail.value),
        O: common_vendor.o(submitOrderUpdate),
        P: common_vendor.o(cancelOrderUpdate),
        Q: common_vendor.p({
          title: "设置排序",
          ["before-close"]: true
        }),
        R: common_vendor.sr(orderPopup, "15b47829-2", {
          "k": "orderPopup"
        }),
        S: common_vendor.p({
          type: "dialog"
        }),
        T: common_vendor.o([($event) => userSearchKeyword.value = $event.detail.value, searchUsers]),
        U: userSearchKeyword.value,
        V: loadingUsers.value
      }, loadingUsers.value ? {} : {}, {
        W: common_vendor.f(filteredUsers.value, (user, k0, i0) => {
          return common_vendor.e({
            a: user.avatar
          }, user.avatar ? {
            b: user.avatar
          } : {
            c: common_vendor.t(getUserInitial(user))
          }, {
            d: common_vendor.t(user.username || "用户" + user.id),
            e: common_vendor.t(user.mobile || "无联系方式"),
            f: user.id,
            g: common_vendor.o(($event) => selectUser(user), user.id)
          });
        }),
        X: filteredUsers.value.length === 0 && !loadingUsers.value
      }, filteredUsers.value.length === 0 && !loadingUsers.value ? {} : {}, {
        Y: common_vendor.o(closeUserSelector),
        Z: common_vendor.sr(userSelectorPopup, "15b47829-4", {
          "k": "userSelectorPopup"
        }),
        aa: common_vendor.p({
          type: "bottom"
        }),
        ab: common_vendor.o(handleConfirmAction),
        ac: common_vendor.o(($event) => _ctx.$refs.confirmPopup.close()),
        ad: common_vendor.p({
          title: confirmDialogTitle.value,
          content: confirmDialogContent.value,
          ["before-close"]: true
        }),
        ae: common_vendor.sr(confirmPopup, "15b47829-5", {
          "k": "confirmPopup"
        }),
        af: common_vendor.p({
          type: "dialog"
        }),
        ag: common_vendor.f(actionButtons.value, (btn, idx, i0) => {
          return {
            a: common_vendor.t(btn.text),
            b: idx,
            c: common_vendor.o(($event) => handleActionMenuItem(btn), idx)
          };
        }),
        ah: common_vendor.o(($event) => actionPopup.value.close()),
        ai: common_vendor.sr(actionPopup, "15b47829-7", {
          "k": "actionPopup"
        }),
        aj: common_vendor.p({
          type: "bottom",
          borderRadius: "8px"
        }),
        ak: clubDetail.value
      }, clubDetail.value ? common_vendor.e({
        al: common_vendor.t(clubDetail.value.name),
        am: common_vendor.t(getClubTypeName(clubDetail.value.type)),
        an: common_vendor.t(clubDetail.value.status ? "启用" : "禁用"),
        ao: common_vendor.n(clubDetail.value.status ? "status-active" : "status-inactive"),
        ap: common_vendor.t(clubDetail.value.address || "未设置"),
        aq: common_vendor.t(clubDetail.value.contact || "未设置"),
        ar: common_vendor.t(clubDetail.value.viewCount || 0),
        as: common_vendor.t(clubDetail.value.president ? clubDetail.value.president.username : "未设置"),
        at: common_vendor.t(clubDetail.value.totalMembers || 0),
        av: common_vendor.t(clubDetail.value.normalMembers || 0),
        aw: common_vendor.t(clubDetail.value.officers || 0),
        ax: common_vendor.t(clubDetail.value.teachers || 0),
        ay: common_vendor.t(clubDetail.value.activityCount || 0),
        az: common_vendor.t(clubDetail.value.recruitmentCount || 0),
        aA: common_vendor.t(clubDetail.value.applicationCount || 0),
        aB: clubDetail.value.description
      }, clubDetail.value.description ? {
        aC: common_vendor.t(clubDetail.value.description)
      } : {}) : {}, {
        aD: common_vendor.o(closeDetailPopup),
        aE: common_vendor.sr(detailPopup, "15b47829-8", {
          "k": "detailPopup"
        }),
        aF: common_vendor.p({
          type: "center",
          ["background-color"]: "transparent"
        }),
        aG: editForm.value.name,
        aH: common_vendor.o(($event) => editForm.value.name = $event.detail.value),
        aI: editForm.value.description,
        aJ: common_vendor.o(($event) => editForm.value.description = $event.detail.value),
        aK: common_vendor.t(clubTypes[editTypeIndex.value]),
        aL: editTypeIndex.value,
        aM: clubTypes,
        aN: common_vendor.o(handleEditTypeChange),
        aO: editForm.value.address,
        aP: common_vendor.o(($event) => editForm.value.address = $event.detail.value),
        aQ: editForm.value.contact,
        aR: common_vendor.o(($event) => editForm.value.contact = $event.detail.value),
        aS: common_vendor.o(cancelEditClub),
        aT: common_vendor.o(submitEditClub),
        aU: common_vendor.sr(editPopup, "15b47829-9", {
          "k": "editPopup"
        }),
        aV: common_vendor.p({
          type: "center",
          ["background-color"]: "transparent"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-15b47829"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/clubs.js.map
