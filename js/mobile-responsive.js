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
        
        // Recalculate table scroll indicators
        initTableScrollIndicators();
        
        // Fix any overflow issues
        fixOverflowIssues();
    });
    
    // Initialize table scroll indicators
    initTableScrollIndicators();
    
    // Make tooltips more mobile-friendly
    enhanceTooltipsForMobile();
    
    // Add larger touch targets where needed
    addTouchTargets();
    
    // Fix layout issues on mobile
    fixOverflowIssues();
    
    console.log('Mobile enhancements initialized');
}

/**
 * Fix any overflow issues that might cause "wavery" appearance
 */
function fixOverflowIssues() {
    if (window.innerWidth <= 768) {
        // Fix horizontal overflow issues
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            // Ensure card content doesn't cause overflow
            const overflowElements = card.querySelectorAll('table, img, div, .overflow-auto');
            overflowElements.forEach(el => {
                if (el.scrollWidth > card.clientWidth) {
                    el.style.maxWidth = '100%';
                    el.style.boxSizing = 'border-box';
                }
            });
        });
        
        // Ensure the grid layout works correctly
        const grid = document.querySelector('.grid');
        if (grid) {
            // Force single column for mobile
            grid.style.gridTemplateColumns = '1fr';
        }
        
        // Fix any space-between elements
        const spaceBetweens = document.querySelectorAll('.space-between');
        spaceBetweens.forEach(sb => {
            sb.style.flexDirection = 'column';
        });
    }
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
        
        // Add touch horizontal scroll for better mobile experience
        let touchStartX = 0;
        let touchEndX = 0;
        
        container.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
        }, false);
        
        container.addEventListener('touchmove', function(e) {
            touchEndX = e.touches[0].clientX;
            const diffX = touchStartX - touchEndX;
            container.scrollLeft += diffX * 0.5; // Smoother scrolling
            touchStartX = touchEndX;
        }, false);
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
        
        // Better handling for touch events
        tooltipIcon.addEventListener('touchstart', function(e) {
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
        }, { passive: false });
    });
    
    // Close tooltips when clicking elsewhere
    document.addEventListener('click', function() {
        document.querySelectorAll('.tooltip-active').forEach(t => {
            t.classList.remove('tooltip-active');
        });
    });
    
    document.addEventListener('touchstart', function() {
        document.querySelectorAll('.tooltip-active').forEach(t => {
            t.classList.remove('tooltip-active');
        });
    }, { passive: true });
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
    
    // Fix the tooltip icons for better touch
    const tooltipIcons = document.querySelectorAll('.tooltip-icon');
    tooltipIcons.forEach(icon => {
        if (!icon.classList.contains('touch-target')) {
            icon.classList.add('touch-target');
        }
    });
}

// Call on window load and resize events
window.addEventListener('load', fixOverflowIssues);
window.addEventListener('resize', fixOverflowIssues);

// Export functions for global use
window.initMobileEnhancements = initMobileEnhancements;
window.initTableScrollIndicators = initTableScrollIndicators;
window.enhanceTooltipsForMobile = enhanceTooltipsForMobile;
window.fixOverflowIssues = fixOverflowIssues; 