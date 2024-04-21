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
        async signin({ commit, }, data) {
            commit('setLoading', true)
            let response = await postRequest('auth/signin', data).catch(err => {
                commit('setErrorList', err.errors);
                commit('setLoading', false)
            })
            if (response) {
                localStorage.setItem("token", response.data.accessToken);
                localStorage.setItem("username", response.data.username);
                commit('setLoading', false);
                commit('setErrorList', []);
                router.replace('/')
            }
        },
        async signup({ commit, }, data) {
            commit('setLoading', true)
            let response = await postRequest('auth/signup', data).catch(err => {
                commit('setErrorList', err.errors);
                commit('setLoading', false);
            })
            if (response) {
                commit('setLoading', false);
                commit('setErrorList', []);
                this._vm.$message.success("Success! Sign in now");
                router.replace('/signin')
            }

        }
    }
}
