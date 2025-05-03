// src/utils/WebGLContextManager.js
/**
 * WebGL Context Manager - Limits active WebGL contexts
 * 
 * Browsers typically limit the number of WebGL contexts that can be active
 * at one time (usually 8-16). This utility helps manage context creation
 * to prevent "Too many active WebGL contexts" errors.
 */

class WebGLContextManager {
    constructor() {
        this.activeRenderers = [];
        this.maxContexts = 4; // Keep this low to prevent browser issues
    }

    /**
     * Register a new THREE.WebGLRenderer
     * If too many contexts exist, the oldest ones will be disposed
     */
    registerRenderer(renderer, priority = 0) {
        // Add new renderer with timestamp and priority
        this.activeRenderers.push({
            renderer,
            timestamp: Date.now(),
            priority, // Higher number = higher priority (less likely to be disposed)
            disposed: false
        });

        // Check if we need to dispose old renderers
        this.cleanup();

        return renderer;
    }

    /**
     * Manually dispose of a renderer
     */
    disposeRenderer(renderer) {
        const index = this.activeRenderers.findIndex(item => item.renderer === renderer);
        if (index !== -1) {
            // Mark as disposed
            this.activeRenderers[index].disposed = true;
            this.cleanup();
        }
    }

    /**
     * Clean up excess renderers
     */
    cleanup() {
        // Remove disposed renderers
        this.activeRenderers = this.activeRenderers.filter(item => !item.disposed);

        // If we have too many active contexts, dispose oldest low-priority ones
        if (this.activeRenderers.length > this.maxContexts) {
            // Sort by priority (highest first), then by timestamp (newest first)
            const sorted = [...this.activeRenderers].sort((a, b) => {
                if (a.priority !== b.priority) return b.priority - a.priority;
                return b.timestamp - a.timestamp;
            });

            // Keep the top 'maxContexts' renderers, dispose the rest
            for (let i = this.maxContexts; i < sorted.length; i++) {
                const item = sorted[i];
                if (!item.disposed) {
                    console.log('Disposing excess WebGL context to prevent browser limits');
                    try {
                        item.renderer.dispose();
                        item.disposed = true;
                    } catch (e) {
                        console.error('Error disposing renderer:', e);
                    }
                }
            }

            // Update the active renderers list
            this.activeRenderers = this.activeRenderers.filter(item => !item.disposed);
        }
    }
}

// Create singleton instance
const contextManager = new WebGLContextManager();
export default contextManager;