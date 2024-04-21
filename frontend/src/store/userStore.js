import { postRequest } from "../services/api";
import router from '../router/index'

export default {
    namespaced: true,
    state: {
        loading: false,
        errorList: []
    },
    mutations: {
        setErrorList(state, value) {
            state.errorList = value;
        },
        setLoading(state, value) {
            state.loading = value
        }
    },
    actions: {
        async changeAvatar({ commit, }, file) {
            commit('setLoading', true);
            let formData = new FormData();
            formData.append('file', file)
            let response = await postRequest('user/change-avatar', formData).catch(err => {
                commit('setLoading', false)
            })
            if (response) {
                commit('setLoading', false);
            }
        },
    }
}
