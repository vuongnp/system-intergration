import { postRequest, getRequest, putRequest } from "../services/api";
import router from '../router/index'

export default {
    namespaced: true,
    state: {
        loading: false,
        spinning: false,
        haveNewNotice: false,
        data: {
            listData: [],
            pagination: {
                total: 0,
                current: 0,
                pageSize: 15
            }
        }
    },
    mutations: {
        setSpinning(state, value) {
            state.spinning = value
        },
        setSpinning(state, value) {
            state.spinning = value
        },
        setHaveNewNotice(state, value) {
            state.haveNewNotice = value
        },
        setData(state, value) {
            state.data = value
        }
    },
    actions: {
        async getNotification({ commit, state }, page) {
            commit('setSpinning', true);
            let response = await getRequest('notification', {
                page: page
            }).catch(err => {
                commit('setSpinning', false);
            })
            if (response) {
                commit('setData', response);
                commit('setSpinning', false);
            }
        },
    }
}
