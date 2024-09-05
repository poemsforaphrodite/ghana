import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, Heading, Text, Button, VStack } from '@chakra-ui/react';
import AdminDashboard from './AdminDashboard';
import HRDashboard from './HRDashboard';

function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <Box maxWidth="1200px" margin="auto" mt={8} p={4}>
      <VStack spacing={8} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading>Dashboard</Heading>
          <Box>
            <Text>Logged in as: <strong>{username}</strong> ({role})</Text>
            <Button onClick={handleLogout} colorScheme="red" size="sm" mt={2}>Logout</Button>
          </Box>
        </Flex>
        {role === 'admin' ? <AdminDashboard /> : <HRDashboard />}
      </VStack>
    </Box>
  );
}

export default Dashboard;