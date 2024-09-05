import React, { useState } from 'react';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, Select, VStack, Heading, Text, Link } from '@chakra-ui/react';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('hr');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://ghana-api.vercel.app/signup', { username, password, role });
      alert('User created successfully');
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message);
      alert(`Error creating user: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <Box maxWidth="400px" margin="auto" mt={8}>
      <VStack spacing={4} align="stretch">
        <Heading>Sign Up</Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
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
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </Select>
            </FormControl>
            <Button type="submit" colorScheme="blue" width="full">Sign Up</Button>
          </VStack>
        </form>
        <Text>Already have an account? <Link as={RouterLink} to="/login" color="blue.500">Log in</Link></Text>
      </VStack>
    </Box>
  );
}

export default Signup;