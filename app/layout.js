import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { Toolbar, Typography, Button } from '@mui/material';

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body>
          <Toolbar>
            <Typography variant='h6' style={{ flexGrow: 1 }}>
              Flashcard SaaS
            </Typography>
            <SignedOut>
              <Button color='inherit' href='/sign-in'>
                Login
              </Button>
              <Button color='inherit' href='/sign-up'>
                Sign Up
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </Toolbar>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
