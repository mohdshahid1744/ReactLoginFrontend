import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Avatar,
  Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { userLogin } from "../Redux/AuthSlice";
import { motion } from 'framer-motion';
import { useFormik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../Utils/Axios';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

interface FormValues {
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;           
}

const LoginRegister: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>(''); 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    
    confirmPassword: Yup.string().when('isLogin', (isLogin, schema) => {
      return !isLogin ? schema
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required') : schema.notRequired();
    }),
    
    phone: Yup.string().when('isLogin', (isLogin, schema) => {
      return !isLogin ? schema
        .matches(/^[0-9]{10}$/, 'Invalid phone number')
        .required('Phone number is required') : schema.notRequired();
    })
  });
  
  
  
  
  
  

  const formik = useFormik<FormValues>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
    validationSchema,
    onSubmit: async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
      try {
        if (isLogin) {
          const response = await axiosInstance.post('/login', values);
          console.log('Login success:', response.data);
          localStorage.setItem("jwt", JSON.stringify(response.data));
          dispatch(userLogin(response.data));
          navigate("/home");
          setErrorMessage(''); 
        } else {
          const response = await axiosInstance.post('/signup', values);
          console.log('Registration success:', response.data);
          setErrorMessage('');
        }
      } catch (error: any) { 
        console.error('Error during authentication:', error);
        if (error.response && error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message); 
        } else {
          setErrorMessage('An unexpected error occurred.'); 
        }
      } finally {
        setSubmitting(false);
      }
    },
  });
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Box display="flex" flexDirection="row" width="100%" height="500px" position="relative">
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            sx={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1621360841013-c7683c659ec6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'blur(8px)',
            }}
          />
          <Box display="flex" flexDirection="row" width="100%" height="100%" position="relative">
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              width="50%"
              borderRight={1}
              borderColor="divider"
              p={2}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              {isLogin === null || isLogin === false ? (
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Typography variant="h6" sx={{ fontFamily: 'Georgia, serif', fontWeight: '300', fontSize: '1.5rem' }}>
                    <span className="typing-text">Welcome! Sign in to see what's new and continue your journey.</span>
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsLogin(true)}
                    sx={{
                      mb: 2,
                      backgroundColor: '#007BFF',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        backgroundColor: '#0056b3',
                        boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                      },
                      fontWeight: 'bold',
                      fontSize: '1rem',
                    }}
                  >
                    Login
                  </Button>
                </Box>
              ) : (
                <>
                  <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <LockOutlinedIcon />
                  </Avatar>
                  <Typography component="h1" variant="h5">
                    Login
                  </Typography>
                  <motion.div
                    key="login"
                    initial={{ x: 300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    transition={{ duration: 0.5 }}
                  >
                    <form onSubmit={formik.handleSubmit} noValidate>
                      {errorMessage && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {errorMessage}
                        </Alert>
                      )}
                      <TextField
                        margin="normal"
                        fullWidth
                        label="Email Address"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                      />
                      <TextField
                        margin="normal"
                        fullWidth
                        label="Password"
                        type="password"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2 }}
                      >
                        Sign In
                      </Button>
                    </form>
                  </motion.div>
                </>
              )}
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              width="50%"
              p={2}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              {isLogin === null || isLogin === true ? (
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Typography variant="h6" sx={{ fontFamily: 'Georgia, serif', fontWeight: '300', fontSize: '1.5rem' }}>
                    <span className="typing-text">Join us! Register to unlock new features and start your journey with us.</span>
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsLogin(false)}
                    sx={{
                      mb: 2,
                      backgroundColor: '#007BFF',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        backgroundColor: '#0056b3',
                        boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                      },
                      fontWeight: 'bold',
                      fontSize: '1rem',
                    }}
                  >
                    Register
                  </Button>
                </Box>
              ) : null}

              {isLogin === false && (
                <>
                  <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <LockOutlinedIcon />
                  </Avatar>
                  <Typography component="h1" variant="h5">
                    Register
                  </Typography>
                  <motion.div
                    key="register"
                    initial={{ x: 300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    transition={{ duration: 0.5 }}
                  >
                    <form onSubmit={formik.handleSubmit} noValidate>
                      {errorMessage && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {errorMessage}
                        </Alert>
                      )}
                      <TextField
                        margin="normal"
                        fullWidth
                        label="Email Address"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                      />
                      <TextField
                        margin="normal"
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                      />
                      <TextField
                        margin="normal"
                        fullWidth
                        label="Password"
                        type="password"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                      />
                      <TextField
                        margin="normal"
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2 }}
                      >
                        Sign Up
                      </Button>
                    </form>
                  </motion.div>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginRegister;
