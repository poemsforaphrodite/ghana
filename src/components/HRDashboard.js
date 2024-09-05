import React, { useState } from 'react';
import { Box, Button, VStack, Heading, Text } from '@chakra-ui/react';
import DocumentUpload from './DocumentUpload';
import QueryPage from './QueryPage';

function HRDashboard() {
  const [currentPage, setCurrentPage] = useState('main');

  const requestAdminPromotion = async () => {
    // ... (keep the existing implementation)
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'upload':
        return <DocumentUpload />;
      case 'query':
        return <QueryPage />;
      default:
        return (
          <VStack spacing={8} align="stretch">
            <Box>
              <Heading size="md" mb={4}>Actions</Heading>
              <Button onClick={requestAdminPromotion} colorScheme="blue" mr={4}>
                Request Admin Promotion
              </Button>
              <Button onClick={() => setCurrentPage('upload')} colorScheme="green" mr={4}>
                Document Upload
              </Button>
              <Button onClick={() => setCurrentPage('query')} colorScheme="purple">
                Query Labor Laws
              </Button>
            </Box>
            <Box>
              <Heading size="md" mb={4}>HR Information</Heading>
              <Text>Welcome to the HR Dashboard. Here you can manage your HR tasks and request admin promotion if needed.</Text>
            </Box>
          </VStack>
        );
    }
  };

  return (
    <Box>
      {currentPage !== 'main' && (
        <Button onClick={() => setCurrentPage('main')} mb={4}>
          Back to Dashboard
        </Button>
      )}
      {renderPage()}
    </Box>
  );
}

export default HRDashboard;