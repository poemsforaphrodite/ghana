import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, FormControl, FormLabel, Input, Select, VStack, Heading, Text, List, ListItem, Flex } from '@chakra-ui/react';

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

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="md" mb={4}>Create New User</Heading>
        <form onSubmit={handleCreateUser}>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </FormControl>
            <FormControl>
              <FormLabel>Role</FormLabel>
              <Select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="hr">HR Officer</option>
                <option value="admin">Admin</option>
              </Select>
            </FormControl>
            <Button type="submit" colorScheme="blue">Create User</Button>
          </VStack>
        </form>
      </Box>
      <Box>
        <Heading size="md" mb={4}>Current Users</Heading>
        <List spacing={3}>
          {users.map(user => (
            <ListItem key={user._id} p={2} bg="gray.100" borderRadius="md">
              <Flex justifyContent="space-between" alignItems="center">
                <Text>{user.username} ({user.role})</Text>
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
  );
}

export default AdminDashboard;