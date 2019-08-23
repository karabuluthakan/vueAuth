import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import {router} from "./router";

Vue.use(Vuex);

const store = new Vuex.Store({
    state : {
        token : "",
        apiKey: "AIzaSyBx-JRso76l2tq7xHliolE38h8RKG2fZJw",
    },
    mutations : {
        setToken(state,token){
            state.token = token;
        },
        clearToken(state){
            state.token = "";
        }
    },
    actions : {
        initAuth({ commit , dispatch }){
            let token = localStorage.getItem("token");

            if(token){
                let expirationDate = localStorage.getItem("expirationDate");
                let time = new Date().getTime();

                if (time >= + expirationDate){
                    dispatch("logout");
                }else {
                    commit("setToken",token);
                    let timerSecond = expirationDate - time;
                    dispatch("expiresInTimer",timerSecond);
                    router.push("/");
                }
            }else {
                router.push("/auth");
                return false;
            }
        },
        login({ commit , dispatch , state}, authData){

            let authLink = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=";
            if (authData.isUser){
                authLink = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key="
            }

          return   axios.post(
                authLink + "AIzaSyBx-JRso76l2tq7xHliolE38h8RKG2fZJw",
                { email : authData.email , password : authData.password , returnSecureToken : true }
            ).then(response =>{
                commit("setToken",response.data.idToken);
                localStorage.setItem("token",response.data.idToken);
                localStorage.setItem("expirationDate",new Date().getTime()+response.data.expiresIn);

              dispatch("expiresInTimer",+ response.data.expiresIn );
            });
        },
        logout({ commit }){
            commit("clearToken");
            localStorage.removeItem("token");
            localStorage.removeItem("expirationDate");
            router.replace("/");
        },
        expiresInTimer({dispatch},expiresIn){
            setTimeout(()=>{
                dispatch("logout");
            },expiresIn);
        }
    },
    getters : {
        isAuthenticated(state){
            return state.token!=="";
        }
    }
});

export default store;