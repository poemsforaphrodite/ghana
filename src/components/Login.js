import React, { useState } from 'react';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text, Link, Alert, AlertIcon } from '@chakra-ui/react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://ghana-api.vercel.app/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('username', username);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid credentials');
    }
  };

  return (
    <Box maxWidth="400px" margin="auto" mt={8}>
      <VStack spacing={4} align="stretch">
        <Heading>Log In</Heading>
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormControl>
            <Button type="submit" colorScheme="blue" width="full">Log In</Button>
          </VStack>
        </form>
        <Text>Don't have an account? <Link as={RouterLink} to="/signup" color="blue.500">Sign up</Link></Text>
      </VStack>
    </Box>
  );
}

export default Login;