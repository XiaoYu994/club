"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_common = require("../../utils/common.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_custom_nav_bar2 + _easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "members",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const clubId = common_vendor.ref(null);
    const clubName = common_vendor.ref("");
    const searchKeyword = common_vendor.ref("");
    const currentTag = common_vendor.ref(0);
    const filterTags = common_vendor.ref([
      { name: "全部成员", type: "all" },
      { name: "普通成员", type: "normal" },
      { name: "管理员", type: "admin" },
      { name: "退出申请", type: "exit" }
    ]);
    const roleOptions = [
      { name: "全部", value: -1 },
      { name: "普通成员", value: 0 },
      { name: "管理员", value: 1 },
      { name: "社长", value: 2 }
    ];
    const sortOptions = [
      { name: "默认排序", value: "join_time" },
      { name: "按姓名", value: "username" },
      { name: "按学号", value: "student_id" }
    ];
    const filters = common_vendor.reactive({
      role: -1,
      sortBy: "join_time",
      isAsc: false
    });
    const memberList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const isAdmin = common_vendor.ref(false);
    const isPresident = common_vendor.ref(false);
    const selectedMember = common_vendor.ref(null);
    const filterPopup = common_vendor.ref(null);
    const actionSheet = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      clubId.value = currentPage.options.clubId;
      clubName.value = decodeURIComponent(currentPage.options.clubName || "");
      checkUserRole();
      loadMembers();
    });
    const checkUserRole = async () => {
      try {
        if (!clubId.value)
          return;
        const res = await proxy.$api.club.getUserRole(clubId.value);
        if (res.code === 200 && res.data) {
          isAdmin.value = res.data.type > 0 && res.data.status === 1;
          isPresident.value = res.data.type === 2 && res.data.status === 1;
        } else {
          isAdmin.value = false;
          isPresident.value = false;
          isPresident.value = false;
        }
      } catch (error) {
        isAdmin.value = false;
      }
    };
    const loadMembers = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        const params = {
          pageNo: page.value,
          pageSize: pageSize.value,
          keyword: searchKeyword.value,
          orderBy: filters.sortBy,
          isAsc: filters.isAsc
        };
        if (currentTag.value > 0) {
          const tagType = filterTags.value[currentTag.value].type;
          if (tagType === "normal") {
            params.type = 0;
          } else if (tagType === "admin") {
            params.type = 1;
          } else if (tagType === "exit") {
            params.status = 2;
          }
        }
        if (filters.role !== -1) {
          params.type = filters.role;
        }
        const res = await proxy.$api.club.getClubMembers(clubId.value, params);
        if (res.code === 200) {
          const members = res.data.list || [];
          if (page.value === 1) {
            memberList.value = members;
          } else {
            memberList.value = [...memberList.value, ...members];
          }
          hasMore.value = members.length === pageSize.value;
          page.value++;
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/members.vue:345", "加载成员列表失败", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
        refreshing.value = false;
      }
    };
    const refreshMembers = () => {
      refreshing.value = true;
      page.value = 1;
      hasMore.value = true;
      searchKeyword.value = "";
      currentTag.value = 0;
      resetFilters();
      loadMembers();
    };
    const loadMore = () => {
      if (hasMore.value && !isLoading.value) {
        loadMembers();
      }
    };
    const searchMembers = () => {
      page.value = 1;
      loadMembers();
    };
    const switchTag = (idx) => {
      if (currentTag.value === idx)
        return;
      currentTag.value = idx;
      page.value = 1;
      searchKeyword.value = "";
      resetFilters();
      loadMembers();
    };
    const showFilterDrawer = () => {
      filterPopup.value.open();
    };
    const closeFilterDrawer = () => {
      filterPopup.value.close();
    };
    const selectRole = (role) => {
      filters.role = role;
    };
    const selectSort = (sort) => {
      filters.sortBy = sort;
      filters.isAsc = false;
    };
    const resetFilters = () => {
      filters.role = -1;
      filters.sortBy = "join_time";
      filters.isAsc = false;
    };
    const applyFilters = () => {
      page.value = 1;
      closeFilterDrawer();
      loadMembers();
    };
    const getRoleText = (type) => {
      switch (type) {
        case 0:
          return "普通成员";
        case 1:
          return "管理员";
        case 2:
          return "社长";
        default:
          return "未知角色";
      }
    };
    const getRoleClass = (type) => {
      switch (type) {
        case 0:
          return "normal";
        case 1:
          return "admin";
        case 2:
          return "president";
        default:
          return "";
      }
    };
    const showActionSheet = (member) => {
      selectedMember.value = member;
      actionSheet.value.open();
    };
    const hideActionSheet = () => {
      actionSheet.value.close();
    };
    const promoteMember = async () => {
      if (!selectedMember.value)
        return;
      try {
        common_vendor.index.showLoading({ title: "处理中..." });
        const res = await proxy.$api.club.updateMemberRole({
          clubId: clubId.value,
          userId: selectedMember.value.userId,
          type: 1
          // 设为管理员
        });
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "已设为管理员",
            icon: "success"
          });
          const index = memberList.value.findIndex((item) => item.userId === selectedMember.value.userId);
          if (index !== -1) {
            memberList.value[index].type = 1;
          }
          hideActionSheet();
        } else {
          common_vendor.index.showToast({
            title: res.message || "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const demoteMember = async () => {
      if (!selectedMember.value)
        return;
      try {
        common_vendor.index.showLoading({ title: "处理中..." });
        const res = await proxy.$api.club.updateMemberRole({
          clubId: clubId.value,
          userId: selectedMember.value.userId,
          type: 0
          // 设为普通成员
        });
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "已取消管理员",
            icon: "success"
          });
          const index = memberList.value.findIndex((item) => item.userId === selectedMember.value.userId);
          if (index !== -1) {
            memberList.value[index].type = 0;
          }
          hideActionSheet();
        } else {
          common_vendor.index.showToast({
            title: res.message || "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const removeMember = () => {
      if (!selectedMember.value)
        return;
      common_vendor.index.showModal({
        title: "确认移除",
        content: `确定要将 ${selectedMember.value.user.username} 移出社团吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "处理中..." });
              const result = await proxy.$api.club.removeMember({
                clubId: clubId.value,
                userId: selectedMember.value.userId
              });
              if (result.code === 200) {
                common_vendor.index.showToast({
                  title: "已移除成员",
                  icon: "success"
                });
                memberList.value = memberList.value.filter((item) => item.userId !== selectedMember.value.userId);
                hideActionSheet();
              } else {
                common_vendor.index.showToast({
                  title: result.message || "操作失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.showToast({
                title: "网络异常，请稍后重试",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const toggleDisableMember = () => {
      if (!selectedMember.value)
        return;
      const newStatus = selectedMember.value.status === 1 ? 0 : 1;
      const action = newStatus === 1 ? "启用" : "禁用";
      common_vendor.index.showModal({
        title: `${action}成员`,
        content: `确定要${action}【${selectedMember.value.user.username}】吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "处理中..." });
              const result = await proxy.$api.club.updateMemberStatus({ clubId: clubId.value, userId: selectedMember.value.userId, status: newStatus });
              common_vendor.index.hideLoading();
              if (result.code === 200) {
                common_vendor.index.showToast({ title: `${action}成功`, icon: "success" });
                const index = memberList.value.findIndex((item) => item.userId === selectedMember.value.userId);
                if (index !== -1) {
                  memberList.value[index].status = newStatus;
                }
                hideActionSheet();
                checkUserRole();
              } else {
                common_vendor.index.showToast({ title: result.message || "操作失败", icon: "none" });
              }
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
            }
          }
        }
      });
    };
    const approveExit = () => {
      if (!selectedMember.value)
        return;
      common_vendor.index.showModal({
        title: "同意退出",
        content: `确定同意【${selectedMember.value.user.username}】退出社团吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "处理中..." });
              const result = await proxy.$api.club.removeMember({ clubId: clubId.value, userId: selectedMember.value.userId });
              common_vendor.index.hideLoading();
              if (result.code === 200) {
                common_vendor.index.showToast({ title: "已同意退出", icon: "success" });
                memberList.value = memberList.value.filter((item) => item.userId !== selectedMember.value.userId);
                hideActionSheet();
              } else {
                common_vendor.index.showToast({ title: result.message || "操作失败", icon: "none" });
              }
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
            }
          }
        }
      });
    };
    const rejectExit = () => {
      if (!selectedMember.value)
        return;
      common_vendor.index.showModal({
        title: "拒绝退出",
        content: `确定拒绝【${selectedMember.value.user.username}】退出申请吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "处理中..." });
              const result = await proxy.$api.club.updateMemberStatus({ clubId: clubId.value, userId: selectedMember.value.userId, status: 1 });
              common_vendor.index.hideLoading();
              if (result.code === 200) {
                common_vendor.index.showToast({ title: "已拒绝退出", icon: "success" });
                const idx = memberList.value.findIndex((item) => item.userId === selectedMember.value.userId);
                if (idx !== -1)
                  memberList.value[idx].status = 1;
                hideActionSheet();
              } else {
                common_vendor.index.showToast({ title: result.message || "操作失败", icon: "none" });
              }
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
            }
          }
        }
      });
    };
    const transferPresident = async () => {
      if (!selectedMember.value)
        return;
      common_vendor.index.showModal({
        title: "转让社长",
        content: `确认将社长职位转让给【${selectedMember.value.user.username}】吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "处理中..." });
              const userRes = await proxy.$api.user.getUserInfo();
              const currentUserId = userRes.data.id;
              await proxy.$api.club.updateMemberRole({ clubId: clubId.value, userId: currentUserId, type: 1 });
              const promoteRes = await proxy.$api.club.updateMemberRole({ clubId: clubId.value, userId: selectedMember.value.userId, type: 2 });
              if (promoteRes.code === 200) {
                common_vendor.index.showToast({ title: "已转让社长", icon: "success" });
                loadMembers();
                hideActionSheet();
                checkUserRole();
              } else {
                common_vendor.index.showToast({ title: promoteRes.message || "操作失败", icon: "none" });
              }
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const exportMemberData = async () => {
      try {
        common_vendor.index.showLoading({ title: "导出中..." });
        const res = await proxy.$api.club.exportClubMembers(clubId.value);
        if (res.code === 200 && res.data) {
          const { url, fileName } = res.data;
          common_vendor.index.downloadFile({
            url,
            success: (res2) => {
              if (res2.statusCode === 200) {
                const tempFilePath = res2.tempFilePath;
                common_vendor.index.saveFile({
                  tempFilePath,
                  success: (saveRes) => {
                    const savedFilePath = saveRes.savedFilePath;
                    common_vendor.index.hideLoading();
                    common_vendor.index.showToast({ title: "导出成功", icon: "success" });
                    common_vendor.index.openDocument({
                      filePath: savedFilePath,
                      showMenu: true,
                      success: () => {
                        common_vendor.index.__f__("log", "at pages/club/members.vue:756", "打开文档成功");
                      },
                      fail: () => {
                        common_vendor.index.showModal({
                          title: "提示",
                          content: "导出成功，但无法直接打开Excel文件",
                          showCancel: false
                        });
                      }
                    });
                  },
                  fail: () => {
                    common_vendor.index.hideLoading();
                    common_vendor.index.showModal({
                      title: "导出提示",
                      content: "无法保存文件，是否复制下载链接？",
                      confirmText: "复制链接",
                      success: (res3) => {
                        if (res3.confirm) {
                          common_vendor.index.setClipboardData({
                            data: url,
                            success: () => {
                              common_vendor.index.showToast({
                                title: "链接已复制",
                                icon: "none"
                              });
                            }
                          });
                        }
                      }
                    });
                  }
                });
              } else {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({ title: "下载文件失败", icon: "none" });
              }
            },
            fail: () => {
              common_vendor.index.hideLoading();
              common_vendor.index.showModal({
                title: "导出提示",
                content: "下载失败，是否复制链接？",
                confirmText: "复制链接",
                success: (res2) => {
                  if (res2.confirm) {
                    common_vendor.index.setClipboardData({
                      data: url,
                      success: () => {
                        common_vendor.index.showToast({
                          title: "链接已复制",
                          icon: "none"
                        });
                      }
                    });
                  }
                }
              });
            }
          });
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: res.message || "导出失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/members.vue:847", "导出成员数据失败", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "导出失败", icon: "none" });
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          title: "社团成员 - " + clubName.value,
          showBack: true
        }),
        c: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        d: common_vendor.o(searchMembers),
        e: searchKeyword.value,
        f: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        g: isAdmin.value
      }, isAdmin.value ? {
        h: common_vendor.p({
          type: "download",
          size: "18",
          color: "#b13b7a"
        }),
        i: common_vendor.o(exportMemberData)
      } : {}, {
        j: isAdmin.value
      }, isAdmin.value ? {
        k: common_vendor.p({
          type: "paperplane",
          size: "18",
          color: "#b13b7a"
        }),
        l: common_vendor.o(showFilterDrawer)
      } : {}, {
        m: common_vendor.f(filterTags.value, (tag, idx, i0) => {
          return {
            a: common_vendor.t(tag.name),
            b: idx,
            c: common_vendor.n(currentTag.value === idx ? "active" : ""),
            d: common_vendor.o(($event) => switchTag(idx), idx)
          };
        }),
        n: common_vendor.f(memberList.value, (item, idx, i0) => {
          return common_vendor.e({
            a: item.user.avatar || "/static/images/avatar-default.png",
            b: common_vendor.t(item.user.username),
            c: common_vendor.t(getRoleText(item.type)),
            d: common_vendor.n(getRoleClass(item.type)),
            e: "cc789d89-4-" + i0,
            f: common_vendor.t(item.user.studentId || "未填写学号"),
            g: "cc789d89-5-" + i0,
            h: common_vendor.t(item.user.college || "未填写学院"),
            i: common_vendor.t(common_vendor.unref(utils_common.formatDate)(item.joinTime)),
            j: isAdmin.value && item.type < 2
          }, isAdmin.value && item.type < 2 ? {
            k: "cc789d89-6-" + i0,
            l: common_vendor.p({
              type: "more-filled",
              size: "18",
              color: "#999"
            }),
            m: common_vendor.o(($event) => showActionSheet(item), idx)
          } : {}, {
            n: idx,
            o: common_vendor.o(($event) => _ctx.showMemberDetail(item), idx)
          });
        }),
        o: common_vendor.p({
          type: "person",
          size: "14",
          color: "#666"
        }),
        p: common_vendor.p({
          type: "location",
          size: "14",
          color: "#666"
        }),
        q: isLoading.value
      }, isLoading.value ? {
        r: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        s: memberList.value.length === 0 && !isLoading.value
      }, memberList.value.length === 0 && !isLoading.value ? {
        t: common_assets._imports_0$6
      } : {}, {
        v: memberList.value.length > 0 && !hasMore.value
      }, memberList.value.length > 0 && !hasMore.value ? {} : {}, {
        w: refreshing.value,
        x: common_vendor.o(refreshMembers),
        y: common_vendor.o(loadMore),
        z: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        A: common_vendor.o(closeFilterDrawer),
        B: common_vendor.f(roleOptions, (role, idx, i0) => {
          return {
            a: common_vendor.t(role.name),
            b: idx,
            c: common_vendor.n(filters.role === role.value ? "active" : ""),
            d: common_vendor.o(($event) => selectRole(role.value), idx)
          };
        }),
        C: common_vendor.f(sortOptions, (sort, idx, i0) => {
          return {
            a: common_vendor.t(sort.name),
            b: idx,
            c: common_vendor.n(filters.sortBy === sort.value ? "active" : ""),
            d: common_vendor.o(($event) => selectSort(sort.value), idx)
          };
        }),
        D: common_vendor.o(resetFilters),
        E: common_vendor.o(applyFilters),
        F: common_vendor.sr(filterPopup, "cc789d89-8", {
          "k": "filterPopup"
        }),
        G: common_vendor.p({
          type: "bottom"
        }),
        H: selectedMember.value && selectedMember.value.type === 0 && isPresident.value
      }, selectedMember.value && selectedMember.value.type === 0 && isPresident.value ? {
        I: common_vendor.p({
          type: "arrow-up",
          size: "18",
          color: "#333"
        }),
        J: common_vendor.o(promoteMember)
      } : {}, {
        K: selectedMember.value && selectedMember.value.type === 1 && isPresident.value
      }, selectedMember.value && selectedMember.value.type === 1 && isPresident.value ? {
        L: common_vendor.p({
          type: "arrow-down",
          size: "18",
          color: "#333"
        }),
        M: common_vendor.o(demoteMember)
      } : {}, {
        N: selectedMember.value && isPresident.value && selectedMember.value.type < 2
      }, selectedMember.value && isPresident.value && selectedMember.value.type < 2 ? {
        O: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#333"
        }),
        P: common_vendor.o(transferPresident)
      } : {}, {
        Q: selectedMember.value && (selectedMember.value.status === 1 && (selectedMember.value.type === 0 || selectedMember.value.type === 1 && isPresident.value) || selectedMember.value.status === 0 && isPresident.value)
      }, selectedMember.value && (selectedMember.value.status === 1 && (selectedMember.value.type === 0 || selectedMember.value.type === 1 && isPresident.value) || selectedMember.value.status === 0 && isPresident.value) ? {
        R: common_vendor.p({
          type: "forbidden",
          size: "18",
          color: "#f44336"
        }),
        S: common_vendor.t(selectedMember.value.status === 1 ? "禁用成员" : "启用成员"),
        T: common_vendor.o(toggleDisableMember)
      } : {}, {
        U: selectedMember.value && isPresident.value && selectedMember.value.type < 2
      }, selectedMember.value && isPresident.value && selectedMember.value.type < 2 ? {
        V: common_vendor.p({
          type: "delete",
          size: "18",
          color: "#f44336"
        }),
        W: common_vendor.o(removeMember)
      } : {}, {
        X: selectedMember.value && isAdmin.value && selectedMember.value.status === 2
      }, selectedMember.value && isAdmin.value && selectedMember.value.status === 2 ? {
        Y: common_vendor.p({
          type: "check",
          size: "18",
          color: "#4caf50"
        }),
        Z: common_vendor.o(approveExit)
      } : {}, {
        aa: selectedMember.value && isAdmin.value && selectedMember.value.status === 2
      }, selectedMember.value && isAdmin.value && selectedMember.value.status === 2 ? {
        ab: common_vendor.p({
          type: "close",
          size: "18",
          color: "#f44336"
        }),
        ac: common_vendor.o(rejectExit)
      } : {}, {
        ad: common_vendor.o(hideActionSheet),
        ae: common_vendor.sr(actionSheet, "cc789d89-10", {
          "k": "actionSheet"
        }),
        af: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cc789d89"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/club/members.js.map
