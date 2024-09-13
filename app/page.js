'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Stack,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import getStripe from './utils/get-stripe.js';

export default function Home() {
  // This function handles the Stripe checkout process when a user selects the Pro plan
  const handlePremiumClick = async () => {
    const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000' },
    });
    const checkoutSessionJson = await checkoutSession.json();

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });

    if (error) {
      console.warn(error.message);
    }
  };

  const features = [
    {
      title: 'AI-Powered Flashcards',
      description:
        'Automatically generate flashcards based on your study material using AI to help you learn efficiently.',
      image: 'https://source.unsplash.com/random/800x600?ai,learning', // Placeholder image URL
    },
    {
      title: 'Spaced Repetition',
      description:
        'Utilizes spaced repetition algorithms to enhance your memory retention and ensure long-term learning.',
      image: 'https://source.unsplash.com/random/800x600?memory,study',
    },
    {
      title: 'Customizable Content',
      description:
        'Easily customize and add your own content to flashcards to match your specific learning needs.',
      image: 'https://source.unsplash.com/random/800x600?custom,education',
    },
    {
      title: 'Progress Tracking',
      description:
        'Track your learning progress with detailed statistics and analytics to keep yourself motivated.',
      image: 'https://source.unsplash.com/random/800x600?analytics,progress',
    },
  ];

  const pricingPlans = [
    {
      title: 'Free Plan',
      price: 'Free',
      description:
        'Access to basic flashcard generation and practice features.',
      features: [
        'AI-Powered Flashcards',
        'Basic Spaced Repetition',
        'Limited Customization',
      ],
      buttonText: 'Get Started',
      buttonVariant: 'outlined',
    },
    {
      title: 'Premium Plan',
      price: '$9.99/month',
      description:
        'Unlock advanced features like saving flashcards, buying sets, and more.',
      features: [
        'All Free Plan Features',
        'Save Flashcards',
        'Buy & Sell Flashcard Sets',
        'Advanced Analytics',
        'Priority Support',
      ],
      buttonText: 'Upgrade Now',
      buttonVariant: 'contained',
    },
  ];

  return (
    <AppBar position='static'>
      {/* <Toolbar>
    <Typography variant="h6" style={{flexGrow: 1}}>
      Flashcard SaaS
    </Typography>
    <SignedOut>
      <Button color="inherit" href="/sign-in">Login</Button>
      <Button color="inherit" href="/sign-up">Sign Up</Button>
    </SignedOut>
    <SignedIn>
      <UserButton />
    </SignedIn>
  </Toolbar> */}

      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant='h2' component='h1' gutterBottom>
          Welcome to Flashcard SaaS
        </Typography>
        <Typography variant='h5' component='h2' gutterBottom>
          The easiest way to create flashcards from your text.
        </Typography>
        <Button
          variant='contained'
          color='primary'
          sx={{ mt: 2, mr: 2 }}
          href='/generate'
        >
          Get Started
        </Button>

        <Button variant='outlined' color='light' sx={{ mt: 2 }}>
          Learn More
        </Button>
      </Box>

      <Box sx={{ my: 6, textAlign: 'center', px: 2 }}>
        <Typography variant='h4' component='h2' gutterBottom>
          Features
        </Typography>
        <Stack
          spacing={4}
          direction={{ xs: 'column', sm: 'row' }}
          flexWrap='wrap'
          justifyContent='center'
          alignContent={{ xs: 'center', sm: 'stretch' }}
        >
          {features.map((feature, index) => (
            <Card key={index} sx={{ maxWidth: 345, flex: '1 0 21%', m: 2 }}>
              {/* <CardMedia
                component='img'
                height='140'
                image={feature.image}
                alt={feature.title}
              /> */}
              <CardContent>
                <Typography gutterBottom variant='h5' component='div'>
                  {feature.title}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size='small'>Learn More</Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      </Box>

      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant='h4' component='h2' gutterBottom>
          Pricing Plans
        </Typography>
        <Stack
          spacing={{ xs: 4 }}
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent='center'
          alignContent={{ xs: 'center', sm: 'stretch' }}
          flexWrap='wrap'
        >
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              sx={{ maxWidth: 345, minWidth: 300, flex: '1 0 45%', m: 2 }}
            >
              <CardContent>
                <Typography gutterBottom variant='h5' component='div'>
                  {plan.title}
                </Typography>
                <Typography
                  variant='h4'
                  component='div'
                  color='primary'
                  gutterBottom
                >
                  {plan.price}
                </Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  {plan.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant='body2' color='text.secondary'>
                  Features:
                </Typography>
                <ul>
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        component='span'
                      >
                        {feature}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardActions>
                {plan.price === 'Free' ? (
                  <Button
                    href='/generate'
                    variant={plan.buttonVariant}
                    color='primary'
                    fullWidth
                  >
                    {plan.buttonText}
                  </Button>
                ) : (
                  <Button
                    onClick={handlePremiumClick}
                    variant={plan.buttonVariant}
                    color='primary'
                    fullWidth
                  >
                    {plan.buttonText}
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
        </Stack>
      </Box>
    </AppBar>
  );
}
