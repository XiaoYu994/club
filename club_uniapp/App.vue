<script>
	export default {
		onLaunch: function() {
			console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
			console.log('App Launch')
		},
		onShow: function() {
			    // const token = uni.getStorageSync('token')
			    // const pages = getCurrentPages()
			    // const currentPage = pages.length ? pages[pages.length - 1] : null
			    // // 请根据你的实际登录页路径调整
			    // if (!token && (!currentPage || currentPage.route !== 'pages/user/login')) {
			    //   uni.reLaunch({ url: '/pages/user/login' })
			    // }
	
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	@import '@/common/style/common-style.scss';

	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>
