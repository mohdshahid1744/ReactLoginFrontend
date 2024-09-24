import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import authReducer from './AuthSlice';


export type RootState = {
    auth: ReturnType<typeof authReducer>;
    userdata: ReturnType<typeof userReducer>;
};


const store = configureStore({
    reducer: {
        auth: authReducer,
        userdata: userReducer,
    },
});

export default store;