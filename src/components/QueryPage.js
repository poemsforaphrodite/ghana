import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, VStack, Heading, Text, Textarea, FormControl, FormLabel, Progress } from '@chakra-ui/react';

function QueryPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryProgress, setQueryProgress] = useState(0);

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      alert('Please enter a query');
      return;
    }

    setIsQuerying(true);
    setQueryProgress(0);
    setResult('');

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://ghana-api.vercel.app';
      
      // Simulate progress for query processing
      const progressInterval = setInterval(() => {
        setQueryProgress((prevProgress) => Math.min(prevProgress + 10, 90));
      }, 500);

      const response = await axios.post(`${apiUrl}/query`, { query }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      clearInterval(progressInterval);
      setQueryProgress(100);
      setResult(response.data.result);
    } catch (err) {
      console.error(err);
      alert('Error processing query');
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="md" mb={4}>Query Ghana Labor Laws</Heading>
        <FormControl>
          <FormLabel>Enter your query</FormLabel>
          <Textarea 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about Ghana's labor laws..."
          />
        </FormControl>
        <Button mt={4} onClick={handleQuerySubmit} colorScheme="green" isDisabled={isQuerying}>
          Submit Query
        </Button>
        {isQuerying && (
          <Box mt={4}>
            <Text mb={2}>Processing query: {queryProgress}%</Text>
            <Progress value={queryProgress} size="sm" colorScheme="green" />
          </Box>
        )}
      </Box>

      {result && (
        <Box>
          <Heading size="md" mb={4}>Query Result</Heading>
          <Text>{result}</Text>
        </Box>
      )}
    </VStack>
  );
}

export default QueryPage;