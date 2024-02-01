import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import routes from './routes';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Web3Modal from './components/Web3Modal';
import { ChakraProvider } from '@chakra-ui/react';

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Web3Modal>
      <ChakraProvider>
        <RouterProvider router={router} />
      </ChakraProvider>
    </Web3Modal>
  </React.StrictMode>
);
