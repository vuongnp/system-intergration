import { postRequest, getRequest } from "../services/api";
import router from '../router/index'

const defaultData = {
    name: '',
    description: '',
    members: [],
    owner: ''
}

export default {
    namespaced: true,
    state: {
        videoUser: null,
        spinning: false,
        visibleModal: false,
        mediaDevice: {
            camera: false,
            micro: false
        },
        isSharing: false,
        dataSharing: null,
        listUser: [],
        listClient: [],
        peer: [],
    },
    mutations: {
        setShareScreen(state, value)
        {
            state.isSharing = value;
        },
        setDataScreen(state, value){
            state.dataSharing = value;
        },
        setVideoUser(state, videoObject) {
            state.videoUser = videoObject;
        },
        setMediaDevice(state, value) {
            state.mediaDevice = value
        },
        setSpinning(state, value) {
            state.spinning = value
        },
        setLoading(state, value) {
            state.loading = value
        },
        setListUser(state, value) {
            state.listUser = value
        },
        stopVideoUser(state, value) {
            if (state.videoUser)
                state.videoUser.getTracks().forEach(function (track) {
                    track.stop();
                });
            state.videoUser = null;
        },
        removeClient(state, value) {
            state.listClient = state.listClient.filter(e => e.clientId !== value);
        },
        resetOneClient(state, data) {
            let client = state.listClient.find(e => e.socketId === data.clienId);
            if (client) {
                let newClientObject = {
                    ...client,
                    stream: null
                }
                client.stream.getTracks().forEach(function (track) {
                    track.stop();
                });
                state.listClient = state.listClient.filter(e => e.clientId !== data.clientId).concat([newClientObject]);
            }
        },
        resetAllClient(state) {
            state.mediaDevice = {
                camera: false,
                micro: false
            };
            state.listClient = [];
        },
        pushNewClient(state, value) {
            state.listClient.push(value);
        },
        setStreamClient(state, data) {
            // console.log(state.listClient.find(e=>e.clientId === data.clientId ))
            state.listClient = [{
                ...data
            }].concat(state.listClient.filter(e => e.clientId !== data.clientId));
        }


    },
    actions: {
        addClient({ commit, state }, data) {
            commit("pushNewClient", data);
        },
        signalAnswerToken({ commit, state }, data) {
            let peerMap = state.listClient.find(e => e.socketId === data.socketId);
            if (peerMap) {
                peerMap.peerObject.signal(data.token);
            }
        },
        startVideoCall({ commit, state }, data) {
            commit("setVideoUser", data)
            state.listClient.forEach(element => {
                element.peerObject.addStream(data);
            });
        },
    }
}
