// Safe custom element registration interceptor (prevents duplicate customElements.define errors)
if (typeof window !== 'undefined' && window.customElements) {
  const origDefine = window.customElements.define.bind(window.customElements);
  window.customElements.define = (name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) => {
    if (window.customElements.get(name)) {
      console.warn(`[CustomElements] Element '${name}' already registered, skipping duplicate definition.`);
      return;
    }
    return origDefine(name, constructor, options);
  };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
