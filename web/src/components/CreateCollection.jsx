// a form component build with mui framework for creating a new collection
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

export default function CreateCollection() {
  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // eslint-disable-next-line no-console
    console.log({
      firstName: data.get('firstName'),
      lastName: data.get('lastName'),
      email: data.get('email'),
      password: data.get('password'),
    });
  }

  return (
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography component="h1" variant="h5">
        Create Your NFT Collection
      </Typography>
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="collectionName"
              required
              fullWidth
              id="collectionName"
              label="Collection Name"
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="collectionSymbol"
              label="Collection Symbol"
              name="collectionSymbol"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="collectionSupply"
              label="MaxSupply of NFTs"
              name="collectionSupply"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="collectionMintPrice"
              label="NFT Mint Price"
              id="collectionMintPrice"
            />
          </Grid>
          {/* <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox value="allowExtraEmails" color="primary" />}
              label="I want to receive inspiration, marketing promotions and updates via email."
            />
          </Grid> */}
        </Grid>
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Start Create
        </Button>
      </Box>
    </Box>
  );
}
