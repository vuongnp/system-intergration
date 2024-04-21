import axios from 'axios';
import * as querystring from 'querystring';
import { message } from 'ant-design-vue';


import { HTTP_CODE_RESPONSE } from '../utils/constants';

// axios.defaults.withCredentials = true;
async function handleError(err) {
    switch (err.status) {
        case HTTP_CODE_RESPONSE.NOT_FOUND: {

            break;
        }
        case HTTP_CODE_RESPONSE.BAD_REQUEST: {
            err?.errors?.forEach(e => {
                message.error(e.content)
            })
            break;
        }
        case HTTP_CODE_RESPONSE.UNAUTHENTICATE: {
            localStorage.clear();
            window.location.href = '/'
            break;
        }
    }
}
export function generateHeader() {
    let token = localStorage.token;
    let headers = {
        'authorization': 'Bearer ' + token,
        "Content-Type": "application/json;charset=UTF-8"
    };
    return headers
}
export function getRequest(url, params) {
    return new Promise((resolve, reject) => {
        axios.get(process.env.VUE_APP_HOST_API + url, {
            params: params,
            paramsSerializer: (params) => {
                return querystring.stringify(params, { arrayFormat: "brackets" });
            },
            headers: generateHeader(),
        }).then((response) => {
            resolve(response.data);
        }).catch(err => {
            handleError(err.response)
            reject(err.response?.data);
        })
    })
}
export function postRequest(url, params,) {
    return new Promise((resolve, reject) => {
        axios.post(process.env.VUE_APP_HOST_API + url, params, { headers: generateHeader() }).then((response) => {
            resolve(response.data);
        }).catch(err => {
            handleError(err.response)
            reject(err.response?.data);
        })
    })
}

export function putRequest(url, params,) {
    return new Promise((resolve, reject) => {
        axios.put(process.env.VUE_APP_HOST_API + url, params, { headers: generateHeader() }).then((response) => {
            resolve(response.data);
        }).catch(err => {
            handleError(err.response?.data)
            reject(err.response?.data);
        })
    })
}
export function deleteRequest(url, params) {
    return new Promise((resolve, reject) => {
        axios.delete(process.env.VUE_APP_HOST_API + url, {
            params: params,
            paramsSerializer: (params) => {
                return querystring.stringify(params, { arrayFormat: "brackets" });
            },
            headers: generateHeader(),
        }).then((response) => {
            resolve(response.data);
        }).catch(err => {
            handleError(err.response)
            reject(err.response?.data);
        })
    })
}

export function patchRequest(url, body) {
    return new Promise((resolve, reject) => {
        axios.patch(process.env.VUE_APP_HOST_API + url,body, {
            headers: generateHeader(),
        }).then((response) => {
            resolve(response.data);
        }).catch(err => {
            handleError(err.response)
            reject(err.response?.data);
        })
    })
}