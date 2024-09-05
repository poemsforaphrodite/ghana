import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Textarea, VStack, Heading, Text } from '@chakra-ui/react';
import axios from 'axios';

function GenerateDocument() {
  const [documentType, setDocumentType] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [generatedDocument, setGeneratedDocument] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://ghana-api.vercel.app';
      const response = await axios.post(`${apiUrl}/generate-document`, 
        { documentType, additionalInfo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGeneratedDocument(response.data.document);
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Error generating document');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="md" mb={4}>Generate HR Document</Heading>
        <FormControl>
          <FormLabel>Document Type</FormLabel>
          <Input 
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            placeholder="e.g., Leave Policy, Sexual Harassment Policy"
          />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Additional Information</FormLabel>
          <Textarea 
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Provide any specific details or requirements for the document"
          />
        </FormControl>
        <Button mt={4} onClick={handleGenerate} colorScheme="teal" isLoading={isGenerating}>
          Generate Document
        </Button>
      </Box>

      {generatedDocument && (
        <Box>
          <Heading size="md" mb={4}>Generated Document</Heading>
          <Text whiteSpace="pre-wrap">{generatedDocument}</Text>
        </Box>
      )}
    </VStack>
  );
}

export default GenerateDocument;