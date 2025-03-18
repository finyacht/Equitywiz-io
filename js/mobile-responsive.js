// Mobile Responsiveness Enhancements

document.addEventListener('DOMContentLoaded', function() {
    initMobileEnhancements();
});

/**
 * Initialize mobile enhancements
 */
function initMobileEnhancements() {
    // Add mobile class to body if on mobile device
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-view');
    }
    
    // Listen for window resize to update mobile class
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    });
    
    // Initialize table scroll indicators
    initTableScrollIndicators();
    
    // Make tooltips more mobile-friendly
    enhanceTooltipsForMobile();
    
    // Add larger touch targets where needed
    addTouchTargets();
    
    console.log('Mobile enhancements initialized');
}

/**
 * Initialize table scroll indicators for mobile
 */
function initTableScrollIndicators() {
    const tableContainers = document.querySelectorAll('.overflow-auto');
    
    tableContainers.forEach(container => {
        // Only run this for tables inside the container
        const table = container.querySelector('table');
        if (!table) return;
        
        // Add scroll end detection
        container.addEventListener('scroll', function() {
            // Check if scrolled to the end
            const isScrolledToEnd = container.scrollLeft + container.clientWidth >= table.offsetWidth - 10;
            
            // Show/hide the indicator
            if (isScrolledToEnd) {
                container.classList.add('scrolled-to-end');
            } else {
                container.classList.remove('scrolled-to-end');
            }
        });
        
        // Initial check
        const isScrollable = table.offsetWidth > container.clientWidth;
        if (isScrollable) {
            container.classList.add('is-scrollable');
        } else {
            container.classList.add('not-scrollable');
        }
    });
}

/**
 * Enhance tooltips for mobile devices
 */
function enhanceTooltipsForMobile() {
    const tooltips = document.querySelectorAll('.tooltip');
    
    tooltips.forEach(tooltip => {
        const tooltipIcon = tooltip.querySelector('.tooltip-icon');
        const tooltipText = tooltip.querySelector('.tooltip-text');
        
        if (!tooltipIcon || !tooltipText) return;
        
        // Make tooltips tap-toggleable on mobile
        tooltipIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Remove active class from all tooltips
            document.querySelectorAll('.tooltip-active').forEach(t => {
                if (t !== tooltipText) {
                    t.classList.remove('tooltip-active');
                }
            });
            
            // Toggle active class on current tooltip
            tooltipText.classList.toggle('tooltip-active');
        });
    });
    
    // Close tooltips when clicking elsewhere
    document.addEventListener('click', function() {
        document.querySelectorAll('.tooltip-active').forEach(t => {
            t.classList.remove('tooltip-active');
        });
    });
}

/**
 * Add larger touch targets to small interactive elements
 */
function addTouchTargets() {
    // Find small interactive elements that need larger touch targets
    const smallButtons = document.querySelectorAll('button.delete');
    
    smallButtons.forEach(button => {
        if (!button.classList.contains('touch-target')) {
            button.classList.add('touch-target');
        }
    });
}

// Export functions for global use
window.initMobileEnhancements = initMobileEnhancements;
window.initTableScrollIndicators = initTableScrollIndicators;
window.enhanceTooltipsForMobile = enhanceTooltipsForMobile; 