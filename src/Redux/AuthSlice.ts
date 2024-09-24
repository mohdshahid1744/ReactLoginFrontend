import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface User {
    _id: string; 
    name: string;
    email: string;
    token: string;
}


interface AuthState {
    isLogin: boolean;
    user: User | null;
    token: string | null;
}


const initialState: AuthState = {
    isLogin: false,
    user: null,
    token: null,
};


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        userLogin: (state, action: PayloadAction<User>) => {
            state.isLogin = true;
            state.user = action.payload;
            state.token = action.payload.token; 
        },
        userLogout: (state) => {
            state.isLogin = false;
            state.user = null;
            state.token = null; 
        },
        clearUserData: (state) => {
            state.isLogin = false;
            state.user = null;
            state.token = null;
        },
    },
});

export const { userLogin, userLogout, clearUserData } = authSlice.actions;
export default authSlice.reducer;
