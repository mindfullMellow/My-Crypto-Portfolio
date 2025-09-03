# 🎯 Universal Loader - Complete Documentation

A beautiful, animated loading overlay system that can be used anywhere in your web application. Features a stunning coin-stacking animation with customizable branding and zero dependencies.

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation Methods](#-installation-methods)
- [🎨 API Reference](#-api-reference)
- [💡 Usage Examples](#-usage-examples)
- [🌐 Page Loading Scenarios](#-page-loading-scenarios)
- [🔧 API Call Integration](#-api-call-integration)
- [🎭 Customization](#-customization)
- [⚡ Best Practices](#-best-practices)
- [🐛 Troubleshooting](#-troubleshooting)
- [🔍 Advanced Usage](#-advanced-usage)

## ✨ Features

- 🎨 **Beautiful Coin Animation** - Eye-catching stacked coin dropping animation
- 🔧 **Zero Configuration** - Works immediately after import
- 📱 **Fully Responsive** - Looks great on all screen sizes
- 🌐 **Universal Compatibility** - Works with any framework or vanilla JS
- ⚡ **Lightweight** - Self-contained, no external dependencies
- 🎭 **Customizable** - Change colors, text, and branding easily
- 🔒 **Safe** - Automatically prevents body scrolling when active
- 🚀 **Multiple Import Methods** - ES6 modules, CommonJS, or script tags
- 💫 **Smooth Animations** - CSS-powered animations with hardware acceleration
- 🎯 **Auto-Injection** - CSS and HTML are automatically injected

## 🚀 Quick Start

### 1. Save the Module
Save the `UniversalLoader` class to `js/universal-loader.js` in your project.

### 2. Basic Usage (Script Tags)
```html
<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
</head>
<body>
    <h1>Welcome to My App</h1>
    
    <!-- Include the loader -->
    <script src="js/universal-loader.js"></script>
    <script>
        // Show loader
        UniversalLoader.show('Loading...');
        
        // Hide after 3 seconds
        setTimeout(() => {
            UniversalLoader.hide();
        }, 3000);
    </script>
</body>
</html>
```

### 3. ES6 Modules Usage
```javascript
import UniversalLoader from './js/universal-loader.js';

// Show loader
UniversalLoader.show('Loading data...');

// Use with async operations
const data = await UniversalLoader.withLoader(
    async () => {
        const response = await fetch('/api/data');
        return await response.json();
    },
    'Fetching data...'
);
```

## 📦 Installation Methods

### Method 1: Script Tag (Simplest)
```html
<!-- Include in your HTML -->
<script src="js/universal-loader.js"></script>

<!-- Use anywhere -->
<script>
    UniversalLoader.show('Loading...');
    // Your code here
    UniversalLoader.hide();
</script>
```

### Method 2: ES6 Modules (Recommended)
```javascript
// Import in your JS file
import UniversalLoader from './js/universal-loader.js';

// Use in your functions
UniversalLoader.show('Processing...');
```

### Method 3: CommonJS (Node.js)
```javascript
const UniversalLoader = require('./js/universal-loader.js');

// Use in Node.js applications
UniversalLoader.show('Server processing...');
```

### Method 4: Dynamic Import
```javascript
// Lazy load the loader when needed
const { default: UniversalLoader } = await import('./js/universal-loader.js');
UniversalLoader.show('Loading...');
```

## 🎨 API Reference

### Core Methods

#### `UniversalLoader.show(message?)`
Shows the loading overlay with an optional custom message.

**Parameters:**
- `message` (string, optional) - Custom loading message. Default: "Loading..."

**Example:**
```javascript
UniversalLoader.show(); // Shows "Loading..."
UniversalLoader.show('Fetching user data...'); // Shows custom message
```

#### `UniversalLoader.hide()`
Hides the loading overlay and restores page scrolling.

**Example:**
```javascript
UniversalLoader.hide();
```

#### `UniversalLoader.withLoader(asyncFunction, message?)`
Automatically shows the loader, executes an async function, then hides the loader.

**Parameters:**
- `asyncFunction` (function) - Async function to execute
- `message` (string, optional) - Loading message to display

**Returns:** Promise that resolves to the result of the async function

**Example:**
```javascript
const result = await UniversalLoader.withLoader(
    async () => {
        const response = await fetch('/api/data');
        return await response.json();
    },
    'Loading data...'
);
```

### Utility Methods

#### `UniversalLoader.customize(options)`
Customizes the loader appearance and branding.

**Parameters:**
- `options.brandText` (string) - Custom brand text to display
- `options.colors` (array) - Array of 3 hex colors for the coins

**Example:**
```javascript
UniversalLoader.customize({
    brandText: 'MyApp',
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1']
});
```

#### `UniversalLoader.init()`
Manually initializes the loader (usually called automatically).

**Example:**
```javascript
UniversalLoader.init();
```

## 💡 Usage Examples

### Basic Loading
```javascript
// Show loader
UniversalLoader.show('Processing...');

// Do some work
setTimeout(() => {
    UniversalLoader.hide();
    alert('Done!');
}, 2000);
```

### Form Submission
```javascript
async function submitForm(formData) {
    UniversalLoader.show('Submitting form...');
    
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('Form submitted successfully!');
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        UniversalLoader.hide();
    }
}
```

### Data Fetching with Auto Hide/Show
```javascript
async function loadUserData() {
    try {
        const userData = await UniversalLoader.withLoader(
            async () => {
                const response = await fetch('/api/user');
                if (!response.ok) throw new Error('Failed to fetch');
                return await response.json();
            },
            'Loading user profile...'
        );
        
        // Use the data
        displayUserProfile(userData);
    } catch (error) {
        console.error('Failed to load user data:', error);
        alert('Failed to load user data');
    }
}
```

## 🌐 Page Loading Scenarios

### Scenario 1: Traditional Page Load
```html
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
</head>
<body>
    <div id="content">
        <!-- Your page content -->
    </div>

    <script src="js/universal-loader.js"></script>
    <script>
        // Show loader immediately
        UniversalLoader.show('Loading dashboard...');

        // Initialize page when DOM is ready
        document.addEventListener('DOMContentLoaded', async function() {
            try {
                // Load your data
                const data = await fetch('/api/dashboard').then(r => r.json());
                
                // Update UI
                document.getElementById('content').innerHTML = `
                    <h1>Welcome, ${data.user.name}</h1>
                    <!-- More content -->
                `;
                
                // Set up event listeners
                setupEventListeners();
                
            } catch (error) {
                console.error('Page load failed:', error);
            } finally {
                UniversalLoader.hide();
            }
        });
    </script>
</body>
</html>
```

### Scenario 2: ES6 Module Page Load
```html
<!DOCTYPE html>
<html>
<head>
    <title>Profile Page</title>
</head>
<body>
    <div id="profile-content">
        <h1>User Profile</h1>
        <div id="profile-data"></div>
    </div>

    <script type="module">
        import UniversalLoader from './js/universal-loader.js';

        // Show loader immediately when module loads
        UniversalLoader.show('Loading profile...');

        async function initializePage() {
            try {
                // Load profile data
                const profile = await fetch('/api/profile').then(r => r.json());
                
                // Update UI
                document.getElementById('profile-data').innerHTML = `
                    <p><strong>Name:</strong> ${profile.name}</p>
                    <p><strong>Email:</strong> ${profile.email}</p>
                    <p><strong>Role:</strong> ${profile.role}</p>
                `;
                
            } catch (error) {
                console.error('Failed to load profile:', error);
                document.getElementById('profile-data').innerHTML = 
                    '<p>Failed to load profile data</p>';
            } finally {
                UniversalLoader.hide();
            }
        }

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializePage);
        } else {
            initializePage();
        }
    </script>
</body>
</html>
```

### Scenario 3: Single Page Application (SPA)
```javascript
// spa-router.js
import UniversalLoader from './universal-loader.js';

class SPARouter {
    static routes = {
        '/': () => import('./pages/home.js'),
        '/dashboard': () => import('./pages/dashboard.js'),
        '/profile': () => import('./pages/profile.js')
    };

    static async navigate(path) {
        // Show loader for navigation
        UniversalLoader.show(`Loading ${path}...`);

        try {
            // Load the page module
            const pageModule = await this.routes[path]();
            
            // Initialize the page
            await pageModule.default.init();
            
            // Update URL without reload
            history.pushState({}, '', path);
            
        } catch (error) {
            console.error('Navigation failed:', error);
            alert('Failed to load page');
        } finally {
            UniversalLoader.hide();
        }
    }

    static init() {
        // Handle initial page load
        const currentPath = window.location.pathname;
        this.navigate(currentPath);

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.navigate(window.location.pathname);
        });

        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[data-navigate]')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('href'));
            }
        });
    }
}

// Initialize router
SPARouter.init();
```

### Scenario 4: Progressive Loading
```javascript
import UniversalLoader from './universal-loader.js';

class ProgressivePageLoader {
    static async loadPage() {
        try {
            // Phase 1: Load critical data
            UniversalLoader.show('Loading essential data...');
            const criticalData = await fetch('/api/critical').then(r => r.json());
            this.renderCriticalUI(criticalData);

            // Phase 2: Load secondary data
            UniversalLoader.show('Loading additional content...');
            const secondaryData = await fetch('/api/secondary').then(r => r.json());
            this.renderSecondaryUI(secondaryData);

            // Phase 3: Load optional data
            UniversalLoader.show('Finalizing...');
            const optionalData = await fetch('/api/optional').then(r => r.json());
            this.renderOptionalUI(optionalData);

            // Phase 4: Setup interactivity
            UniversalLoader.show('Setting up interface...');
            await this.setupEventListeners();

        } catch (error) {
            console.error('Progressive loading failed:', error);
        } finally {
            UniversalLoader.hide();
        }
    }

    static renderCriticalUI(data) {
        // Render essential UI elements
    }

    static renderSecondaryUI(data) {
        // Render additional content
    }

    static renderOptionalUI(data) {
        // Render nice-to-have content
    }

    static async setupEventListeners() {
        // Set up all interactive elements
        return new Promise(resolve => setTimeout(resolve, 300));
    }
}
```

## 🔧 API Call Integration

### Basic API Wrapper
```javascript
import UniversalLoader from './universal-loader.js';

class ApiService {
    static baseUrl = '/api';

    static async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const loadingMessage = options.loadingMessage || 'Loading...';

        return await UniversalLoader.withLoader(
            async () => {
                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    ...options
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            },
            loadingMessage
        );
    }

    static async get(endpoint, loadingMessage = 'Fetching data...') {
        return this.request(endpoint, { loadingMessage });
    }

    static async post(endpoint, data, loadingMessage = 'Submitting...') {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            loadingMessage
        });
    }

    static async put(endpoint, data, loadingMessage = 'Updating...') {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            loadingMessage
        });
    }

    static async delete(endpoint, loadingMessage = 'Deleting...') {
        return this.request(endpoint, {
            method: 'DELETE',
            loadingMessage
        });
    }
}

export default ApiService;
```

### Usage Examples with API Service
```javascript
import ApiService from './api-service.js';

// GET request
async function loadUsers() {
    try {
        const users = await ApiService.get('/users', 'Loading users...');
        displayUsers(users);
    } catch (error) {
        alert('Failed to load users');
    }
}

// POST request
async function createUser(userData) {
    try {
        const newUser = await ApiService.post('/users', userData, 'Creating user...');
        alert('User created successfully!');
        return newUser;
    } catch (error) {
        alert('Failed to create user');
        throw error;
    }
}

// Multiple API calls
async function loadDashboard() {
    try {
        const [users, stats, notifications] = await Promise.all([
            ApiService.get('/users', 'Loading users...'),
            ApiService.get('/stats', 'Loading statistics...'),
            ApiService.get('/notifications', 'Loading notifications...')
        ]);

        updateDashboard({ users, stats, notifications });
    } catch (error) {
        console.error('Dashboard load failed:', error);
    }
}
```

### Global Fetch Wrapper (Optional)
```javascript
import UniversalLoader from './universal-loader.js';

// Override global fetch to automatically show loader
const originalFetch = window.fetch;

window.fetch = function(...args) {
    // Extract URL for better loading message
    const url = args[0];
    const endpoint = typeof url === 'string' ? url.split('/').pop() : 'data';
    
    UniversalLoader.show(`Loading ${endpoint}...`);
    
    return originalFetch.apply(this, args)
        .finally(() => {
            UniversalLoader.hide();
        });
};

// Usage: Now all fetch calls automatically show the loader
const data = await fetch('/api/users'); // Automatically shows/hides loader
```

## 🎭 Customization

### Brand Customization
```javascript
// Customize brand text and colors
UniversalLoader.customize({
    brandText: 'MyAwesomeApp',
    colors: [
        '#e74c3c', // Top coin - red
        '#2ecc71', // Middle coin - green
        '#3498db'  // Bottom coin - blue
    ]
});

// Then use normally
UniversalLoader.show('Loading MyAwesomeApp...');
```

### Advanced Customization
```javascript
// You can also modify styles after initialization
UniversalLoader.init();

// Access the loader elements
const loader = document.getElementById('universalLoader');
const brandText = loader.querySelector('.brand-text');
const loadingText = loader.querySelector('.loading-text');

// Custom styling
brandText.style.fontSize = '28px';
brandText.style.color = '#ff6b6b';
loadingText.style.color = '#4ecdc4';

// Add custom CSS classes
loader.classList.add('my-custom-loader');
```

### Theme Integration
```javascript
// Dark mode support
function setLoaderTheme(theme) {
    UniversalLoader.init();
    const loader = document.getElementById('universalLoader');
    
    if (theme === 'dark') {
        loader.style.background = 'rgba(0, 0, 0, 0.95)';
        UniversalLoader.customize({
            brandText: 'MyApp',
            colors: ['#bb86fc', '#03dac6', '#cf6679']
        });
    } else {
        loader.style.background = 'rgba(26, 26, 26, 0.95)';
        UniversalLoader.customize({
            brandText: 'MyApp',
            colors: ['#3b82f6', '#06d6a0', '#ffd166']
        });
    }
}
```

## ⚡ Best Practices

### ✅ Do's

1. **Always use try/finally blocks**
```javascript
try {
    UniversalLoader.show('Loading...');
    await someAsyncOperation();
} finally {
    UniversalLoader.hide(); // Always hide, even on error
}
```

2. **Use meaningful loading messages**
```javascript
UniversalLoader.show('Saving your profile...'); // Good
UniversalLoader.show('Loading...'); // Generic, but okay
UniversalLoader.show(); // Uses default, acceptable
```

3. **Use withLoader for async operations**
```javascript
// Preferred - automatic show/hide
const data = await UniversalLoader.withLoader(
    () => fetch('/api/data'),
    'Fetching data...'
);

// Manual - more control but more error-prone
UniversalLoader.show('Fetching data...');
try {
    const data = await fetch('/api/data');
} finally {
    UniversalLoader.hide();
}
```

4. **Customize for your brand**
```javascript
// Set up once in your main script
UniversalLoader.customize({
    brandText: 'YourApp',
    colors: ['#your-primary', '#your-secondary', '#your-accent']
});
```

### ❌ Don'ts

1. **Don't forget to hide the loader**
```javascript
// Bad - loader never hides if error occurs
UniversalLoader.show();
await riskyOperation(); // If this fails, loader stays visible
UniversalLoader.hide(); // This never runs
```

2. **Don't show multiple loaders simultaneously**
```javascript
// Bad - confusing behavior
UniversalLoader.show('Loading A...');
UniversalLoader.show('Loading B...'); // Overwrites previous message

// Good - use sequential or descriptive messages
UniversalLoader.show('Loading A...');
await loadA();
UniversalLoader.show('Loading B...');
await loadB();
UniversalLoader.hide();
```

3. **Don't use for very short operations**
```javascript
// Bad - loader flashes briefly
UniversalLoader.show();
setTimeout(() => UniversalLoader.hide(), 100); // Too short

// Good - use for operations that take at least 500ms
UniversalLoader.show();
await meaningfulAsyncOperation(); // Takes reasonable time
UniversalLoader.hide();
```

## 🐛 Troubleshooting

### Common Issues

#### Loader not showing
```javascript
// Check if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        UniversalLoader.show('Loading...');
    });
} else {
    UniversalLoader.show('Loading...');
}
```

#### Loader not hiding
```javascript
// Always use try/finally
try {
    UniversalLoader.show('Processing...');
    // Your code here
} catch (error) {
    console.error(error);
} finally {
    UniversalLoader.hide(); // This always runs
}
```

#### Module import errors
```javascript
// Make sure file path is correct
import UniversalLoader from './js/universal-loader.js'; // Correct path

// Or use absolute path from root
import UniversalLoader from '/js/universal-loader.js';
```

#### Styling conflicts
```javascript
// Initialize manually if auto-init fails
UniversalLoader.init();

// Check if styles are injected
const styleSheets = Array.from(document.styleSheets);
const hasLoaderStyles = styleSheets.some(sheet => 
    sheet.href && sheet.href.includes('universal-loader')
);

if (!hasLoaderStyles) {
    console.log('Loader styles not found, reinitializing...');
    UniversalLoader.init();
}
```

### Debug Mode
```javascript
// Add debug logging
class DebugUniversalLoader {
    static show(message) {
        console.log('🔄 Showing loader:', message);
        UniversalLoader.show(message);
    }

    static hide() {
        console.log('✅ Hiding loader');
        UniversalLoader.hide();
    }

    static async withLoader(fn, message) {
        console.log('🚀 Starting withLoader:', message);
        try {
            const result = await UniversalLoader.withLoader(fn, message);
            console.log('✅ withLoader completed successfully');
            return result;
        } catch (error) {
            console.log('❌ withLoader failed:', error);
            throw error;
        }
    }
}
```

## 🔍 Advanced Usage

### Custom Animation Duration
```javascript
// Modify CSS custom properties after initialization
UniversalLoader.init();
const loader = document.getElementById('universalLoader');

// Faster animation
loader.style.setProperty('--animation-duration', '1.5s');

// Slower animation
loader.style.setProperty('--animation-duration', '4s');
```

### Multiple Loader Instances
```javascript
// Create a second loader with different styling
class CustomLoader extends UniversalLoader {
    static createLoader() {
        // Custom loader HTML with different ID
        const loaderHTML = `
            <div id="customLoader" class="universal-loader">
                <!-- Custom loader content -->
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loaderHTML);
        this.loader = document.getElementById('customLoader');
        this.loadingText = this.loader.querySelector('.loading-text');
    }
}
```

### Integration with Loading States
```javascript
class LoadingStateManager {
    static states = new Set();

    static addState(key, message) {
        this.states.add(key);
        UniversalLoader.show(message);
    }

    static removeState(key) {
        this.states.delete(key);
        if (this.states.size === 0) {
            UniversalLoader.hide();
        }
    }

    static clear() {
        this.states.clear();
        UniversalLoader.hide();
    }
}

// Usage
LoadingStateManager.addState('users', 'Loading users...');
LoadingStateManager.addState('posts', 'Loading posts...');

// Later...
LoadingStateManager.removeState('users'); // Loader still showing
LoadingStateManager.removeState('posts'); // Loader hides now
```

### Performance Monitoring
```javascript
class PerformanceLoader {
    static async withLoader(fn, message) {
        const startTime = performance.now();
        
        return await UniversalLoader.withLoader(
            async () => {
                const result = await fn();
                const endTime = performance.now();
                console.log(`⏱️ ${message} took ${endTime - startTime}ms`);
                return result;
            },
            message
        );
    }
}

// Usage
const data = await PerformanceLoader.withLoader(
    () => fetch('/api/data'),
    'Loading data'
); // Logs execution time
```

---

## 📝 Summary

The Universal Loader provides a beautiful, animated loading experience that can be integrated into any web application with minimal effort. Whether you're building a simple static site or a complex SPA, the loader adapts to your needs with its flexible API and customization options.

**Key Benefits:**
- 🎨 Beautiful coin-stacking animation
- 🔧 Zero configuration required
- ⚡ Lightweight and fast
- 🌐 Universal compatibility
- 🎭 Fully customizable
- 💪 Robust error handling

**Perfect for:**
- Page loading screens
- API call indicators
- Form submission feedback
- Data fetching operations
- Navigation transitions
- Any async operation

Start using the Universal Loader today and give your users a premium loading experience! 🚀