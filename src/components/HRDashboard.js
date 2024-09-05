import React, { useState } from 'react';
import { Box, Button, VStack, Heading, Text, Container, SimpleGrid, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaUpload, FaSearch, FaFileAlt, FaChartBar } from 'react-icons/fa';
import DocumentUpload from './DocumentUpload';
import QueryPage from './QueryPage';
import GenerateDocument from './GenerateDocument';
import PerformanceReview from './PerformanceReview';

function HRDashboard() {
  const [currentPage, setCurrentPage] = useState('main');

  const requestAdminPromotion = async () => {
    // ... (keep the existing implementation)
  };

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const cardBgColor = useColorModeValue('white', 'gray.800');

  const DashboardCard = ({ title, icon, onClick }) => (
    <Box 
      bg={cardBgColor} 
      p={6} 
      borderRadius="lg" 
      boxShadow="md" 
      textAlign="center" 
      cursor="pointer" 
      onClick={onClick}
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
    >
      <Icon as={icon} w={10} h={10} color="blue.500" mb={4} />
      <Heading size="md">{title}</Heading>
    </Box>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'upload':
        return <DocumentUpload />;
      case 'query':
        return <QueryPage />;
      case 'generate':
        return <GenerateDocument />;
      case 'performance':
        return <PerformanceReview />;
      default:
        return (
          <VStack spacing={8} align="stretch">
            <Heading size="lg" color="blue.600">HR Dashboard</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <DashboardCard title="Document Upload" icon={FaUpload} onClick={() => setCurrentPage('upload')} />
              <DashboardCard title="Query Labor Laws" icon={FaSearch} onClick={() => setCurrentPage('query')} />
              <DashboardCard title="Generate HR Document" icon={FaFileAlt} onClick={() => setCurrentPage('generate')} />
              <DashboardCard title="Performance Review Analysis" icon={FaChartBar} onClick={() => setCurrentPage('performance')} />
            </SimpleGrid>
            <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={4}>HR Information</Heading>
              <Text>Welcome to the HR Dashboard. Here you can manage your HR tasks and access various tools.</Text>
              <Button onClick={requestAdminPromotion} colorScheme="blue" mt={4}>
                Request Admin Promotion
              </Button>
            </Box>
          </VStack>
        );
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box bg={bgColor} p={6} borderRadius="lg">
        {currentPage !== 'main' && (
          <Button onClick={() => setCurrentPage('main')} mb={4} leftIcon={<Icon as={FaChartBar} />}>
            Back to Dashboard
          </Button>
        )}
        {renderPage()}
      </Box>
    </Container>
  );
}

export default HRDashboard;