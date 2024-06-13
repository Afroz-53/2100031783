const express = require('express')
const axios = require('axios')

const app = express()
const PORT = 9876
const WINDOW_SIZE = 10
let numbersWindow = [1, 3, 5, 7]

const QUALIFIERS = {
  p: 'primes',
  f: 'fibo',
  e: 'even',
  r: 'random',
}

// Example authentication token, replace with actual if needed
const API_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE4MjY1MDI1LCJpYXQiOjE3MTgyNjQ3MjUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImFhNTQyZTFmLWUyN2EtNGM2Yy05NzQyLTYzNjMzZmFhM2Q2MSIsInN1YiI6IjIxMDAwMzE3ODNjc2VoQGdtYWlsLmNvbSJ9LCJjb21wYW55TmFtZSI6IktMdW5pdmVyc2l0eSIsImNsaWVudElEIjoiYWE1NDJlMWYtZTI3YS00YzZjLTk3NDItNjM2MzNmYWEzZDYxIiwiY2xpZW50U2VjcmV0IjoidFR6Y01jUERQVkFoT1plSiIsIm93bmVyTmFtZSI6IlNoYWlrIFNhcWxhaW4gQWZyb3oiLCJvd25lckVtYWlsIjoiMjEwMDAzMTc4M2NzZWhAZ21haWwuY29tIiwicm9sbE5vIjoiMjEwMDAzMTc4MyJ9.cucwTkcBAaWwCxL2yeNr3g40WYwpoQYa27NIiwy2Yfk'

async function fetchNumbers(qualifier) {
  try {
    console.log(QUALIFIERS[qualifier])
    const response = await axios.get(
      `http://20.244.56.144/test/${QUALIFIERS[qualifier]}`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`, // Include token if required
        },
        timeout: 50000,
      }
    )
    console.log(response.data.numbers)
    return response.data.numbers
  } catch (error) {
    console.error('Error fetching numbers:', error.message)
    return []
  }
}

function updateWindow(newNumbers) {
  const uniqueNewNumbers = newNumbers.filter(
    (num) => !numbersWindow.includes(num)
  )
  numbersWindow = [...numbersWindow, ...uniqueNewNumbers]
  if (numbersWindow.length > WINDOW_SIZE) {
    numbersWindow = numbersWindow.slice(-WINDOW_SIZE)
  }
}

function calculateAverage(numbers) {
  if (numbers.length === 0) {
    return 0.0
  }
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  return sum / numbers.length
}

app.get('/numbers/:numberid', async (req, res) => {
  const numberId = req.params.numberid

  if (!QUALIFIERS[numberId]) {
    return res.status(400).json({ detail: 'Invalid number ID qualifier' })
  }

  const newNumbers = await fetchNumbers(numberId)
  const windowPrevState = [...numbersWindow]
  updateWindow(newNumbers)
  const windowCurrState = [...numbersWindow]
  const avg = calculateAverage(windowCurrState)

  res.json({
    numbers: newNumbers,
    windowPrevState: windowPrevState,
    windowCurrState: windowCurrState,
    avg: avg,
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})