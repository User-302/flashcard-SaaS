'use client';
import db from '../../firebase.js';
import { doc, collection, getDoc, setDoc } from 'firebase/firestore';
import { useUser, useAuth } from '@clerk/nextjs';

import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  Grid,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

export default function Generate() {
  const { user } = useUser();
  const [text, setText] = useState('');
  const [flashcards, setFlashcards] = useState([]);

  // state for the flashcard set name and the dialog open state
  const [deckname, setDeckname] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // functions to handle opening and closing the dialog
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const handleSubmit = async () => {
    // We'll implement the API call here
    if (!text.trim()) {
      // 1. It checks if the input text is empty and shows an alert if it is.
      alert('Please enter some text to generate flashcards.');
      return;
    }

    try {
      // 2. It sends a POST request to our `/api/generate` endpoint with the input text.
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }), // Send data as JSON
      });

      // 4. If an error occurs, it logs the error and shows an alert to the user.
      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      setFlashcards(data.flashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('An error occurred while generating flashcards. Please try again.');
    }
  };

  // function to save flashcards to Firebase
  const saveFlashcards = async () => {
    if (!user) return; // Ensure the user is logged in

    const userId = user.id; // Get Clerk's user ID
    const userDocRef = doc(db, 'users', userId); // Reference to the Firestore document for the user

    try {
      // Check if the user exists in Firestore
      const userSnapshot = await getDoc(userDocRef);

      // If the user doesn't exist, create the user in Firestore
      if (!userSnapshot.exists()) {
        await setDoc(userDocRef, {
          name: user.fullName, // Save user details from Clerk
          email: user.emailAddresses[0].emailAddress, // Clerk stores email in an array
          createdAt: new Date(),
        });
        console.log('User created in Firestore.');
      }

      // Save the list of flashcards to the user's document
      const flashcardsRef = collection(userDocRef, 'flashcards'); // Sub-collection of flashcards for the user

      // Batch save flashcards
      for (const card of flashcards) {
        const newFlashcardRef = doc(flashcardsRef); // Auto-generate an ID for the flashcard
        await setDoc(newFlashcardRef, {
          front: card.front,
          back: card.back,
          createdAt: new Date(),
        });
      }

      console.log('Flashcards saved successfully!');
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving flashcards: ', error);
    }
  };

  return (
    <Container maxWidth='md'>
      <Box sx={{ my: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Generate Flashcards
        </Typography>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          label='Enter text'
          fullWidth
          multiline
          rows={4}
          variant='outlined'
          sx={{ mb: 2 }}
        />
        <Button
          variant='contained'
          color='primary'
          onClick={handleSubmit}
          fullWidth
        >
          Generate Flashcards
        </Button>
      </Box>
      {/* This code creates a grid of cards, each representing a flashcard with its front and back content/ */}
      {
        /* We'll add flashcard display here */
        flashcards.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant='h5' component='h2' gutterBottom>
              Generated Flashcards
            </Typography>
            <Grid container spacing={2}>
              {flashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant='h6'>Front:</Typography>
                      <Typography>{flashcard.front}</Typography>
                      <Typography variant='h6' sx={{ mt: 2 }}>
                        Back:
                      </Typography>
                      <Typography>{flashcard.back}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )
      }
      {flashcards.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant='contained'
            color='primary'
            onClick={handleOpenDialog}
          >
            Save Flashcards
          </Button>
        </Box>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Save Flashcard Set</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name for your flashcard set.
          </DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            label='Set Name'
            type='text'
            fullWidth
            value={deckname}
            onChange={(e) => setDeckname(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={saveFlashcards} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
