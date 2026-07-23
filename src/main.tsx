import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Read Convex URL. It will be defined once the user runs 'npx convex dev'
const convexUrl = import.meta.env.VITE_CONVEX_URL;
const isConvexActive = !!convexUrl;

const client = isConvexActive ? new ConvexReactClient(convexUrl) : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {client ? (
      <ConvexProvider client={client}>
        <App isConvexActive={true} />
      </ConvexProvider>
    ) : (
      <App isConvexActive={false} />
    )}
  </StrictMode>,
);
