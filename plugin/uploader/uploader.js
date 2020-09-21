/**
 * 七牛云上传插件
 * v1.0.0
 *
 */
/* eslint-disable */
import './qiniu';
/**
 * 是否为函数
 * @param  {Func}  func 预期传入函数
 * @return {Boolean}      返回判断值
 */
const isFunc = func => typeof func === 'function';
/**
 * 是否为字符串
 * @param  {Func}  func 预期传入函数
 * @return {Boolean}      返回判断值
 */
const isString = str => typeof str === 'string';

// 默认校验文件类型
const typeReg = {
    image: /(\.(jpg)|(jpeg)|(png))$/,
    excel: /(\.xls[x]?)$/,
    doc: /(\.doc[x]?)$/,
    video: /(\.(mp4)|(mov)|(avi))$/,
    audio: /(\.(mp3))$/,
}
// 文件体积
const mb = 1024;
/**
 * @desc 七牛上传地址基本配置
 * @prop    {String}    runtimes            上传模式，依次退化   (默认设置即可，无需改动)
 * @prop    {String}    browse_button       上传选择的点选按钮  （必填，元素id或者元素本身）
 * @prop    {Boolean}   get_new_uptoken     上传时是否每次都重新获取新uptoken    (默认true,选填)
 */
const qiniuConf = {
    runtimes: 'html5,flash,html4',              // 上传模式，依次退化
    browse_button: 'upload',                    // 上传选择的点选按钮，必需
    // 在初始化时，uptoken，uptoken_url，uptoken_func三个参数中必须有一个被设置
    // 切如果提供了多个，其优先级为uptoken > uptoken_url > uptoken_func
    // 其中uptoken是直接提供上传凭证，uptoken_url是提供了获取上传凭证的地址，如果需要定制获取uptoken的过程则可以设置uptoken_func
    // uptoken: '',                                                     // uptoken是上传凭证，由其他程序生成
    // uptoken_url: 'http://192.168.40.234:8080/idss/qiniu',            // Ajax请求uptoken的Url，会自动触发，
    uptoken_func: function () { },                                         // 留给开发者自定义
    get_new_uptoken: true,                                          // 设置上传文件的时候是否每次都重新获取新的uptoken
    // downtoken_url: '/downtoken',
    // Ajax请求downToken的Url，私有空间时使用，JS-SDK将向该地址POST文件的key和domain，服务端返回的JSON必须包含url字段，url值为该文件的下载地址
    unique_names: false,            // 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
    save_key: false,                // 默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
    domain: '',                     // bucket域名，下载资源时用到，必需
    // container: '',               // 上传区域DOM ID，默认是browser_button的父元素
    max_file_size: '1000mb',           // 最大文件体积限制
    // flash_swf_url: './Moxie.swf',     //引入flash，相对路径
    max_retries: 0,                     // 上传失败最大重试次数
    dragdrop: true,                     // 开启可拖曳上传
    // drop_element: '',          // 拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
    chunk_size: '1000mb',                  // 分块上传时，每块的体积
    auto_start: false,                   // 选择文件后自动上传，若关闭需要自己绑定事件触发上传（此处默认关闭自动上传）
    multi_selection: false,              // 是否允许多文件上传

    // 自定义配置
    file_type: 'image',                 //  默认上传文件类型为image, 字符串，多个用逗号分隔
    key_func: function () { },             // 获取自定义文件名方法（优先读取key，如key不存在时再使用此方法）
    type_reg: typeReg,                       // 文件类型校验配置
    max_files: 10,                      // 最大上传文件数
}
/**
 * @desc 七牛上传工具方法
 * @param {Object} [options={}] 上传配置参数
 * @prop
 */
