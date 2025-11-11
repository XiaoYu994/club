// 格式化时间
export function formatTime(timestamp){
  const now = new Date().getTime();
  const diff = now - timestamp;
  
  if (diff < 60000) { // 1分钟内
    return '刚刚';
  } else if (diff < 3600000) { // 1小时内
    return Math.floor(diff / 60000) + '分钟前';
  } else if (diff < 86400000) { // 1天内
    return Math.floor(diff / 3600000) + '小时前';
  } else if (diff < 604800000) { // 1周内
    return Math.floor(diff / 86400000) + '天前';
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
  }
}

// 格式化日期(yyyy-MM-dd)
export function formatDate(date, format = 'yyyy-MM-dd'){
  // 确保date是Date对象
  if (!(date instanceof Date)) {
    try {
      // 处理时间戳
      if (typeof date === 'number' || (typeof date === 'string' && !isNaN(Number(date)))) {
        // 将时间戳转换为数字并创建Date对象
        const timestamp = Number(date);
        date = new Date(timestamp);
      } else {
        // 处理日期字符串
        date = new Date(date);
      }
      
      // 检查是否为有效日期
      if (isNaN(date.getTime())) {
        console.error('无效的日期:', date);
        return '无效日期';
      }
    } catch (error) {
      console.error('日期转换错误:', error, '原始值:', date);
      return '日期错误';
    }
  }
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  // 根据指定格式返回日期字符串
  return format
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('hh', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// 格式化时间(HH:mm)
export function formatOnlyTime(date){
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 获取图片URL（可选择是否添加时间戳防止缓存）
 * @param {string} url - 原始图片URL
 * @param {string} defaultUrl - 默认图片URL，当原始URL为空时使用
 * @param {boolean} addTimestamp - 是否添加时间戳防止缓存，默认为true
 * @returns {string} 处理后的图片URL
 */
export function getImageUrl(url, defaultUrl = '/static/images/default-poster.png', addTimestamp = true) {
  if (!url) return defaultUrl;
  
  try {
    // 移除可能已存在的时间戳参数
    let cleanUrl = url;
    if (url.includes('?t=') || url.includes('&t=')) {
      cleanUrl = url.replace(/[?&]t=\d+/g, '');
    }
    
    // 根据参数决定是否添加时间戳
    if (addTimestamp) {
      // 添加新的时间戳参数
      const timestamp = new Date().getTime();
      return cleanUrl.includes('?') ? 
        `${cleanUrl}&t=${timestamp}` : 
        `${cleanUrl}?t=${timestamp}`;
    } else {
      // 不添加时间戳，直接返回干净的URL
      return cleanUrl;
    }
  } catch (e) {
    console.error('处理图片URL出错:', e);
    return url || defaultUrl;
  }
}