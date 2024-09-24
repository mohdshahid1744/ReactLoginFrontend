import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userLogout, clearUserData } from "../Redux/AuthSlice";
import { useNavigate } from "react-router-dom";
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, Container, Grid, Typography, IconButton, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import { Upload } from '@mui/icons-material';
import axiosInstance from '../Utils/Axios';
import { RootState } from '../Redux/Store'; 

interface DraggableImageProps {
  image: string;
  index: number;
  moveImage: (fromIndex: number, toIndex: number) => void;
}

const DraggableImage: React.FC<DraggableImageProps> = ({ image, index, moveImage }) => {
  const [, ref] = useDrag({
    type: 'image',
    item: { index },
  });

  const [, drop] = useDrop({
    accept: 'image',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveImage(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))} style={{ margin: '10px', cursor: 'move' }}>
      <img src={image} alt={`img-${index}`} style={{ width: '150px', height: '150px', borderRadius: '8px', border: '2px solid #ddd' }} />
    </div>
  );
};

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const userId = useSelector((state: RootState) => state.auth.user?._id);
  console.log("userID", userId);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axiosInstance.get('/getImage');
        setImages(response.data.images.map((img: { image: string }) => img.image));
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('image', files[i]);
      }

      setUploading(true);
      try {
        const response = await axiosInstance.post('/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setImages(response.data.images.map((img: { image: string }) => img.image));
      } catch (error) {
        console.error('Error uploading images:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const moveImage = async (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);

    setImages(updatedImages);

    try {
      await axiosInstance.post('/updateImageOrder', {
        images: updatedImages,
      });
    } catch (error) {
      console.error('Error updating image order:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    dispatch(userLogout());
    dispatch(clearUserData());
    navigate('/');
  };

  const handleResetPassword = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handlePasswordChange = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match');
      return;
    }

    try {
      await axiosInstance.post(`/resetPassword/${userId}`, { currentPassword, newPassword, confirmPassword });
      setSuccessMessage('Password reset successfully');
      setOpenModal(false);
    } catch (error:any) {
      setErrorMessage(error.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Container>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Button variant="outlined" onClick={handleResetPassword}>
            Reset Password
          </Button>
        </Box>

        <Typography variant="h4" gutterBottom>
          Image Gallery
        </Typography>
        <Button variant="contained" color="primary" onClick={handleLogout} style={{ marginBottom: '20px' }}>
          Logout
        </Button>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          multiple
          style={{ display: 'none' }}
          id="upload-button"
        />
        <label htmlFor="upload-button">
          <IconButton color="primary" component="span" style={{ marginBottom: '20px' }} disabled={uploading}>
            <Upload />
          </IconButton>
        </label>
        {errorMessage && <Alert severity="error" sx={{ marginBottom: 2 }}>{errorMessage}</Alert>}
        {successMessage && <Alert severity="success" sx={{ marginBottom: 2 }}>{successMessage}</Alert>}

        <Grid container spacing={2} justifyContent="center">
          {images.map((image, index) => (
            <Grid item key={index}>
              <DraggableImage index={index} image={image} moveImage={moveImage} />
            </Grid>
          ))}
        </Grid>

        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent>
            <TextField
              label="Old Password"
              type="password"
              fullWidth
              variant="outlined"
              margin="dense"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              variant="outlined"
              margin="dense"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value.trim())}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              variant="outlined"
              margin="dense"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value.trim())}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} color="primary">
              Reset Password
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DndProvider>
  );
};

export default Home;
