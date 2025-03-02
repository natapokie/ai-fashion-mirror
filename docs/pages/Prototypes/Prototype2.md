---
layout: default
title: Prototype 2 Interactive iPad Display
parent: Prototypes
---

# Prototype 2: Interactive iPad Display

The Interactive iPad Display prototype uses a camera to capture the user's image and provides personalized clothing recommendations based on the user's appearance, weather, and activities.

## Repo Organization

- **client/**: Contains the React frontend that interacts with the iPad camera and displays clothing suggestions.
- **server/**: Express server handling AI interactions and data processing.
- **assets/**: Contains images and other resources for the app.
- **docs/**: Documentation for the project.

## Tech Stack

- **Frontend**: React, Next.js for building the iPad user interface and managing user interactions.
- **Backend**: Node.js with Express for API requests and managing backend processes.
- **AI/ML**: OpenAI for generating clothing recommendations based on user data.
- **Vector Database**: Pinecone for storing and retrieving clothing recommendations.
- **Camera Service**: Captures images of the user for analysis.

## Required Keys

- **OpenAI API Key**: For generating clothing suggestions based on the user's image.
- **Pinecone API Key**: For storing and retrieving clothing data.
- **Camera Access**: Ensure that the iPad camera is properly configured and accessible by the app.
