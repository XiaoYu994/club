const SYSTEM_INFO = uni.getSystemInfoSync();

// 返回状态栏的高度
export const getStatusBarHeight = ()=> SYSTEM_INFO.statusBarHeight || 15;

export const getTitleBarHeight = ()=>{
	if(uni.getMenuButtonBoundingClientRect){
		let {top,height} = uni.getMenuButtonBoundingClientRect();
		return height + (top - getStatusBarHeight())*2
	}else{
		return 40;
	}
}
// 获取标题栏的高度
export const  getNavBarHeight = ()=> getStatusBarHeight()+getTitleBarHeight();

// 左上角图标位置，如果有的话
export const getLeftIconLeft = ()=> {
	// #ifdef MP-TOUTIAO
		let {leftIcon:{left,width}}  = tt.getCustomButtonBoundingClientRect();
		return left+ parseInt(width);
	// #endif

	// #ifndef MP-TOUTIAO
		return 0
	// #endif
}

// 获取胶囊按钮的右边距（用于避免右侧内容与胶囊按钮重叠）
export const getMenuButtonRight = () => {
	if (uni.getMenuButtonBoundingClientRect) {
		let { right } = uni.getMenuButtonBoundingClientRect();
		// 返回从屏幕右边缘到胶囊按钮右侧的距离，再加上一些间距
		return SYSTEM_INFO.windowWidth - right + 10; // 加10px的安全间距
	} else {
		return 10; // 默认10px
	}
}