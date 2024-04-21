import BaseApi from './baseApi'


export class AuthService extends BaseApi {
    constructor() {
        super();
    }
    signin = (data) => {
        console.log(data);
        // return this.postRequest('signin', data);
    }
}