import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    isAuthenticated: boolean;
    token: string | null;
    isAdmin: boolean;
}


const initialState: UserState = {
    isAuthenticated: false,
    token: null,
    isAdmin: false,
};


const userSlice = createSlice({
    name: "userData",
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<{ token: string }>) => {
            state.isAuthenticated = true;
            state.token = action.payload.token; 
        },
    },
});

export const { loginSuccess } = userSlice.actions;
export default userSlice.reducer;
