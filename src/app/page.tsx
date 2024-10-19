import { Button, Container, Typography } from '@mui/material'; import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Typography variant="h4">Welcome to Kollabra!</Typography>
      <Link href="/signin" passHref>
        <Button variant="contained" color="primary">Go to Sign In</Button>
      </Link>
    </Container>
  );
}
