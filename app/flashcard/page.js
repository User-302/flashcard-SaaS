// individual flashcard set view page
// which will allow users to study and interact with their saved flashcards.
'use client'

import { useState } from 'react'

export default function Flashcard() {
    // This component uses Clerk’s `useUser` hook for authentication
    // React’s `useState` for managing the flashcards and their flip states
    // and Next.js’s `useSearchParams` to get the flashcard set ID from the URL.
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState({})
  
    const searchParams = useSearchParams()
    const search = searchParams.get('id')

    // The component uses a `useEffect` hook to fetch the specific flashcard set
    // when the component mounts or when the user or search parameter changes

    // This function retrieves all flashcards in the specified set from Firestore and updates the `flashcards` state
    useEffect(() => {
        async function getFlashcard() {
          if (!search || !user) return
      
          const colRef = collection(doc(collection(db, 'users'), user.id), search)
          const docs = await getDocs(colRef)
          const flashcards = []
          docs.forEach((doc) => {
            flashcards.push({ id: doc.id, ...doc.data() })
          })
          setFlashcards(flashcards)
        }
        getFlashcard()
      }, [search, user])

    // The component includes a function to handle flipping flashcards
    // This function toggles the flip state of a flashcard when it’s clicked
    const handleCardClick = (id) => {
    setFlipped((prev) => ({
        ...prev,
        [id]: !prev[id],
    }))
    }
    // The component renders a grid of flashcards, each with a flipping animation
    // Each flashcard is displayed as a card that flips when clicked, revealing the back of the card
    // The flip animation is achieved using CSS transforms and transitions
    // This individual flashcard set view provides an interactive way for users to study their flashcards
    // Users can flip cards to reveal answers and test their knowledge.
    return (
        <Container maxWidth="md">
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {flashcards.map((flashcard) => (
              <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
                <Card>
                  <CardActionArea onClick={() => handleCardClick(flashcard.id)}>
                    <CardContent>
                      <Box sx={{ /* Styling for flip animation */ }}>
                        <div>
                          <div>
                            <Typography variant="h5" component="div">
                              {flashcard.front}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="h5" component="div">
                              {flashcard.back}
                            </Typography>
                          </div>
                        </div>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )
  }