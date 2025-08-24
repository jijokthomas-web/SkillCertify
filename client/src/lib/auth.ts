declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

export const initNetlifyIdentity = () => {
  if (typeof window !== 'undefined' && !window.netlifyIdentity) {
    // Load Netlify Identity widget
    const script = document.createElement('script');
    script.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.netlifyIdentity.init({
        APIUrl: import.meta.env.VITE_NETLIFY_IDENTITY_URL || `${window.location.origin}/.netlify/identity`,
      });
    };
  }
};

export const loginWithGoogle = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!window.netlifyIdentity) {
      reject(new Error('Netlify Identity not loaded'));
      return;
    }

    // Open login modal
    window.netlifyIdentity.open('login');

    // Listen for login events
    window.netlifyIdentity.on('login', (user: any) => {
      window.netlifyIdentity.close();
      resolve(user);
    });

    window.netlifyIdentity.on('error', (error: any) => {
      reject(error);
    });
  });
};

export const logout = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.logout();
      window.netlifyIdentity.on('logout', () => {
        resolve();
      });
    } else {
      resolve();
    }
  });
};

export const getCurrentUser = () => {
  if (typeof window !== 'undefined' && window.netlifyIdentity) {
    return window.netlifyIdentity.currentUser();
  }
  return null;
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  if (typeof window !== 'undefined' && window.netlifyIdentity) {
    window.netlifyIdentity.on('login', callback);
    window.netlifyIdentity.on('logout', () => callback(null));
  }
};
