import { postRequest, getRequest, putRequest, deleteRequest, patchRequest } from "../services/api";
import router from '../router/index'
const defaultData = {
    _id: null,
    name: '',
    description: '',
    members: [],
    owner: null
}

export default {
    namespaced: true,
    state: {
        loading: false,
        spinning: false,
        visibleModal: false,
        listSearchResultUser: [],
        listGroup: [],
        errorList: [],
        selectedItem: {
            _id: null,
            name: '',
            description: '',
            members: [],
            owner: ''
        },
        formData: {
            _id: null,
            name: '',
            description: '',
            members: [],
            owner: ''
        }
    },
    mutations: {
        setVisibleModal(state, value) {
            state.visibleModal = value;
        },
        setSpinning(state, value) {
            state.spinning = value
        },
        setLoading(state, value) {
            state.loading = value
        },
        setFormData(state, value) {
            state.formData = {
                ...state.formData,
                ...value
            }
        },
        setItemData(state, value) {
            state.selectedItem = {
                ...state.selectedItem,
                ...value
            };
        },
        setListGroup(state, value) {
            state.listGroup = value;
        },
        setlistSearchResultUser(state, value) {
            state.listSearchResultUser = value
        },
        addUser(state, { member, index }) {
            state.formData.members.push(member);
            state.listSearchResultUser[index].checked = true;
        },
        setFormField(state, data) {
            state.formData = {
                ...state.formData,
                ...data
            }
        },
        removeUser(state, { member, }) {
            state.formData.members = state.formData.members.filter(e => e.username !== member.username);
            let searchUserResult = state.listSearchResultUser.find(e => e.username === member.username);
            if (searchUserResult)
                searchUserResult.checked = false;
        }
    },
    actions: {
        resetForm({ commit }) {
            commit('setFormData', defaultData);
            commit('setItemData', defaultData);
            commit('setlistSearchResultUser', []);

        },
        async fetchOneGroupForEdit({ commit, state }, id) {
            let response = await getRequest('group/' + id).catch(err => {
                commit('setSpinning', false);
            })
            if (response) {
                commit('setSpinning', false);
                commit('setFormData', response);
                commit('setItemData', response);
            }
        },
        async fetchAllGroup({ commit, state }) {
            let response = await getRequest('group').catch(err => {
                commit('setSpinning', false);
            })
            if (response) {
                commit('setSpinning', false);
                commit('setListGroup', response);
            }
        },
        async joinGroup({ commit, state, dispatch }, { group_code }) {
            let response = await putRequest('group/join', {
                group_code: group_code,
                username: localStorage.username
            }).catch(err => {
                commit('setSpinning', false);
            })
            if (response) {
                this._vm.$message.success("Đã tham gia nhóm");
                dispatch('fetchAllGroup');
            }
        },
        async findUser({ commit, state }, data) {
            if (data?.username?.trim()?.length) {
                let response = await getRequest('user/find-user', data).catch(err => {
                    commit('setLoading', false)
                })
                if (response) {
                    commit('setLoading', false);
                    let userData = response.map(e => {
                        return {
                            ...e,
                            checked: state.formData.members.findIndex(el => el.username === e.username) !== -1
                        }
                    });
                    if (state.formData._id)
                        userData = userData.filter(e => e.username !== state.formData.owner.username)
                    commit('setlistSearchResultUser', userData);
                }
            }
            else {
                commit('setlistSearchResultUser',);
            }
        },
        async submit({ commit, dispatch, state }) {
            let result = await postRequest('group', state.formData)
                .catch(err => {
                    this._vm.$message.error("Có lỗi xảy ra, vui lòng thử lại sau!");
                    commit('setLoading', false)
                })
            if (result) {
                commit('setLoading', false);
                commit('setVisibleModal', false);
                commit('setFormData', defaultData);
                commit('setItemData', defaultData);
                commit('setlistSearchResultUser', []);
                dispatch('fetchAllGroup');
                this._vm.$message.success("Success");
            }
        },
        async deleteGroup({ commit, dispatch, state }, data) {
            let result = await deleteRequest('group/' + data)
                .catch(err => {
                    this._vm.$message.error("Có lỗi xảy ra, vui lòng thử lại sau!");
                    commit('setLoading', false)
                })
            if (result) {
                commit('setLoading', false);
                commit('setVisibleModal', false);
                commit('setFormData', defaultData);
                commit('setItemData', defaultData);
                commit('setlistSearchResultUser', []);
                dispatch('fetchAllGroup');
                this._vm.$message.success("Success");
            }
        },
        async leaveGGroup({ commit, dispatch, state }, data) {
            let result = await patchRequest('group/' + data + "/leave" )
                .catch(err => {
                    this._vm.$message.error("Có lỗi xảy ra, vui lòng thử lại sau!");
                    commit('setLoading', false)
                })
            if (result) {
                commit('setLoading', false);
                commit('setVisibleModal', false);
                commit('setFormData', defaultData);
                commit('setItemData', defaultData);
                commit('setlistSearchResultUser', []);
                dispatch('fetchAllGroup');
                this._vm.$message.success("Success");
            }
        },
        async addMemberGroup({ commit, dispatch, state }) {
            let result = await putRequest('group/' + state.formData._id + '/addMember', state.formData.members)
                .catch(err => {
                    commit('setLoading', false)
                })
            if (result) {
                commit('setLoading', false);
                commit('setVisibleModal', false);
                commit('setFormData', defaultData);
                commit('setItemData', defaultData);
                commit('setlistSearchResultUser', []);
                dispatch('fetchAllGroup');
                this._vm.$message.success("Success");
            }
        },
        async submitEditGroup({ commit, dispatch, state }) {
            let result = await putRequest('group/' + state.formData._id, state.formData)
                .catch(err => {
                    this._vm.$message.error("Có lỗi xảy ra, vui lòng thử lại sau!");
                    commit('setLoading', false)
                })
            if (result) {
                commit('setLoading', false);
                commit('setVisibleModal', false);
                commit('setFormData', defaultData);
                commit('setItemData', defaultData);
                commit('setlistSearchResultUser', []);
                dispatch('fetchAllGroup');
                this._vm.$message.success("Success");
            }
        }
    }
}
