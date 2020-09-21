import OSS from 'ali-oss';
import Vue from 'vue';
import md5 from 'js-md5'

let client = null;
let files = []
function ossUpload ({uploadId, maxFiles, multiple= false,accept, maxSize='1000mb', fileName, secure = true, endpoint, cname = false, getOSSToken, uploaderError,uploaderProgress, uploaderSuccess, deptId}) {
    let upload = new OssUpload({
            uploadId: uploadId,  // 上传Id 必填
            maxFiles: maxFiles, // 上传最大数
            multiple: multiple, // 是否多传
            accept: accept,  // 上传格式 可填（image/png,image/jpg,image/jpeg,image/gif,.mp4,.avi,.mov,.pdf,.docx,.doc,.xls,.xlsx）等
            maxSize: maxSize, // 上传文件最大限制
            fileName: fileName,  // 文件自定义名
            secure: secure, // 初始化oss-secure
            endpoint: endpoint, // 初始化oss-endpoint
            cname: cname,// 初始化oss-cname
            getOSSToken: getOSSToken, // 初始化oss-获取的oss的key和token
            uploaderError: uploaderError, // 上传时错误提示
            uploaderProgress: uploaderProgress, // 上传时进度
            uploaderSuccess: uploaderSuccess, // 上传成功后返回
            deptId: deptId
        });
    upload.uploader()
}
class OssUpload {
    constructor({uploadId, maxFiles, multiple= false,accept, maxSize='1000mb', fileName, secure = true, cname = false, getOSSToken, uploaderError,uploaderProgress, uploaderSuccess, deptId}) {
        this.uploadId = uploadId;
        this.secure = secure;
        this.cname = cname;
        this.maxFiles = maxFiles;
        this.accept = accept;
        this.maxSize = maxSize.toLowerCase();
        this.fileName = fileName;
        this.multiple = multiple;
        this.getOSSToken = getOSSToken;
        this.uploaderError = uploaderError;
        this.uploaderProgress = uploaderProgress;
        this.uploaderSuccess = uploaderSuccess;

        this.deptId = deptId;
    }
    uploaderFilter() {
        if(!this.uploadId.trim()) {
            this.uploaderError({
                type: 'error',
                msg: `上传按钮ID必填`
            })
            return
        }
        let canUpload = true
        let upload = document.getElementById(this.uploadId);
        let file = document.createElement('input');
        file.setAttribute('type', "file");
        file.setAttribute('multiple', this.multiple);
        file.setAttribute('accept', this.accept);
        file.style="position:absolute; left: -9999px;";
        upload.appendChild(file)
        upload.addEventListener('click', async () => {
            const data = await this.getOSSToken();
            client = new OSS({
                ...data,
                secure: this.secure,
                cname: this.cname
            })
            Vue.nextTick(() => {
                file.dispatchEvent(new MouseEvent('click'));
            })
            
        })
        file.addEventListener('change', async (e) => {
            files = Array.from(e.target.files);
            let accepts = this.accept.split(',');
            let maxSize = 0;
            if(files.length > this.maxFiles) {
                canUpload = false
                file.value = ''
                this.uploaderError({
                    type: 'error',
                    msg: `文件上传数量过多，最多上传${this.maxFiles}个文件`
                })
                return
            }
            files.forEach(async f => {
                let size = f.size / 1024;
                let type = f.name.substr(f.name.lastIndexOf('.') + 1);
                let index = accepts.findIndex(v => v.includes(type.toLowerCase()));
                if(index === -1) {
                    canUpload = false
                    file.value = ''
                    this.uploaderError({
                        type: 'error',
                        msg: `文件${f.name}格式错误`
                    })
                    return 
                }
                if (this.maxSize.includes('mb')) {
                    maxSize = parseFloat(this.maxSize) * 1024
                } else if(this.maxSize.includes('kb')){
                    maxSize = parseFloat(this.maxSize)
                }
                if((type === 'pdf' || type === 'doc' || type === 'docx' || type === 'xls'  || type === 'xlsx') && size > 40 * 1024) {
                    canUpload = false
                    file.value = ''
                    this.uploaderError({
                        type: 'error',
                        msg: `以.doc,.docx,.pdf,.xls,xlsx后缀的文件不能大于40M,请压缩后再上传！`
                    })
                    return 
                }
                if(size > maxSize) {
                    canUpload = false
                    file.value = ''
                    this.uploaderError({
                        type: 'error',
                        msg: `文件${f.name}大于${this.maxSize},请压缩后再上传！`
                    })
                    return 
                }
            })
            if(canUpload) {
                try{
                    this.uploaderProgress('start')
                    if(this.multiple) {
                        let results = [];
                        try{
                            for(let i = 0; i < files.length; i++) {
                                let f = files[i];
                                let fileSuffixArray = f.name.split('.')
                                let currentFileName = this.fileName ? `${this.fileName}_${f.name}` : 
                                `all2img/input/organ/${this.deptId}/${new Date().getTime()}/${md5(fileSuffixArray[0]) + '.' + fileSuffixArray[fileSuffixArray.length - 1]}`
                                // `${f.name}`
                                let result = null
                                if(f.size > 100 * 1024 * 1024) {
                                    result = await client.multipartUpload(currentFileName , f,  { 
                                        progress:  (p, checkpoint) => {
                                        //   断点记录点。浏览器重启后无法直接继续上传，您需要手动触发上传操作。
                                          this.uploaderProgress(p)
                                        },
                                    });
                                    result.fileType = f.type;
                                    result.fileSuffix = fileSuffixArray[fileSuffixArray.length - 1];
                                    result.url = result.res.requestUrls[0].split('.com/')[1];
                                    result.name = fileSuffixArray[0];
                                } else {
                                    result = await client.put(currentFileName , f);
                                    result.fileType = f.type;
                                    result.fileSuffix = fileSuffixArray[fileSuffixArray.length - 1];
                                    result.url = result.url.split('.com/')[1];
                                    result.name = fileSuffixArray[0];
                                }
                                results.push(result);
                            }
                            file.value = ''
                            this.uploaderProgress('end')
                            this.uploaderSuccess(results)
                        } catch(e) {
                            console.log(e)
                        }
                        
                    } else {
                        let fileSuffixArray = files[0].name.split('.')
                        let currentFileName = this.fileName ? `${this.fileName}_${files[0].name}` : `all2img/input/organ/${this.deptId}/${new Date().getTime()}/${md5(fileSuffixArray[0]) + '.' + fileSuffixArray[fileSuffixArray.length - 1]}`;
                        // let currentFileName = this.fileName ? `${this.fileName}_${files[0].name}` : `${files[0].name}`;
                        const result = await client.put(currentFileName , files[0]);
                        file.value = ''
                        result.fileType = files[0].type;
                        result.fileSuffix = fileSuffixArray[fileSuffixArray.length - 1];
                        result.url = result.url.split('.com/')[1];
                        result.name = fileSuffixArray[0];
                        this.uploaderSuccess(result)
                    }
                } catch (e) {
                    this.uploaderError(e)
                }
            }else {
                canUpload = true
            }
            
        })
    }
    uploader() {
        this.uploaderFilter()
    }      

}
export default ossUpload