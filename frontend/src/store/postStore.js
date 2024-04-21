import { postRequest, getRequest, putRequest, deleteRequest, patchRequest } from "../services/api";
import router from '../router/index'
import { TIME_FORMAT } from "../utils/constants";
import moment from "moment";


export default {
    namespaced: true,
    state: {
        loading: false,
        spinning: false,
        selectedGroupId: null,
        listData: [],
        errorList: [],
        selectedItem: null,
    },
    mutations: {
        setSelectedGroupId(state, action) {
            state.selectedGroupId = action
        },
        setSpinning(state, value) {
            state.spinning = value
        },
        setLoading(state, value) {
            state.loading = value
        },
        setSelectedItem(state, value) {
            state.selectedItem = value
        },
        setListData(state, value) {
            state.listData = value;
        },
        addNewComment(state, value) {
            let postFind = state.listData.find(e => e._id === value.post_id);
            postFind.list_comment.push(value.cmt);
        },
        addNewPost(state, value) {
            let newData = [...state.listData, value]
            state.listData = newData
        }
    },
    actions: {
        async fetchOneItem({ commit, state }, id) {
            commit('setSpinning', true);
            let response = await getRequest('exercise/' + id).catch(err => {
                commit('setSpinning', false);
            })
            if (response) {
                commit('setSpinning', false);
                commit('setFormData', response);
                commit('setSelectedItem', response);
            }
        },
        async fetchAllData({ commit, state },) {
            let response = await getRequest('post', {
                group_id: state.selectedGroupId
            }).catch(err => {
                commit('setSpinning', false);
            })
            if (response) {
                commit('setSpinning', false);
                commit('setListData', response);
            }
        },
        async submitCreatePost({ commit, dispatch, state }, data) {
            let formData = new FormData();
            formData.append('file', data?.file);
            formData.append('content', data?.content);
            formData.append('group_id', data?.group_id);
            commit("setLoading", true);
            let result = await postRequest('post/', formData)
                .catch(err => {
                    this._vm.$message.error("Có lỗi xảy ra, vui lòng thử lại sau!");
                    commit('setLoading', false)
                })
            if (result) {
                commit('setLoading', false);
                commit('setVisibleModal', false);
                dispatch('fetchAllData');
            }
        },
        async submitEditExercise({ commit, dispatch, state }, group_id) {
            let timeString = state.formData.time_expired?.format(TIME_FORMAT.HOUR_ONLY) + ',' + state.formData.date_expired?.format(TIME_FORMAT.DATE_ONLY);
            let convertData = {
                id: state.formData._id,
                group_id: group_id,
                name: state.formData.name,
                description: state.formData.description,
                deadline: moment(timeString, TIME_FORMAT.SHORT_FULL_TIME).valueOf()
            }
            commit("setLoading", true);
            let result = await putRequest('exercise/' + state.selectedItem._id, convertData)
                .catch(err => {
                    this._vm.$message.error("Có lỗi xảy ra, vui lòng thử lại sau!");
                    commit('setLoading', false)
                })
            if (result) {
                commit('setLoading', false);
                commit('setVisibleModal', false);
                dispatch('fetchAllExercise');
                dispatch('fetchOneItem', state.selectedItem._id);
                this._vm.$message.success("Success");
            }
        },
        async submitEvaluateExercise({ commit, dispatch, state }) {
            let result = await patchRequest('exercise/evaluate/' + state.selectedItem._id, {
                _id: state.selectedSubmit._id,
                point: state.formDataEvaluate.point,
                evaluate: state.formDataEvaluate.evaluate,
            })
                .catch(err => {
                    this._vm.$message.error("Có lỗi xảy ra, vui lòng thử lại sau!");
                    commit('setLoading', false)
                })
            if (result) {
                commit('setLoading', false);
                commit('setVisibleModalEvaluate', false);
                dispatch('fetchOneItem', state.selectedItem._id);
                this._vm.$message.success("Success");
            }
        },
        async deleteExercise({ commit, dispatch, state }) {
            let result = await deleteRequest('exercise/' + state.selectedItem._id)
                .catch(err => {
                    this._vm.$message.error("Có lỗi xảy ra, vui lòng thử lại sau!");
                    commit('setLoading', false)
                })
            if (result) {
                commit('setLoading', false);
                commit('setVisibleModalEvaluate', false);
                dispatch('fetchAllExercise')
                commit('setSelectedItem', null);
                this._vm.$message.success("Success");
            }
        }
    }
}
