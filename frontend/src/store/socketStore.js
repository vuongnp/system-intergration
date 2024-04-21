import { postRequest, getRequest } from "../services/api";
import router from '../router/index'


export default {
    namespaced: true,
    state: {
        visibleModal: true,
        listSearchResultUser: [],
        errorList: [],
        formData: {
            name: 'vip',
            description: 'abc',
            members: [],
            owner: ''
        }
    },

}