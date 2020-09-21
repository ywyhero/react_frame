  // 判断机型 Android IOSX IOS
  export const isAndroid_ios = () => {
    var phone = window.navigator.userAgent;
    //android终端或者uc浏览器
    var isAndroid = phone.indexOf('Android') > -1 || phone.indexOf('Linux') > -1;
    //ios终端
    var isiOS = !!phone.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    //iphone X
    var isX = window.screen.height >= 812
    let phoneModel = ''
    if (isAndroid) {
      phoneModel = 'Android'
    } else if (isiOS) {
      if (isX) {
        phoneModel = 'IOSX'
      } else {
        phoneModel = 'IOS'
      }
    }
    return phoneModel
  }

  /**
   * 判断是否是微信环境
  */
 export const isWeixin = () => {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) === "micromessenger") {
        return true;
    }
    return false;
  };

/**
 * 调用原生
 *
 * @param {string} key 方法
 * @param {*} args
 */
export const appCall = (key, args = null) => {
  const data = JSON.stringify({ key, args })
  console.log('data: ', data)
  const mobileType = isAndroid_ios();
  if (mobileType === 'Android') {
      window.MKAPPWebViewJavascriptBridge.postMessage(data)
  } else if (mobileType === 'IOSX' || mobileType === 'IOS') {
      window.webkit.messageHandlers.MKAPPWebViewJavascriptBridge.postMessage(data)
  }
}

export const query2Dict = (param) => {
  var pattern = /([^?&=]+)=([^&#]*)/g;
  var dict = {};
  var search = null;
  if (typeof param === "object" && param instanceof Location) {
      search = param.search;
  } else if (typeof param === "string") {
      search = param;
  } else {
      throw new Error("参数类型非法！请传入window.loaction对象或者url字符串。");
  }
  search.replace(pattern, function (rs, $1, $2) {
      var key = decodeURIComponent($1);
      var value = decodeURIComponent($2);
      dict[key] = value;
      return rs;
  });
  return dict;
}