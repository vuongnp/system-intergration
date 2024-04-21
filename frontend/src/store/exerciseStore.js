import { postRequest, getRequest, putRequest, deleteRequest, patchRequest } from "../services/api";
import router from '../router/index'
import { TIME_FORMAT } from "../utils/constants";
import moment from "moment";
const defaultData = {
    _id: null,
    name: '',
    description: '',
    owner: null,
    time_expired: null,
    date_expired: null
}

export default {
    namespaced: true,
    state: {
        loading: false,
        spinning: false,
        visibleModal: false,
        visibleModalSubmit: false,
        visibleModalEvaluate: false,
        selectedGroupId: null,
        formDataEvaluate: {

        },
        listExercise: [],
        errorList: [],
        selectedItem: null,
        selectedSubmit: {

        },
        formData: {
            _id: null,
            name: '',
            description: '',
            owner: '',
            time_expired: null,
            date_expired: null,
        }
    },
    mutations: {
        setVisibleModal(state, value) {
            state.visibleModal = value;
        },
        setVisibleModalEvaluate(state, value) {
            state.visibleModalEvaluate = value;
        },
        setSelectedSubmit(state, value) {
            state.selectedSubmit = value;
        },
        setSelectedGroupId(state, action) {
            state.selectedGroupId = action
        },
        setSpinning(state, value) {
            state.spinning = value
        },
        setLoading(state, value) {
            state.loading = value
        },
        setVisibleModalSubmit(state, value) {
            state.visibleModalSubmit = value;
        },
        setFormData(state, value) {
            state.formData = {
                ...state.formData,
                ...value
            }
        },
        setSelectedItem(state, value) {
            state.selectedItem = value
        },
        setListExercise(state, value) {
            state.listExercise = value;
        },
        setFormEvaluateData(state, data) {
            state.formDataEvaluate = {
                ...state.formDataEvaluate,
                ...data
            }
        },
        resetFormData(state, )
        {
                state.formData = defaultData;
        },
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
        async fetchAllExercise({ commit, state },) {
            let response = await getRequest('exercise', {
                group_id: state.selectedGroupId
            }).catch(err => {
                commit('setSpinning', false);
            })
            if (response) {
                commit('setSpinning', false);
                commit('setListExercise', response);
            }
        },
        async submitUpload({ commit, dispatch, state }, formData) {
            let result = await patchRequest('exercise/submit/' + state.selectedItem?._id, formData)
                .catch(err => {
                    this._vm.$message.error("Có lỗi xảy ra, vui lòng thử lại sau!");
                    commit('setLoading', false)
                })
            if (result) {
                commit('setLoading', false);
                commit('setVisibleModalSubmit', false);
                dispatch('fetchOneItem', state.selectedItem._id);
                this._vm.$message.success("Success");
            }
        },
        async submitCreateExercise({ commit, dispatch, state }, group_id) {
            let timeString = state.formData.time_expired?.format(TIME_FORMAT.HOUR_ONLY) + ',' + state.formData.date_expired?.format(TIME_FORMAT.DATE_ONLY);
            let convertData = {
                id: state.formData._id,
                group_id: group_id,
                name: state.formData.name,
                description: state.formData.description,
                deadline: moment(timeString, TIME_FORMAT.SHORT_FULL_TIME).valueOf()
            }
            commit("setLoading", true);
            let result = await postRequest('exercise/', convertData)
                .catch(err => {
                    this._vm.$message.error("Có lỗi xảy ra, vui lòng thử lại sau!");
                    commit('setLoading', false)
                })
            if (result) {
                commit('setLoading', false);
                commit('setVisibleModal', false);
                dispatch('fetchAllExercise');
                this._vm.$message.success("Success");
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
            let result = await putRequest('exercise/'+ state.selectedItem._id, convertData)
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
        async deleteExercise ({ commit, dispatch, state })
        {
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
