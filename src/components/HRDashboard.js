import React from 'react';
import axios from 'axios';
import { Box, Button, VStack, Heading, Text } from '@chakra-ui/react';

function HRDashboard() {
  const requestAdminPromotion = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://ghana-api.vercel.app/request-admin-promotion', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Admin promotion request sent successfully');
    } catch (err) {
      console.error(err);
      alert('Error requesting admin promotion');
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="md" mb={4}>Actions</Heading>
        <Button onClick={requestAdminPromotion} colorScheme="blue">
          Request Admin Promotion
        </Button>
      </Box>
      <Box>
        <Heading size="md" mb={4}>HR Information</Heading>
        <Text>Welcome to the HR Dashboard. Here you can manage your HR tasks and request admin promotion if needed.</Text>
      </Box>
    </VStack>
  );
}

export default HRDashboard;