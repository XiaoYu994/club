"use strict";
const common_vendor = require("../../common/vendor.js");
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
  __name: "detail",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const statusBarHeight = common_vendor.ref(20);
    const id = common_vendor.ref(null);
    const isAdmin = common_vendor.ref(false);
    const isMember = common_vendor.ref(false);
    const memberStatus = common_vendor.ref(null);
    const clubDetail = common_vendor.ref({});
    const clubActivities = common_vendor.ref([]);
    const hasMoreActivities = common_vendor.ref(false);
    const clubMembers = common_vendor.ref([]);
    const hasMoreMembers = common_vendor.ref(false);
    const formFields = common_vendor.ref([]);
    const defaultReason = common_vendor.ref("");
    const applyInfo = common_vendor.ref(null);
    const hasApplied = common_vendor.ref(false);
    const parsedForms = common_vendor.ref({});
    const userInfo = common_vendor.ref({
      username: "",
      studentId: "",
      avatar: ""
    });
    const recruitmentInfo = common_vendor.ref(null);
    const isRecruitmentPeriod = common_vendor.ref(false);
    const extJsonData = common_vendor.ref({});
    const joinPopup = common_vendor.ref(null);
    const actionSheet = common_vendor.ref(null);
    common_vendor.onMounted(async () => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 20;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      id.value = currentPage.options.id || currentPage.options.clubId;
      loadClubDetail();
      await getUserInfo();
      loadClubActivities();
      loadClubMembers();
      checkApplyStatus();
      checkRecruitmentStatus();
    });
    const getUserInfo = async () => {
      try {
        const res = await proxy.$api.user.getUserInfo();
        if (res.code === 200) {
          userInfo.value = res.data;
          await checkUserRole();
        }
      } catch (error) {
      }
    };
    const loadClubDetail = async () => {
      if (!id.value) {
        common_vendor.index.__f__("error", "at pages/club/detail.vue:401", "社团ID为空");
        common_vendor.index.showToast({ title: "社团ID无效", icon: "none" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        common_vendor.index.__f__("log", "at pages/club/detail.vue:411", "正在加载社团详情，ID:", id.value);
        const res = await proxy.$api.club.getClubDetail(id.value);
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("log", "at pages/club/detail.vue:415", "社团详情加载结果:", res);
        if (res.code === 200 && res.data) {
          clubDetail.value = res.data;
          parseExtJson();
          if (clubDetail.value.recruitment) {
            recruitmentInfo.value = clubDetail.value.recruitment;
          }
          parseForms();
        } else {
          common_vendor.index.__f__("error", "at pages/club/detail.vue:431", "社团详情数据无效:", res);
          common_vendor.index.showToast({ title: res.message || "加载失败", icon: "none" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/club/detail.vue:435", "加载社团详情异常:", e);
        common_vendor.index.hideLoading();
      }
    };
    const parseExtJson = () => {
      try {
        let extJson = clubDetail.value.ext_json || "{}";
        if (typeof extJson === "string") {
          extJson = JSON.parse(extJson);
        }
        extJsonData.value = extJson;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/club/detail.vue:449", "解析扩展字段失败", e);
        extJsonData.value = {};
      }
    };
    const loadClubActivities = async () => {
      try {
        const params = {
          pageNo: 1,
          pageSize: 3,
          clubId: id.value
          // 明確添加clubId參數
        };
        const res = await proxy.$api.activity.getClubActivities(id.value, params);
        if (res.code === 200) {
          let activities = res.data.list || [];
          if (!isAdmin.value) {
            activities = activities.filter((activity) => activity.status === 2 || activity.status === 3);
          }
          clubActivities.value = activities;
          hasMoreActivities.value = res.data.total > clubActivities.value.length;
        } else {
          common_vendor.index.__f__("error", "at pages/club/detail.vue:478", "加载社团活动失败:", res.message);
          clubActivities.value = [];
          hasMoreActivities.value = false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/detail.vue:483", "加载社团活动失败:", error);
        clubActivities.value = [];
        hasMoreActivities.value = false;
      }
    };
    const loadClubMembers = async () => {
      try {
        const res = await proxy.$api.club.getClubMembers(id.value, { pageNo: 1, pageSize: 5 });
        if (res.code === 200) {
          clubMembers.value = res.data.list || [];
          hasMoreMembers.value = res.data.total > clubMembers.value.length;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/detail.vue:499", "加载社团成员失败", error);
      }
    };
    const checkUserRole = async () => {
      try {
        if (!id.value)
          return;
        const res = await proxy.$api.club.getUserRole(id.value);
        if (res.code === 200 && res.data) {
          isAdmin.value = res.data.type > 0 && res.data.status === 1;
          isMember.value = res.data.status === 1;
          memberStatus.value = res.data.status;
        } else {
          isAdmin.value = false;
          isMember.value = false;
          memberStatus.value = null;
        }
      } catch (error) {
        isAdmin.value = false;
        isMember.value = false;
        memberStatus.value = null;
      }
    };
    const checkApplyStatus = async () => {
      try {
        if (!id.value)
          return;
        const res = await proxy.$api.club.checkApplyStatus(id.value);
        if (res.code === 200) {
          if (res.data) {
            hasApplied.value = true;
            applyInfo.value = res.data;
            try {
              if (applyInfo.value.forms) {
                if (typeof applyInfo.value.forms === "string") {
                  parsedForms.value = JSON.parse(applyInfo.value.forms);
                } else if (typeof applyInfo.value.forms === "object") {
                  parsedForms.value = applyInfo.value.forms;
                } else {
                  parsedForms.value = {};
                }
              } else {
                parsedForms.value = {};
              }
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/club/detail.vue:558", "解析表单数据失败:", e);
              parsedForms.value = {};
            }
          } else {
            hasApplied.value = false;
            applyInfo.value = null;
            parsedForms.value = {};
          }
        }
      } catch (error) {
        hasApplied.value = false;
        applyInfo.value = null;
      }
    };
    const checkRecruitmentStatus = async () => {
      try {
        if (!id.value)
          return;
        const res = await proxy.$api.club.getActiveRecruitment(id.value);
        if (res.code === 200 && res.data) {
          recruitmentInfo.value = res.data;
          const now = Date.now();
          const startTime = Number(recruitmentInfo.value.startTime || 0);
          const endTime = Number(recruitmentInfo.value.endTime || 0);
          isRecruitmentPeriod.value = now >= startTime && now <= endTime && recruitmentInfo.value.status === 1;
          if (recruitmentInfo.value.forms) {
            parseFormFieldsFromRecruitment();
          }
        } else {
          recruitmentInfo.value = null;
          isRecruitmentPeriod.value = false;
        }
      } catch (error) {
        recruitmentInfo.value = null;
        isRecruitmentPeriod.value = false;
      }
    };
    const parseFormFieldsFromRecruitment = () => {
      try {
        if (recruitmentInfo.value.forms) {
          let formConfig;
          if (typeof recruitmentInfo.value.forms === "object") {
            formConfig = recruitmentInfo.value.forms;
          } else {
            formConfig = JSON.parse(recruitmentInfo.value.forms);
          }
          if (!Array.isArray(formConfig)) {
            formConfig = [formConfig];
          }
          formFields.value = formConfig.map((field) => {
            return {
              key: field.name.toLowerCase().replace(/\s/g, "_"),
              label: field.name,
              type: field.type || "text",
              required: field.required || false,
              value: "",
              options: field.options || []
            };
          });
        } else {
          formFields.value = [];
        }
      } catch (e) {
        formFields.value = [];
      }
    };
    const getTypeText = (type) => {
      switch (type) {
        case 0:
          return "普通社团";
        case 1:
          return "院级社团";
        case 2:
          return "校级社团";
        default:
          return "未知类型";
      }
    };
    const getTypeClass = (type) => {
      switch (type) {
        case 0:
          return "normal";
        case 1:
          return "college";
        case 2:
          return "school";
        default:
          return "";
      }
    };
    const getMemberRoleText = (type) => {
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
    const getActivityStatusText = (activity) => {
      const status = activity.status;
      if (status === 0) {
        return "已取消";
      }
      if (status === 1) {
        return "计划中";
      }
      if (status === 3) {
        return "已结束";
      }
      const now = Date.now();
      const startTime = Number(activity.startTime || 0);
      const endTime = Number(activity.endTime || 0);
      if (now > endTime) {
        return "已结束";
      } else if (now >= startTime && now <= endTime) {
        return "进行中";
      } else {
        return "报名中";
      }
    };
    const getActivityStatusClass = (activity) => {
      const status = activity.status;
      if (status === 0) {
        return "cancelled";
      }
      if (status === 1) {
        return "planned";
      }
      if (status === 3) {
        return "ended";
      }
      const now = Date.now();
      const startTime = Number(activity.startTime || 0);
      const endTime = Number(activity.endTime || 0);
      if (now > endTime) {
        return "ended";
      } else if (now >= startTime && now <= endTime) {
        return "ongoing";
      } else {
        return "signup";
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const goToActivity = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/activity/activityDeatil?id=${item.id}`
      });
    };
    const viewAllActivities = () => {
      common_vendor.index.navigateTo({
        url: `/pages/club/activities?clubId=${id.value}&clubName=${encodeURIComponent(clubDetail.value.name)}`
      });
    };
    const viewAllMembers = () => {
      common_vendor.index.navigateTo({
        url: `/pages/club/members?clubId=${id.value}&clubName=${encodeURIComponent(clubDetail.value.name)}`
      });
    };
    const goToApply = () => {
      if (!isUserInfoComplete()) {
        return;
      }
      if (!recruitmentInfo.value || !isRecruitmentPeriod.value) {
        common_vendor.index.showToast({ title: "当前不在招新期间", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/club/apply?clubId=${id.value}&recruitmentId=${recruitmentInfo.value ? recruitmentInfo.value.id : ""}`
      });
    };
    const isUserInfoComplete = () => {
      const requiredFields = ["username", "studentId", "mobile", "college", "className"];
      const missingFields = [];
      for (const field of requiredFields) {
        if (!userInfo.value[field]) {
          missingFields.push(getFieldDisplayName(field));
        }
      }
      if (missingFields.length > 0) {
        common_vendor.index.showModal({
          title: "信息不完整",
          content: `您的个人信息不完整，缺少: ${missingFields.join("、")}，请先完善个人信息后再申请加入社团`,
          confirmText: "去完善",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.switchTab({
                url: "/pages/user/user"
              });
            }
          }
        });
        return false;
      }
      return true;
    };
    const getFieldDisplayName = (field) => {
      const nameMap = {
        username: "姓名",
        studentId: "学号",
        mobile: "手机号",
        college: "学院",
        className: "班级",
        major: "专业"
      };
      return nameMap[field] || field;
    };
    const closeJoinForm = () => {
      joinPopup.value.close();
    };
    const onOptionChange = (index, e) => {
      const selectedIndex = e.detail.value;
      formFields.value[index].value = formFields.value[index].options[selectedIndex];
    };
    const onCheckboxChange = (index, e) => {
      formFields.value[index].value = e.detail.value.join(",");
    };
    const isOptionChecked = (value, option) => {
      if (!value)
        return false;
      const values = value.split(",");
      return values.includes(option);
    };
    const submitJoin = async () => {
      if (!isUserInfoComplete()) {
        return;
      }
      if (!isRecruitmentPeriod.value) {
        common_vendor.index.showToast({
          title: "当前不在招新期间",
          icon: "none"
        });
        return;
      }
      let formData = {};
      if (formFields.value.length > 0) {
        const missingFields = formFields.value.filter((field) => field.required && !field.value);
        if (missingFields.length > 0) {
          common_vendor.index.showToast({
            title: `请填写${missingFields[0].label}`,
            icon: "none"
          });
          return;
        }
        formFields.value.forEach((field) => {
          formData[field.key] = field.value;
        });
      } else {
        if (!defaultReason.value.trim()) {
          common_vendor.index.showToast({
            title: "请填写申请理由",
            icon: "none"
          });
          return;
        }
        formData = {
          reason: defaultReason.value
        };
      }
      if (recruitmentInfo.value && recruitmentInfo.value.id) {
        formData.recruitmentId = recruitmentInfo.value.id;
      }
      try {
        common_vendor.index.showLoading({ title: "提交中..." });
        const res = await proxy.$api.club.applyJoinClub(id.value, formData);
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          closeJoinForm();
          hasApplied.value = true;
          applyInfo.value = {
            id: res.data.applyId,
            clubId: id.value,
            userId: userInfo.value.id,
            status: res.data.status || 0,
            forms: JSON.stringify(formData),
            feedback: "",
            createTime: Date.now()
          };
          parsedForms.value = formData;
          common_vendor.index.showToast({
            title: "申请已提交，等待审核",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: res.message || "申请失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        await checkApplyStatus();
        if (hasApplied.value) {
          closeJoinForm();
        } else {
          common_vendor.index.showToast({
            title: "申请失败，请稍后重试",
            icon: "none"
          });
        }
      }
    };
    const showMemberActions = () => {
      actionSheet.value.open();
    };
    const hideActionSheet = () => {
      actionSheet.value.close();
    };
    const quitClub = () => {
      common_vendor.index.showModal({
        title: "退出申请",
        content: "确认要提交退出社团申请吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "处理中..." });
              const result = await proxy.$api.club.updateMemberStatus({ clubId: id.value, userId: userInfo.value.id, status: 2 });
              common_vendor.index.hideLoading();
              if (result.code === 200) {
                memberStatus.value = 2;
                isMember.value = false;
                common_vendor.index.showToast({ title: "退出申请已提交，请等待管理员审核", icon: "success" });
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
    const editClub = () => {
      common_vendor.index.navigateTo({
        url: `/pages/club/editClub?id=${id.value}`
      });
    };
    const manageMembers = () => {
      common_vendor.index.navigateTo({
        url: `/pages/club/members?clubId=${id.value}&clubName=${encodeURIComponent(clubDetail.value.name)}`
      });
    };
    const manageActivities = () => {
      common_vendor.index.navigateTo({
        url: `/pages/club/activities?clubId=${id.value}&clubName=${encodeURIComponent(clubDetail.value.name)}`
      });
    };
    const manageApplies = () => {
      common_vendor.index.navigateTo({
        url: `/pages/club/applies?clubId=${id.value}&clubName=${encodeURIComponent(clubDetail.value.name)}`
      });
    };
    const getRecruitmentStatusText = () => {
      if (recruitmentInfo.value.status === 0) {
        return "招新已结束";
      } else if (isRecruitmentPeriod.value) {
        return "当前招新中";
      } else {
        return "招新未开始";
      }
    };
    const getRecruitmentStatusClass = () => {
      if (recruitmentInfo.value.status === 0) {
        return "ended";
      } else if (isRecruitmentPeriod.value) {
        return "ongoing";
      } else {
        return "planned";
      }
    };
    const goToEditRecruitment = () => {
      common_vendor.index.navigateTo({
        url: `/pages/club/createRecruitment?clubId=${id.value}&recruitmentId=${recruitmentInfo.value ? recruitmentInfo.value.id : ""}`
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: statusBarHeight.value + "px",
        b: common_vendor.o(goBack),
        c: common_vendor.p({
          title: "社团详情",
          showBack: true
        }),
        d: clubDetail.value.logo || "/static/images/default-club.png",
        e: common_vendor.t(clubDetail.value.name || "加载中..."),
        f: common_vendor.t(getTypeText(clubDetail.value.type)),
        g: common_vendor.n(getTypeClass(clubDetail.value.type)),
        h: common_vendor.p({
          type: "person",
          size: "18",
          color: "#b13b7a"
        }),
        i: common_vendor.t(clubDetail.value.memberCount || 0),
        j: common_vendor.p({
          type: "location",
          size: "18",
          color: "#b13b7a"
        }),
        k: common_vendor.t(clubDetail.value.address || "未设置地点"),
        l: clubDetail.value.contact
      }, clubDetail.value.contact ? {
        m: common_vendor.p({
          type: "phone",
          size: "18",
          color: "#b13b7a"
        }),
        n: common_vendor.t(clubDetail.value.contact)
      } : {}, {
        o: common_vendor.p({
          type: "eye",
          size: "18",
          color: "#b13b7a"
        }),
        p: common_vendor.t(clubDetail.value.viewCount || 0),
        q: extJsonData.value && Object.keys(extJsonData.value).length > 0
      }, extJsonData.value && Object.keys(extJsonData.value).length > 0 ? {
        r: common_vendor.f(extJsonData.value, (value, key, i0) => {
          return {
            a: common_vendor.t(key),
            b: common_vendor.t(value),
            c: key
          };
        })
      } : {}, {
        s: clubDetail.value.description || "暂无简介",
        t: recruitmentInfo.value
      }, recruitmentInfo.value ? common_vendor.e({
        v: isAdmin.value
      }, isAdmin.value ? {
        w: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#b13b7a"
        })
      } : {}, {
        x: common_vendor.t(recruitmentInfo.value.title),
        y: common_vendor.p({
          type: "calendar",
          size: "18",
          color: "#b13b7a"
        }),
        z: common_vendor.t(common_vendor.unref(utils_common.formatDate)(recruitmentInfo.value.startTime)),
        A: common_vendor.t(common_vendor.unref(utils_common.formatDate)(recruitmentInfo.value.endTime)),
        B: common_vendor.t(getRecruitmentStatusText()),
        C: common_vendor.n(getRecruitmentStatusClass()),
        D: recruitmentInfo.value.description
      }, recruitmentInfo.value.description ? {
        E: recruitmentInfo.value.description
      } : {}, {
        F: common_vendor.o(($event) => isAdmin.value ? goToEditRecruitment() : null),
        G: isAdmin.value ? 1 : ""
      }) : {}, {
        H: clubActivities.value.length > 0
      }, clubActivities.value.length > 0 ? common_vendor.e({
        I: common_vendor.f(clubActivities.value, (item, idx, i0) => {
          return {
            a: item.poster || "/static/images/default-club.png",
            b: common_vendor.t(item.title),
            c: common_vendor.t(common_vendor.unref(utils_common.formatDate)(item.startTime)),
            d: common_vendor.t(getActivityStatusText(item)),
            e: common_vendor.n(getActivityStatusClass(item)),
            f: idx,
            g: common_vendor.o(($event) => goToActivity(item), idx)
          };
        }),
        J: hasMoreActivities.value
      }, hasMoreActivities.value ? {
        K: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        L: common_vendor.o(viewAllActivities)
      } : {}) : {}, {
        M: isAdmin.value || isMember.value
      }, isAdmin.value || isMember.value ? common_vendor.e({
        N: common_vendor.f(clubMembers.value.slice(0, 4), (member, idx, i0) => {
          return {
            a: member.user.avatar || "/static/images/avatar-default.png",
            b: common_vendor.t(member.user.username),
            c: common_vendor.t(getMemberRoleText(member.type)),
            d: common_vendor.n(member.type > 0 ? "admin" : ""),
            e: idx
          };
        }),
        O: hasMoreMembers.value
      }, hasMoreMembers.value ? {
        P: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        Q: common_vendor.o(viewAllMembers)
      } : {}) : {}, {}, {
        X: isAdmin.value
      }, isAdmin.value ? {
        Y: common_vendor.o(editClub),
        Z: common_vendor.o(manageMembers),
        aa: common_vendor.o(manageActivities),
        ab: common_vendor.o(manageApplies)
      } : common_vendor.e({
        ac: memberStatus.value === 0
      }, memberStatus.value === 0 ? {} : memberStatus.value === 2 ? {} : !isMember.value ? {
        af: common_vendor.o(goToApply)
      } : {
        ag: common_vendor.o(showMemberActions)
      }, {
        ad: memberStatus.value === 2,
        ae: !isMember.value
      }), {
        ah: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        ai: common_vendor.o(closeJoinForm),
        aj: recruitmentInfo.value
      }, recruitmentInfo.value ? common_vendor.e({
        ak: common_vendor.t(recruitmentInfo.value.title),
        al: common_vendor.t(common_vendor.unref(utils_common.formatDate)(recruitmentInfo.value.startTime)),
        am: common_vendor.t(common_vendor.unref(utils_common.formatDate)(recruitmentInfo.value.endTime)),
        an: recruitmentInfo.value.description
      }, recruitmentInfo.value.description ? {
        ao: recruitmentInfo.value.description
      } : {}) : {}, {
        ap: formFields.value && formFields.value.length > 0
      }, formFields.value && formFields.value.length > 0 ? {
        aq: common_vendor.f(formFields.value, (field, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.t(field.label),
            b: common_vendor.t(field.required ? " *" : ""),
            c: field.type === "text"
          }, field.type === "text" ? {
            d: "请输入" + field.label,
            e: field.value,
            f: common_vendor.o(($event) => field.value = $event.detail.value, idx)
          } : {}, {
            g: field.type === "number"
          }, field.type === "number" ? {
            h: "请输入" + field.label,
            i: field.value,
            j: common_vendor.o(($event) => field.value = $event.detail.value, idx)
          } : {}, {
            k: field.type === "textarea"
          }, field.type === "textarea" ? {
            l: "请输入" + field.label,
            m: field.value,
            n: common_vendor.o(($event) => field.value = $event.detail.value, idx)
          } : {}, {
            o: field.type === "select" || field.type === "radio"
          }, field.type === "select" || field.type === "radio" ? {
            p: common_vendor.t(field.value || "请选择" + field.label),
            q: field.options,
            r: common_vendor.o((e) => onOptionChange(idx, e), idx)
          } : {}, {
            s: field.type === "checkbox"
          }, field.type === "checkbox" ? {
            t: common_vendor.f(field.options, (option, optIdx, i1) => {
              return {
                a: option,
                b: isOptionChecked(field.value, option),
                c: common_vendor.t(option),
                d: optIdx
              };
            }),
            v: common_vendor.o((e) => onCheckboxChange(idx, e), idx)
          } : {}, {
            w: idx
          });
        })
      } : {
        ar: defaultReason.value,
        as: common_vendor.o(($event) => defaultReason.value = $event.detail.value)
      }, {
        at: common_vendor.o(closeJoinForm),
        av: common_vendor.o(submitJoin),
        aw: common_vendor.sr(joinPopup, "425dc59c-9", {
          "k": "joinPopup"
        }),
        ax: common_vendor.p({
          type: "bottom"
        }),
        ay: isMember.value && !isAdmin.value && memberStatus.value === 1
      }, isMember.value && !isAdmin.value && memberStatus.value === 1 ? {
        az: common_vendor.p({
          type: "close",
          size: "20",
          color: "#f44336"
        }),
        aA: common_vendor.o(quitClub)
      } : {}, {
        aB: common_vendor.o(hideActionSheet),
        aC: common_vendor.sr(actionSheet, "425dc59c-11", {
          "k": "actionSheet"
        }),
        aD: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-425dc59c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/club/detail.js.map
