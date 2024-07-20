// PdfUploader.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, Button, TextField, Box } from '@mui/material';

const PdfUploader = () => {
    const [file, setFile] = useState(null);
    const api_url = process.env.REACT_APP_API_URL;

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const response = await axios.post(`${api_url}/addCreaditPdf`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Upload PDF
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            type="file"
                            inputProps={{ accept: 'application/pdf' }}
                            onChange={handleFileChange}
                        />
                    </Box>
                    <Button variant="contained" color="primary" type="submit">
                        Upload PDF
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default PdfUploader;
