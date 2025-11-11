/**
 * 认证工具模块
 * 处理token和用户信息的存取
 */

// token存储的key
const TOKEN_KEY = 'token';
// 用户信息存储的key
const USER_INFO_KEY = 'club_user_info';

/**
 * 保存token到本地
 * @param {string} token 用户令牌
 */
export function setToken(token) {
  uni.setStorageSync(TOKEN_KEY, token);
}

/**
 * 获取token
 * @returns {string|null} 用户令牌
 */
export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || null;
}

/**
 * 移除token
 */
export function removeToken() {
  uni.removeStorageSync(TOKEN_KEY);
}

/**
 * 保存用户信息
 * @param {Object} userInfo 用户信息对象
 */
export function setUser(userInfo) {
  uni.setStorageSync(USER_INFO_KEY, userInfo);
}

/**
 * 获取用户信息
 * @returns {Object|null} 用户信息对象
 */
export function getUser() {
  return uni.getStorageSync(USER_INFO_KEY) || null;
}

/**
 * 移除用户信息
 */
export function removeUser() {
  uni.removeStorageSync(USER_INFO_KEY);
}

/**
 * 登录成功处理
 * @param {string} token 用户令牌
 * @param {Object} userInfo 用户信息
 */
export function handleLoginSuccess(token, userInfo) {
  setToken(token);
  setUser(userInfo);
}

/**
 * 登出处理
 */
export function logout() {
  removeToken();
  removeUser();
}

/**
 * 判断用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn() {
  return !!getToken() && !!getUser();
}

/**
 * 判断用户是否是管理员
 * @returns {boolean} 是否是管理员
 */
export function isAdmin() {
  const user = getUser();
  return user ? user.isAdmin === true : false;
}

/**
 * 判断用户是否是社团管理员
 * @param {number} clubId 社团ID
 * @returns {boolean} 是否是社团管理员
 */
export function isClubAdmin(clubId) {
  const user = getUser();
  if (!user || !user.clubs) return false;
  
  const club = user.clubs.find(c => c.id === clubId);
  return club ? club.role === 'admin' || club.role === 'owner' : false;
}

export default {
  setToken,
  getToken,
  removeToken,
  setUser,
  getUser,
  removeUser,
  handleLoginSuccess,
  logout,
  isLoggedIn,
  isAdmin,
  isClubAdmin
} 