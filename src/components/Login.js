import React, { useState } from 'react';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text, Link, Alert, AlertIcon, Container } from '@chakra-ui/react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://ghana-api.vercel.app';
      const response = await axios.post(`${apiUrl}/login`, { username, password });
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
    <Container maxW="md" centerContent>
      <Box w="100%" p={8} mt={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
        <VStack spacing={6} align="stretch">
          <Heading textAlign="center" color="blue.600">Log In</Heading>
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} focusBorderColor="blue.400" />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} focusBorderColor="blue.400" />
              </FormControl>
              <Button type="submit" colorScheme="blue" width="full" size="lg">
                Log In
              </Button>
            </VStack>
          </form>
          <Text textAlign="center">
            Don't have an account? <Link as={RouterLink} to="/signup" color="blue.500" fontWeight="medium">Sign up</Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
}

export default Login;