const Uploader = (options = {}) => {
    let max_file_size = parseFloat(options.max_file_size);
    let conf = {
        ...qiniuConf,
        ...options,
        // 此处禁用插件自带的自动上传
        uptoken_url: '',
        // 合并文件尺寸配置
        max_file_size: !isNaN(max_file_size) ? `${max_file_size}mb` : qiniuConf.max_file_size,
        // 对配置的方法先做类型校验
        key_func: isFunc(options.key_func) ? options.key_func : qiniuConf.key_func,
    };                                  // 局部配置对象，每个上传实例一份
    // let errorList = [];                         // 错误信息集合
    // 如未配置下载资源域名，直接跳出并返回null；
    if (!conf.domain.trim()) {
        // console.warn('缺少bucket域名！')
        return null;
    };
    // uploader为一个plupload对象，继承了所有plupload的方法
    // 每次生成一个上传实例
    return Qiniu.uploader({
        ...conf,
        init: {
            /**
             * @desc  初始化事件
             * @param  {Object} up  上传对象
             */
            'Init': function (up) {
                // 如果最大上传文件数小于等于0，则禁止使用上传
               
            },
            /**
             * @desc    打开文件夹事件
             */
            'Browse': function (up) {
                if (up.settings.max_files <= 0) {
                    up.disableBrowse(true);
                } else {
                    up.disableBrowse(false);
                }
                // console.log('打开文件夹');
                // 每次打开文件夹重置状态
                let errorList = [];
                up.splice(0);
                up.setOption({ uptoken_func: () => '' });
            },
            /**
             * @desc    当文件添加到上传队列前事件
             * @param  {Object} up   当前上传实例
             * @param  {Object} file 当前待上传的文件
             */
            'FileFiltered': function (up, file) {
                let errorList = [];
                try {
                    let file_type = conf.file_type.split(',');
                    // 文件类型校验
                    let canUpload = file_type.some((type, i) => {
                        const extReg = conf.type_reg[type.trim()];
                        const fileName = file.name;
                        const extension = fileName.substring(fileName.lastIndexOf('.'), fileName.length);
                        const size = file.size / 1024 / 1024; //此时单位是mb
                        // console.log(extReg, extension, extReg.test(extension));
                        if (!(extReg && extReg.test(extension))) {
                            errorList.push({ msg: `文件'${file.name}'格式错误` });
                            return false
                            // errorList.push({ type: '文件类型错误', msg: `文件'${file.fileName}'格式不匹配` });
                        }
                        if(size > max_file_size) {
                            errorList.push({ msg: `文件'${file.name}'超过最大文件大小限制` });
                            return false
                        }
                        return true
                        // return extReg && extReg.test(extension)
                    });
                    file.canUpload = canUpload;
                } catch (e) {
                    // console.warn(e);
                } finally {
                    isFunc(conf.fileFiltered) && conf.fileFiltered(up, file, errorList.pop());
                }
            },

            /**
             * @desc 每次在文件加入后获取上传token认证
             * @param   {Object}    up      当前上传实例
             * @param   {Array}     files   已添加的文件数组
             */
            'FilesAdded': function (up, files) {
                let errorList = [];
                let maxFiles = (up.getOption('max_files'));

                // 清空多余的文件
                let fileList = files.reduce((prev = [], f, i) => {
                    if (!f.canUpload) {
                        up.removeFile(f);
                    } else {
                        prev.push(f);
                        if (prev.length > maxFiles) {
                            up.removeFile(f);
                        }
                    }
                    return prev;
                }, []);
                // if (fileList.length > maxFiles) {
                //     errorList.push({ type: '文件数量错误', msg: `文件过多，一次最多上传${maxFiles}个文件` });
                //     console.warn(`文件过多，一次只能上传${maxFiles}个文件`);
                // }

                // 只要有文件可上传就上传该文件，如所有文件都不能上传，则退出上传流程
                if (fileList.length > 0) {
                    if (fileList.length > maxFiles) {
                        errorList.push({ msg: `文件过多，一次最多上传${maxFiles}个文件` });
                        isFunc(conf.filesAdded) && conf.filesAdded(up, files, errorList.pop());
                        return;
                    }
                    if (isString(conf.uptoken) && conf.uptoken.trim()) {
                        // 如提供token，则直接走下一步；
                        up.start();
                    } else if (isFunc(conf.fetch_upload_token)) {
                        // 如提供了请求方法，则调用该方法获取token
                        conf.fetch_upload_token(up, (function (up, files) {
                            return function (token) {
                                // 返回成功更新key和token，并调用upload自身方法（此处是处理七牛的业务逻辑，必要）
                                if (token) {
                                    up.setOption({ uptoken_func: () => token });
                                    up.start();
                                }
                            }
                        })(up, files));
                    }
                    isFunc(conf.filesAdded) && conf.filesAdded(up, files, errorList.pop());
                }
                
                // else if (fileList.length === 0) {
                //     errorList.push({ msg: `没有可上传的文件` });
                //     console.warn(`没有可上传的文件`);
                // }
                // 用户自定义的回调
                
            },
            /**
             * @desc 上传前对上传流程做最后校验
             * @param  {Object} up   当前上传实例
             * @param  {Object} file 当前待上传的文件
             */
            'BeforeUpload': function (up, file) {
                let errorList = [];
                // console.log('上传前');
                isFunc(conf.beforeUpload) && conf.beforeUpload(up, file, errorList.pop());
            },
            'UploadProgress': function (up, file) {
                // console.log('上传中...')
                isFunc(conf.uploadProgress) && conf.uploadProgress(up, file);
            },
            /**
             * @desc    上传成功
             * @param  {Object} up   上传对象
             * @param  {Object} file 上传文件
             * @param  {Object} info 返回数据
             */
            'FileUploaded': function (up, file, info) {
                console.log('上传完成');
                try {
                    const { response, status } = info;
                    (status === 200 && isFunc(conf.fileUploaded)) && conf.fileUploaded(up, file, JSON.parse(response));
                } catch (e) {
                    // console.warn(e);
                }

            },
            // 报错的回调
            'Error': function (up, err, errTip) {
                // console.log(`error:${errTip}`);
                let error = { ...err, msg: errTip };
                up.stop();
                isFunc(conf.uploadFail) && conf.uploadFail(error, up);
            },
            'UploadComplete': function (up) {
                up.stop();
                isFunc(conf.uploadComplete) && conf.uploadComplete(up);
            },
            // 文件名设置
            'Key': function (up, file) {
                // 如提供则直接使用
                let key_func = up.getOption().key_func;
                let key = isFunc(key_func) && key_func(file);
                // let key = isFunc(conf.key_func) && conf.key_func(file);
                // let fileName = file.name;
                if (!(isString(key) && key.trim())) {
                    key = file.name;
                }
                // else {
                //     const extension = fileName.substring(fileName.lastIndexOf('.'), fileName.length);
                //     key = `${key}${extension}`;
                // }
                // console.log(`key${key}`);
                // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
                // 该配置必须要在unique_names: false，save_key: false时才生效
                return key;
            },

            OptionChanged: function (up, name, value, oldValue) {
                // console.log(name, value, oldValue)
            },

            StateChanged: function (up) {
                // console.log('StateChanged')
            },

            Destroy: function (up) {
                // console.log('Destroy')
            }
        }
    });
};

export default Uploader;
