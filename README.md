<img src="images/memoria.png" />

## [▶️ Watch the Demo Video, play at 1.5X speed](https://youtu.be/cSmVhreDQ2w)

# Memoria
## Background
We have a team member who is a caretaker of someone with Alzheimers. Together with him, we explored how AI could maybe make things a bit easier for a person with Alzheimers.

# Features
## Memory bank
Having a virtual memory, based on firebase, to help keep important facts about the person e.g. medication, allergies, favourite flavours or even owning a pet. This memory bank is the basis for a RAG system for our agent.

<img src="images/memory-bank.png" />

## Voice Virtual Caregiver
A biderectional voice agent that can reach into the person's details and memories through RAG.

<img src="images/voice-chat.png" />

## Loved one identifier
Using image recognition, helps the user remember who he or she is looking at.

<img src="images/loved-ones.png" />

## Chat Virtual Caregiver with History
Allows the user to chat and most importantly record what was being said so a caregiver can observe the user's day to day interactions and determine if attention is needed.

<img src="images/history.png" />

## Memory Theraphy
Using sweet memories to help sooth the person in times of negative emotions. The AI agent knows which memory is the best for that emotional moment.

<img src="images/memory-therapy.png" />

## Emergency Assistant
Being able to detect dangerous situation and automatically relay important information to first helpers through the RAG system.

<img src="images/emergency.png" />

# Technologies Used

This project heavily leverages Google's AI capabilities and Firebase to deliver a context-aware, personalized assistant for Alzheimer's patients.

### 🧠 Google Gemini AI
- **`gemini-3-flash-preview` (Multimodal Vision)**: Powers the **Loved One Identifier** feature. It takes image input alongside RAG data (a list of known loved ones) to recognize faces and help patients remember who they are looking at.
- **`gemini-2.5-flash`**: The core reasoning engine for the **Virtual Caregiver** (both Chat and Voice). It utilizes conversation history and system instructions to provide empathetic and context-aware responses based on the patient's personal memory bank.
- **`gemini-2.5-flash` with Google Maps Tool**: Used in the **Emergency Assistant** to automatically verify physical addresses and provide relevant situational context in real-time.
- **`gemini-2.5-flash-preview-tts` (Text-to-Speech)**: Drives the **Bidirectional Voice Agent**, generating realistic, comforting spoken audio (using custom voice options like Kore, Puck, and Fenrir).
- **`@google/genai` SDK**: The primary official SDK used across the application to interface cleanly with all Gemini models and tools.

### 🔥 Firebase
- **Firestore (NoSQL Database)**: Serves as the persistent **Virtual Memory Bank**. It reliably stores patient profiles, medical facts, and relationships, forming the critical retrieval backend for our RAG system.
- **Firebase Authentication**: Secures access using the Google Auth Provider to ensure caretakers and patients have isolated, secure access to sensitive memory data.

### 💻 Frontend & Ecosystem
- **React 19, TypeScript, and Vite**: Provides a snappy, reliable user interface.
- **Tailwind CSS**: For rapid, accessible UI styling tailored for readability.
