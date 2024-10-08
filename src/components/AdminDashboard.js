import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, FormControl, FormLabel, Input, Select, VStack, Heading, Text, List, ListItem, Flex, Container, Divider, useColorModeValue } from '@chakra-ui/react';

const apiUrl = process.env.REACT_APP_API_URL || 'https://ghana-api.vercel.app';

function AdminDashboard() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('hr');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching users');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/create-user`, 
        { username, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User created successfully');
      setUsername('');
      setPassword('');
      setRole('hr');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Error creating user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${apiUrl}/delete-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Error deleting user');
    }
  };

  const handleApproveAdminPromotion = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${apiUrl}/approve-admin-promotion/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User promoted to admin successfully');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Error promoting user to admin');
    }
  };

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const cardBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md">
          <Heading size="lg" mb={6} color="blue.600">Admin Dashboard</Heading>
          <Divider mb={6} />
          <Heading size="md" mb={4}>Create New User</Heading>
          <form onSubmit={handleCreateUser}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required focusBorderColor="blue.400" />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required focusBorderColor="blue.400" />
              </FormControl>
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select value={role} onChange={(e) => setRole(e.target.value)} required focusBorderColor="blue.400">
                  <option value="hr">HR Officer</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormControl>
              <Button type="submit" colorScheme="blue" size="lg">Create User</Button>
            </VStack>
          </form>
        </Box>
        <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={4}>Current Users</Heading>
          <List spacing={3}>
            {users.map(user => (
              <ListItem key={user._id} p={4} bg={bgColor} borderRadius="md">
                <Flex justifyContent="space-between" alignItems="center">
                  <Text fontWeight="medium">{user.username} <Text as="span" color="gray.500">({user.role})</Text></Text>
                  <Box>
                    {user.role === 'hr' && user.adminRequestPending && (
                      <Button onClick={() => handleApproveAdminPromotion(user._id)} colorScheme="green" size="sm" mr={2}>
                        Approve Promotion
                      </Button>
                    )}
                    <Button onClick={() => handleDeleteUser(user._id)} colorScheme="red" size="sm">Delete</Button>
                  </Box>
                </Flex>
              </ListItem>
            ))}
          </List>
        </Box>
      </VStack>
    </Container>
  );
}

export default AdminDashboard;