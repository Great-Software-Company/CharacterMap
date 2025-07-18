
restoreDarkMode();
initializeToggle();
function initializeToggle() {
    const toggles = document.querySelectorAll(".toggle-switch input[type='checkbox']");
    if (toggles.length === 0) return;

    toggles.forEach((toggle) => {
        toggle.addEventListener("change", function (e) {
            const isDark = e.target.checked;
            applyDarkMode(isDark);
            syncToggles(isDark, toggles);
        });
    });
}
function restoreDarkMode() {
    const savedDarkMode = localStorage.getItem("darkMode");
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let isDark;

    if (savedDarkMode === null) {

        isDark = systemPrefersDark;
    } else {

        isDark = savedDarkMode === "true";
    }

    applyDarkMode(isDark);


    const toggles = document.querySelectorAll(".toggle-switch input[type='checkbox']");
    if (toggles.length > 0) {
        syncToggles(isDark, toggles);
    }
}

function syncToggles(isDark, toggles) {
    // Loop through all toggles and set them to the same state
    toggles.forEach((toggle) => {
        toggle.checked = isDark;
    });
}
function applyDarkMode(isDark) {
    document.querySelector("body")?.classList.toggle("night-mode", isDark);
    localStorage.setItem("darkMode", isDark);
    // Update browser theme color
    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
        themeColor = document.createElement('meta');
        themeColor.name = "theme-color";
        document.head.appendChild(themeColor);
    }
    themeColor.content = isDark ? "#181c20" : "#ffffff";
}

// --- Dynamic top margin for content based on navbar height ---
function adjustContentTopMargin() {
    var nav = document.getElementById('main-topbar');
    if (!nav) return;
    var navHeight = nav.offsetHeight;
    var margin = navHeight + 16; // add a little extra space
    var infoBanner = document.getElementById('info-banner');
    if (infoBanner && infoBanner.offsetParent !== null) {
        // Info banner is visible: only it gets the margin, others get 0
        infoBanner.style.marginTop = margin + 'px';
        ['#char-grid', '#static-info', '.top-space'].forEach(function(sel) {
            var els = document.querySelectorAll(sel);
            els.forEach(function(el) {
                el.style.marginTop = '0px';
            });
        });
    } else {
        // No info banner: grid/static-info/top-space get the margin
        ['#char-grid', '#static-info', '.top-space'].forEach(function(sel) {
            var els = document.querySelectorAll(sel);
            els.forEach(function(el) {
                el.style.marginTop = margin + 'px';
            });
        });
    }
}

window.addEventListener('DOMContentLoaded', adjustContentTopMargin);
window.addEventListener('resize', adjustContentTopMargin);