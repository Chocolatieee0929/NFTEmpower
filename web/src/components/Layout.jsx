import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import { Link } from 'react-router-dom';
import Web3ConnectButton from './Web3ConnectButton';

export default function AppLayout({ children }) {
  //  use mui@5 to build website layout. header, center is page content area, footer. header contains logo, menu, login btn .center contains page content. footer contains some links.
  return (
    <div>
      <Container maxWidth={false} style={{ padding: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static" style={{ padding: '10px 0' }}>
            <Grid container spacing={3}>
              <Grid xs={3} style={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  NFT BAZAAR
                </Typography>
              </Grid>
              <Grid xs>
                <Stack direction="row" spacing={2}>
                  <Button variant="text" style={{ color: '#fff' }} component={Link} to={'/'}>
                  Market

                  </Button>
                  {/* <Button variant="text" style={{ color: '#fff' }} href="/profile">
                    Profile
                  </Button> */}
                  <Button variant="text" style={{ color: '#fff' }} component={Link} to={'/create-nft'}>
                    Mint
                  </Button>
                </Stack>
              </Grid>
              <Grid xs={3}>
                <Web3ConnectButton></Web3ConnectButton>
              </Grid>
            </Grid>
          </AppBar>
          <Box component="main" sx={{ flex: '1 0 auto' }}>
            {children}
          </Box>
        </Box>
      </Container>
    </div>
  );
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
