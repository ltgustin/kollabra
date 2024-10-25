import { Button, Container, Typography } from '@mui/material'; 

import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="md" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <Typography align="center" mb={3} variant="h1" color="black">Helping NFT Collections and creatives kollaborate</Typography>
      <Link href="/signin" passHref>
        <Button variant="contained" color="secondary">Sign Up Today</Button>
      </Link>
    </Container>
  );
}
