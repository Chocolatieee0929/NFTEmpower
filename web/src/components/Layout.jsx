import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Web3ConnectButton from './Web3ConnectButton';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Flex, Spacer, Box, Button, Heading } from '@chakra-ui/react';

const queryClient = new QueryClient();

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  return (
    <QueryClientProvider client={queryClient}>
      <Flex minWidth="max-content" alignItems="center" gap="2" bgColor="blue.700" color="white">
        <Box p="2" ml="16">
          <Heading size="md">NFTEmpower</Heading>
        </Box>
        <Box p="2" ml="16">
          <Button colorScheme="teal" variant="link" color="blue.300" mr="8" onClick={() => navigate('/')}>
            NFT Listed
          </Button>
          <Button
            colorScheme="teal"
            variant="link"
            color="blue.300"
            mr="8"
            onClick={() => navigate('/collection/list')}
          >
            NFT Collections
          </Button>
          <Button
            colorScheme="teal"
            variant="link"
            color="blue.300"
            onClick={() => navigate('/collection/create')}
          >
            Create
          </Button>
        </Box>
        <Spacer />
        <Box p="2">
          <Web3ConnectButton />
        </Box>
      </Flex>
      <Box minHeight={'90vh'} width="100%">
        {children}
      </Box>
    </QueryClientProvider>
  );
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
