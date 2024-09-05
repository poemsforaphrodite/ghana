import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text } from '@chakra-ui/react';
import axios from 'axios';

function PerformanceReview() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert('Please select a CSV file first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', file);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://ghana-api.vercel.app';
      const response = await axios.post(`${apiUrl}/process-performance-review`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Error analyzing performance review:', error);
      alert('Error analyzing performance review');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="md" mb={4}>Performance Review Analysis</Heading>
        <FormControl>
          <FormLabel>Upload CSV File</FormLabel>
          <Input type="file" accept=".csv" onChange={handleFileChange} />
        </FormControl>
        <Button mt={4} onClick={handleAnalyze} colorScheme="orange" isLoading={isAnalyzing}>
          Analyze Performance Reviews
        </Button>
      </Box>

      {analysis && (
        <Box>
          <Heading size="md" mb={4}>Analysis Results</Heading>
          <Text whiteSpace="pre-wrap">{analysis}</Text>
        </Box>
      )}
    </VStack>
  );
}

export default PerformanceReview;