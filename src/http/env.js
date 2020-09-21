const CONFIG = {
    localhost: {
        api: '',
        assetsRoot: '', // 静态资源域名
    },
    dev: {
        api: '',
        assetsRoot: '', // 静态资源域名
    },
    pre: {
        api: '',
        assetsRoot: ''
    },
    prod: {
        api: '',
        assetsRoot: ''
    }
}

const host = window.location.host;
if (host.includes('')) {
    global.apiUrl = CONFIG.dev
} else if (host.includes('')) {
    global.apiUrl = CONFIG.pre
} else if (host.includes('')) {
    global.apiUrl = CONFIG.prod
} else {
    global.apiUrl = CONFIG.localhost
}

export default global.apiUrl