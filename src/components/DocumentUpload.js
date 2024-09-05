import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, VStack, Heading, Input, FormControl, FormLabel, Progress, Text } from '@chakra-ui/react';

function DocumentUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://ghana-api.vercel.app';
      await axios.post(`${apiUrl}/upload-document`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      alert('Document uploaded successfully');
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert('Error uploading document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="md" mb={4}>Document Upload</Heading>
        <FormControl>
          <FormLabel>Select Document</FormLabel>
          <Input type="file" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.txt" />
        </FormControl>
        <Button mt={4} onClick={handleUpload} colorScheme="blue" isDisabled={!selectedFile || isUploading}>
          Upload Document
        </Button>
        {isUploading && (
          <Box mt={4}>
            <Text mb={2}>Uploading: {uploadProgress}%</Text>
            <Progress value={uploadProgress} size="sm" colorScheme="blue" />
          </Box>
        )}
      </Box>
    </VStack>
  );
}

export default DocumentUpload;