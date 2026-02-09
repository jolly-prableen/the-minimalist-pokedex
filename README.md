# The Minimalist Pokédex

A premium, Apple-inspired Pokédex built with modern frontend technologies, focused on clarity, motion, and product-level user experience rather than a traditional data-heavy UI.

This project is designed as a **portfolio-grade frontend application**, showcasing real-world architecture, animation systems, and thoughtful UX flows.

---

## ✨ Overview

**The Minimalist Pokédex** lets users explore Pokémon data through a clean, focused interface with smooth transitions, dynamic theming, and persistent interactions.

The experience is intentionally designed to feel like a polished product rather than a simple API demo.

---

## 🚀 Key Features

### 🔍 Premium Pokémon Search
- Search Pokémon by name using the public **PokeAPI**
- Skeleton loading states and graceful error handling
- Keyboard shortcuts:
  - `/` to focus search
  - `Esc` to return to home

---

### 🧬 Product-Style Pokémon Card
- Apple-inspired layout with generous spacing
- Official Pokémon artwork
- **Shiny toggle** without refetching
- Animated base stats
- Flip interaction for extended details
- Comparison insights when switching Pokémon

---

### 🎨 Dynamic Type-Based Theming
- Accent colors adapt to Pokémon’s primary type
- Soft gradients and highlights applied globally
- CSS variables synced with UI state
- Theme updates automatically per search

---

### 🌌 Curated Starter Orbit
- Animated, exploration-first starter selector
- Clickable famous Pokémon (Charmander, Bulbasaur, etc.)
- Smooth transition from exploration → focus
- Behaves exactly like a search action

---

### 🧳 Collection & Favorites System
- Pokémon are collected only via explicit **Collect** action
- Animated card flight into the collection bag
- Persistent collection state
- Automatically grouped by Pokémon type
- Favorites tracked separately

---

### 🕰 Search History
- Recently viewed Pokémon shown as quick-access chips
- Click to instantly revisit a Pokémon
- History updates only on successful searches

---

### 🎥 Motion With Intent
- Built entirely with **Framer Motion**
- Reduced-motion support (system + manual preference)
- Context-aware animation timing
- Layout transitions via `LayoutGroup`

---

## 🛠 Tech Stack

### Core
- **React 18**
- **TypeScript**
- **Vite 5**

### State & Data
- **TanStack React Query** – API data fetching & caching
- **Zustand** – global UI and persistence state

### Styling & Motion
- **Tailwind CSS**
- **Framer Motion**

---

## 📁 Project Structure


