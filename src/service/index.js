import httpRequest from '@/http/http';

/**
 * 分享
 */
export const shareApi = {
    getOssToken: function(params){
        return httpRequest('post', '/v1/resource/getStsToken', params)
    },

    
}

