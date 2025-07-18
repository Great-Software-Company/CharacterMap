// assets/js/charactermap.js

let allChars = [];
let isDataLoaded = false;

// 2. State for toggles (default: all true)
let toggleState = {
    N: true, O: true, X: true, D: true, U: true, H: true, P: true // P is now true by default
};

let currentSection = 'ascii';
let currentSearch = '';

const SEARCH_DEBOUNCE_MS = 200;
const MAX_RESULTS = 300;
let searchTimeout = null;

let shownCount = MAX_RESULTS;
let lastSection = '';
let lastSearch = '';

// --- Cookie helpers ---
// [Old getToggleCookie/setToggleCookie removed]

// --- Section rendering ---
function getSectionForChar(c) {
    if (typeof c.Ascii === 'number' && c.Ascii >= 0 && c.Ascii <= 255) return 'ascii';
    if (Array.isArray(c.Keywords) && c.Keywords.includes('letter')) return 'letters';
    if (Array.isArray(c.Keywords) && c.Keywords.includes('punctuation')) return 'punctuation';
    if (Array.isArray(c.Keywords) && c.Keywords.includes('number')) return 'numbers';
    if (Array.isArray(c.Keywords) && c.Keywords.includes('math')) return 'math';
    if (Array.isArray(c.Keywords) && c.Keywords.includes('currency')) return 'currency';
    if (Array.isArray(c.Keywords) && c.Keywords.includes('symbol')) return 'symbols';
    if (Array.isArray(c.Keywords) && c.Keywords.includes('arrow')) return 'arrows';
    if (Array.isArray(c.Keywords) && c.Keywords.includes('emoji')) return 'emojis';
    if (Array.isArray(c.Keywords) && c.Keywords.includes('hearts')) return 'hearts';
    return null;
}

function getCardCopyText(data) {
    let lines = [];
    const ascii = data.Ascii;
    const code = ascii !== null && ascii !== undefined ? ascii : null;
    const hex = code !== null ? code.toString(16).toUpperCase() : '';
    const oct = code !== null ? code.toString(8) : '';
    const ucode = data.Code || '';
    const name = data.Name || '';
    const entity = data.Entity;
    const symbol = data.Symbol || '';
    const printable = symbol && symbol.trim() !== '';
    lines.push(symbol || '');
    if (toggleState.N && code !== null) lines.push(`N: ${code}`);
    if (toggleState.O && code !== null) lines.push(`O: ${oct}`);
    if (toggleState.X && code !== null) lines.push(`X: ${hex}`);
    if (toggleState.D) lines.push(`D: ${name}`);
    if (toggleState.U) lines.push(`U: ${ucode}`);
    if (toggleState.H) {
        let htmlCode = '';
        if (entity) {
            htmlCode = entity;
        } else if (code !== null) {
            htmlCode = `&#${code};`;
        } else if (ucode) {
            htmlCode = `&#x${ucode.replace('U+','')};`;
        }
        lines.push(`H: ${htmlCode}`);
    }
    return lines.join('\n');
}

function showCopiedMessage() {
    const msg = $('#copied-message');
    msg.text('Copied to clipboard').removeClass('d-none').addClass('show');
    clearTimeout(msg.data('timeout'));
    const timeout = setTimeout(() => {
        msg.removeClass('show').addClass('d-none');
    }, 1500);
    msg.data('timeout', timeout);
}

// --- Info banner logic ---
function setInfoBannerCookie() {
    document.cookie = 'hideInfoBanner=1;path=/;max-age=31536000';
}
function getInfoBannerCookie() {
    return document.cookie.indexOf('hideInfoBanner=1') !== -1;
}
function showInfoBanner() {
    if (getInfoBannerCookie()) return;
    if ($('#info-banner').length) return;
    var banner = $('<div id="info-banner" class="info-banner">Click any symbol to copy it to the clipboard. Use the settings to adjust the view. <a href="#static-info" id="read-more-link" class="info-banner-link">Read more …</a></div>');
    // Insert after #main-topbar (navbar), before #char-grid
    var $nav = $('#main-topbar');
    if ($nav.length) {
        $nav.after(banner);
    } else {
        $('#char-grid').before(banner);
    }
    $('#read-more-link, #info-banner').on('click', function(e) {
        e.preventDefault();
        setInfoBannerCookie();
        $('#info-banner').slideUp(200, function() { $(this).remove(); adjustContentTopMargin(); });
        var info = document.getElementById('static-info');
        if (info) {
            info.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    adjustContentTopMargin();
}

function renderSection(section, options = {}) {
    currentSection = section;
    // Reset shownCount if section or search changes
    if (lastSection !== section || lastSearch !== currentSearch) {
        shownCount = MAX_RESULTS;
        lastSection = section;
        lastSearch = currentSearch;
    }
    // Highlight active tab only if no search
    if (currentSearch.trim() === '') {
        $('#main-nav .nav-link, #mobile-main-nav .nav-link').removeClass('active');
        $(`#main-nav .nav-link[data-section='${section}'], #mobile-main-nav .nav-link[data-section='${section}']`).addClass('active');
    } else {
        $('#main-nav .nav-link, #mobile-main-nav .nav-link').removeClass('active');
    }
    // Render content for section
    if (!isDataLoaded) {
        $('#char-grid').html('<div class="text-center text-muted py-5">Loading data...</div>');
        $('#char-grid-controls').empty();
        return;
    }
    let filtered = [];
    if (currentSearch.trim() !== '') {
        const term = currentSearch.trim().toLowerCase();
        // Check for number range pattern (e.g., 0-100)
        const rangeMatch = term.match(/^\s*(\d+)\s*[-–—]\s*(\d+)\s*$/); // supports -, –, —
        if (rangeMatch) {
            const num1 = parseInt(rangeMatch[1], 10);
            const num2 = parseInt(rangeMatch[2], 10);
            if (num1 < num2) {
                filtered = allChars.filter(c => typeof c.Ascii === 'number' && c.Ascii >= num1 && c.Ascii <= num2);
            } else {
                // If not a valid range, fallback to normal search
                filtered = allChars.filter(c => {
                    const name = (c.Name || '').toLowerCase();
                    const code = (c.Code || '').toLowerCase();
                    const ascii = c.Ascii !== null && c.Ascii !== undefined ? String(c.Ascii) : '';
                    const entity = (c.Entity || '').toLowerCase();
                    const keywords = (c.Keywords || []).join(' ').toLowerCase();
                    const symbol = (c.Symbol || '').toLowerCase();
                    return (
                        name.includes(term) ||
                        code.includes(term) ||
                        ascii.includes(term) ||
                        entity.includes(term) ||
                        keywords.includes(term) ||
                        symbol.includes(term)
                    );
                });
            }
        } else {
            filtered = allChars.filter(c => {
                const name = (c.Name || '').toLowerCase();
                const code = (c.Code || '').toLowerCase();
                const ascii = c.Ascii !== null && c.Ascii !== undefined ? String(c.Ascii) : '';
                const entity = (c.Entity || '').toLowerCase();
                const keywords = (c.Keywords || []).join(' ').toLowerCase();
                const symbol = (c.Symbol || '').toLowerCase();
                return (
                    name.includes(term) ||
                    code.includes(term) ||
                    ascii.includes(term) ||
                    entity.includes(term) ||
                    keywords.includes(term) ||
                    symbol.includes(term)
                );
            });
        }
    } else if (section === 'ascii') {
        filtered = allChars.filter(c => typeof c.Ascii === 'number' && c.Ascii >= 0 && c.Ascii <= 255);
    } else if (section === 'letters') {
        filtered = allChars.filter(c => Array.isArray(c.Keywords) && c.Keywords.includes('letter'));
    } else if (section === 'punctuation') {
        filtered = allChars.filter(c => Array.isArray(c.Keywords) && c.Keywords.includes('punctuation'));
    } else if (section === 'numbers') {
        filtered = allChars.filter(c => Array.isArray(c.Keywords) && c.Keywords.includes('number'));
    } else if (section === 'math') {
        filtered = allChars.filter(c => Array.isArray(c.Keywords) && c.Keywords.includes('math'));
    } else if (section === 'currency') {
        filtered = allChars.filter(c => Array.isArray(c.Keywords) && c.Keywords.includes('currency'));
    } else if (section === 'symbols') {
        filtered = allChars.filter(c => Array.isArray(c.Keywords) && c.Keywords.includes('symbol'));
    } else if (section === 'arrows') {
        filtered = allChars.filter(c => Array.isArray(c.Keywords) && c.Keywords.includes('arrows'));
    } else if (section === 'emojis') {
        filtered = allChars.filter(c => Array.isArray(c.Keywords) && c.Keywords.includes('emoji'));
    } else if (section === 'hearts') {
        filtered = allChars.filter(c => Array.isArray(c.Keywords) && c.Keywords.includes('hearts'));
    } else {
        $('#char-grid').html('<div class="text-center text-muted py-5">Section not implemented yet.</div>');
        $('#char-grid-controls').empty();
        return;
    }
    // After filtering, apply printable filter if P is on
    // Remove duplicates by Ascii (ord value) and sort ascending
    const seen = new Set();
    filtered = filtered.filter(c => {
        if (typeof c.Ascii !== 'number') return true;
        if (seen.has(c.Ascii)) return false;
        seen.add(c.Ascii);
        return true;
    });
    // Printable filter
    if (toggleState.P) {
        filtered = filtered.filter(c => {
            // ASCII: code 0-31 or empty symbol is not printable
            if (typeof c.Ascii === 'number' && c.Ascii >= 0 && c.Ascii <= 31) return false;
            if (!c.Symbol || !c.Symbol.trim()) return false;
            return true;
        });
    }
    filtered.sort((a, b) => {
        if (typeof a.Ascii === 'number' && typeof b.Ascii === 'number') {
            return a.Ascii - b.Ascii;
        }
        return 0;
    });
    renderCharGrid(filtered, currentSearch, shownCount);
    // Show info banner if not hidden and only on main grid pages, and only on home page
    if ((window.location.pathname === '/' || window.location.pathname === '/index.php') && ["ascii","letters","punctuation","numbers","math","currency","symbols","arrows","emojis","hearts"].includes(section)) {
        showInfoBanner();
    }
    // Load More button and info message in controls
    $('#char-grid-controls').empty();
    if (filtered.length > shownCount) {
        $('#char-grid-controls').append(
            `<button id="load-more-btn" class="btn btn-outline-primary mb-3">Load More</button>`
        );
        $('#load-more-btn').off('click').on('click', function() {
            shownCount += MAX_RESULTS;
            renderCharGrid(filtered, currentSearch, shownCount);
            renderSection(currentSection, { skipScroll: true }); // re-render controls, don't scroll
        });
    }
    if (filtered.length > shownCount) {
        $('#char-grid-controls').append(
            `<div class="text-muted mb-5">Showing first ${shownCount} of ${filtered.length} results. Please refine your search or load more.</div>`
        );
    } else if (filtered.length > 0 && filtered.length <= shownCount && filtered.length > MAX_RESULTS) {
        $('#char-grid-controls').append(
            `<div class="text-muted mb-3">Showing all ${filtered.length} results.</div>`
        );
    }
    // Scroll to top after rendering a new section, unless skipScroll is true
    if (!options.skipScroll) {
        window.scrollTo(0, 0);
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Utility: ucfirstLower (like PHP's ucfirst(strtolower()))
function ucfirstLower(str) {
    if (!str) return '';
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderCharGrid(dataArr, searchTerm, limit) {
    const grid = $('#char-grid');
    // Only clear grid if not ASCII Table
    const isAsciiSection = currentSection === 'ascii' && currentSearch.trim() === '';
    const isPrintable = toggleState.P && isAsciiSection;
    if (!isAsciiSection || isPrintable) grid.empty();
    const highlight = (text, term) => {
        if (!term) return text;
        const re = new RegExp('('+term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')+')', 'ig');
        return text.replace(re, '$1');
    };
    let shown = 0;
    const max = limit || MAX_RESULTS;
    if (isAsciiSection && !isPrintable) {
        // If ASCII boxes are missing, re-insert them
        if (!document.getElementById('ascii-box-0')) {
            let asciiHtml = '';
            for (let i = 0; i < 256; i++) {
                asciiHtml += `<div class="col"><div class="card ascii-card text-center" id="ascii-box-${i}"><div class="card-body"><div class="skeleton-loader" style="height:3em;width:100%;background:#e9ecef;border-radius:0.5em;"></div></div></div></div>`;
            }
            grid.html(asciiHtml);
        }
        // Fill the 256 pre-rendered boxes
        dataArr.forEach((data, idx) => {
            if (shown >= max) return;
            const ascii = data.Ascii;
            if (typeof ascii !== 'number' || ascii < 0 || ascii > 255) return;
            const box = document.getElementById('ascii-box-' + ascii);
            if (!box) return;
            const body = box.querySelector('.card-body');
            if (!body) return;
            // Clear skeleton
            body.innerHTML = '';
            const code = ascii;
            const hex = code !== null ? code.toString(16).toUpperCase() : '';
            const oct = code !== null ? code.toString(8) : '';
            const ucode = data.Code || '';
            const name = data.Name || '';
            const entity = data.Entity;
            const symbol = data.Symbol || '';
            let charBox;
            if ((typeof ascii === 'number' && ascii >= 0 && ascii <= 31) || !symbol.trim()) {
                charBox = '&#9744;';
            } else {
                charBox = searchTerm ? highlight(symbol, searchTerm) : symbol;
            }
            if (!toggleState.N && !toggleState.O && !toggleState.X && !toggleState.D && !toggleState.U && !toggleState.H) {
                body.appendChild($("<div class='char-box only-symbol'>" + charBox + "</div>")[0]);
            } else {
                body.appendChild($("<div class='char-box'>" + charBox + "</div>")[0]);
            }
            if (toggleState.N && code !== null) body.appendChild($("<div class='info-row'><span class='info-label'>Num:</span><span class='info-value'>" + code + "</span></div>")[0]);
            if (toggleState.O && code !== null) body.appendChild($("<div class='info-row'><span class='info-label'>Oct:</span><span class='info-value'>" + oct + "</span></div>")[0]);
            if (toggleState.X && code !== null) body.appendChild($("<div class='info-row'><span class='info-label'>Hex:</span><span class='info-value'>" + hex + "</span></div>")[0]);
            if (toggleState.D) body.appendChild($("<div class='desc-row'>" + highlight(ucfirstLower(name), searchTerm) + "</div>")[0]);
            if (toggleState.U) body.appendChild($("<div class='info-row'><span class='info-label'>U:</span><span class='info-value'>" + highlight(ucode, searchTerm) + "</span></div>")[0]);
            if (toggleState.H) {
                let htmlCode = '';
                if (entity) {
                    htmlCode = entity;
                } else if (code !== null) {
                    htmlCode = `&#${code};`;
                } else if (ucode) {
                    htmlCode = `&#x${ucode.replace('U+','')};`;
                }
                body.appendChild($("<div class='info-row'><span class='info-label'>HTML:</span><span class='info-value'>" + escapeHtml(htmlCode) + "</span></div>")[0]);

            }
            // Click-to-copy handler (fix: attach directly to box)
            $(box).off('click keypress').on('click keypress', function(e) {
                if (e.type === 'click' || (e.type === 'keypress' && (e.key === 'Enter' || e.key === ' '))) {
                    const text = getCardCopyText(data);
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(text).then(showCopiedMessage);
                    } else {
                        const textarea = $('<textarea>').val(text).appendTo('body').select();
                        document.execCommand('copy');
                        textarea.remove();
                        showCopiedMessage();
                    }
                }
            });
            // Add title attribute if D toggle is off
            if (!toggleState.D) {
                $(box).find('.ascii-card').attr('title', ucfirstLower(name));
            }
            shown++;
        });
        return;
    }
    // If P is on in ASCII section, render only printable boxes (like other sections)
    if (isPrintable) {
        dataArr.forEach((data, idx) => {
            if (shown >= max) return;
            const ascii = data.Ascii;
            const code = ascii !== null && ascii !== undefined ? ascii : null;
            const hex = code !== null ? code.toString(16).toUpperCase() : '';
            const oct = code !== null ? code.toString(8) : '';
            const ucode = data.Code || '';
            const name = data.Name || '';
            const entity = data.Entity;
            const symbol = data.Symbol || '';
            let charBox;
            charBox = searchTerm ? highlight(symbol, searchTerm) : symbol;
            const box = $('<div class="col"><div class="card ascii-card text-center" tabindex="0"><div class="card-body"></div></div></div>');
            const body = box.find('.card-body');
            if (!toggleState.N && !toggleState.O && !toggleState.X && !toggleState.D && !toggleState.U && !toggleState.H) {
                body.append(`<div class="char-box only-symbol">${charBox}</div>`);
            } else {
                body.append(`<div class="char-box">${charBox}</div>`);
            }
            if (toggleState.N && code !== null) body.append(`<div class="info-row"><span class="info-label">Num:</span><span class="info-value">${code}</span></div>`);
            if (toggleState.O && code !== null) body.append(`<div class="info-row"><span class="info-label">Oct:</span><span class="info-value">${oct}</span></div>`);
            if (toggleState.X && code !== null) body.append(`<div class="info-row"><span class="info-label">Hex:</span><span class="info-value">${hex}</span></div>`);
            if (toggleState.D) body.append(`<div class="desc-row">${highlight(ucfirstLower(name), searchTerm)}</div>`);
            if (toggleState.U) body.append(`<div class="info-row"><span class="info-label">U:</span><span class="info-value">${highlight(ucode, searchTerm)}</span></div>`);
            if (toggleState.H) {
                let htmlCode = '';
                if (entity) {
                    htmlCode = entity;
                } else if (code !== null) {
                    htmlCode = `&#${code};`;
                } else if (ucode) {
                    htmlCode = `&#x${ucode.replace('U+','')};`;
                }
                body.append($("<div class='info-row'><span class='info-label'>HTML:</span><span class='info-value'>" + escapeHtml(htmlCode) + "</span></div>")[0]);

            }
            box.find('.ascii-card').on('click keypress', function(e) {
                if (e.type === 'click' || (e.type === 'keypress' && (e.key === 'Enter' || e.key === ' '))) {
                    const text = getCardCopyText(data);
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(text).then(showCopiedMessage);
                    } else {
                        const textarea = $('<textarea>').val(text).appendTo('body').select();
                        document.execCommand('copy');
                        textarea.remove();
                        showCopiedMessage();
                    }
                }
            });
            if (!toggleState.D) {
                box.attr('title', ucfirstLower(name));
            }
            grid.append(box);
            shown++;
        });
        return;
    }
    dataArr.forEach((data, idx) => {
        if (shown >= max) return;
        const ascii = data.Ascii;
        const code = ascii !== null && ascii !== undefined ? ascii : null;
        const hex = code !== null ? code.toString(16).toUpperCase() : '';
        const oct = code !== null ? code.toString(8) : '';
        const ucode = data.Code || '';
        const name = data.Name || '';
        const entity = data.Entity;
        const symbol = data.Symbol || '';
        // Show rectangle for ASCII 0-31 or if symbol is empty
        let charBox;
        if ((typeof ascii === 'number' && ascii >= 0 && ascii <= 31) || !symbol.trim()) {
            charBox = '&#9744;';
        } else {
            charBox = searchTerm ? highlight(symbol, searchTerm) : symbol;
        }
        const sectionLabel = currentSearch.trim() !== '' ? getSectionForChar(data) : null;
        const box = $('<div class="col"><div class="card ascii-card text-center" tabindex="0"><div class="card-body" ></div></div></div>');
        const body = box.find('.card-body');
        // Section label if searching
        // if (sectionLabel) body.append(`<div class="info-row" style="margin-bottom:0.5em"><span class="badge bg-secondary">${sectionLabel.charAt(0).toUpperCase() + sectionLabel.slice(1)}</span></div>`);
        // Character symbol
        if (!toggleState.N && !toggleState.O && !toggleState.X && !toggleState.D && !toggleState.U && !toggleState.H) {
            body.append(`<div class="char-box only-symbol">${charBox}</div>`);
        } else {
            body.append(`<div class="char-box">${charBox}</div>`);
        }
        // Info fields (to be toggled)
        if (toggleState.N && code !== null) body.append(`<div class="info-row"><span class="info-label">Num:</span><span class="info-value">${code}</span></div>`);
        if (toggleState.O && code !== null) body.append(`<div class="info-row"><span class="info-label">Oct:</span><span class="info-value">${oct}</span></div>`);
        if (toggleState.X && code !== null) body.append(`<div class="info-row"><span class="info-label">Hex:</span><span class="info-value">${hex}</span></div>`);
        if (toggleState.D) body.append(`<div class="desc-row">${highlight(ucfirstLower(name), searchTerm)}</div>`);
        if (toggleState.U) body.append(`<div class="info-row"><span class="info-label">U:</span><span class="info-value">${highlight(ucode, searchTerm)}</span></div>`);
        if (toggleState.H) {
            let htmlCode = '';
            if (entity && entity.match(/^&[a-zA-Z]+;/)) {
                let displayEntity = entity.replace(/^&amp;/, '&');
                htmlCode = searchTerm ? highlight(displayEntity, searchTerm) : displayEntity;
                if(searchTerm){
                body.append($("<div class='info-row'><span class='info-label'>HTML:</span><span class='info-value'>" + escapeHtml(htmlCode) + "</span></div>")[0]);
                }else{
                    body.append(
                        $('<div class="info-row"></div>')
                          .append($('<span class="info-label"></span>').text('HTML:'))
                          .append($('<span class="info-value"></span>').text(htmlCode))
                      );
                }
            } else if (code !== null) {
                htmlCode = `&#${code};`;
                body.append(`<div class="info-row"><span class="info-label">HTML:</span><span class="info-value">${escapeHtml(htmlCode)}</span></div>`);
            } else if (ucode) {
                // Try to extract the first codepoint from ucode (e.g., 'U+1F600')
                const match = ucode.match(/U\+([0-9A-Fa-f]+)/);
                if (match) {
                    htmlCode = `&#x${match[1]};`;
                    body.append(`<div class="info-row"><span class="info-label">HTML:</span><span class="info-value">${escapeHtml(htmlCode)}</span></div>`);
                } else {
                    body.append(`<div class="info-row"><span class="info-label">HTML:</span><span class="info-value"></span></div>`);
                }
            }
        }
        // Click-to-copy handler
        box.find('.ascii-card').on('click keypress', function(e) {
            if (e.type === 'click' || (e.type === 'keypress' && (e.key === 'Enter' || e.key === ' '))) {
                const text = getCardCopyText(data);
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(showCopiedMessage);
                } else {
                    // fallback for older browsers
                    const textarea = $('<textarea>').val(text).appendTo('body').select();
                    document.execCommand('copy');
                    textarea.remove();
                    showCopiedMessage();
                }
            }
        });
        if (!toggleState.D) {
            box.attr('title', ucfirstLower(name));
        }
        grid.append(box);
        shown++;
    });
}

// --- Section from hash ---
function getSectionFromHash() {
    const hash = window.location.hash;
    const match = hash.match(/^#([a-z]+)/i);
    if (match && match[1]) {
        const section = match[1].toLowerCase();
        const valid = ['ascii','letters','punctuation','numbers','math','currency','symbols','arrows','emojis','hearts'];
        if (valid.includes(section)) return section;
    }
    return 'ascii';
}

// --- Hide nav on scroll ---
(function() {
    let lastScrollY = window.scrollY;
    let ticking = false;
    function onScroll() {
        const currentY = window.scrollY;
        const navs = document.querySelectorAll('.nav-hide-on-scroll');
        if (currentY <= 0) {
            navs.forEach(el => el.classList.remove('nav-hidden'));
        } else if (currentY > lastScrollY) {
            // Scrolling down
            navs.forEach(el => el.classList.add('nav-hidden'));
        } else if (currentY < lastScrollY) {
            // Scrolling up (even by 1px)
            navs.forEach(el => el.classList.remove('nav-hidden'));
        }
        lastScrollY = currentY;
        ticking = false;
    }
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    });
})();

// Hamburger menu logic
$(document).ready(function() {
    var $hamburger = $('#hamburger-btn');
    var $mobileMenu = $('#mobile-menu');
    $hamburger.on('click', function(e) {
        e.stopPropagation();
        $hamburger.toggleClass('active');
        $mobileMenu.toggleClass('open');
    });
    // Close menu when clicking a link
    $mobileMenu.find('a').on('click', function() {
        $hamburger.removeClass('active');
        $mobileMenu.removeClass('open');
    });
    // Close menu when clicking outside
    $(document).on('click', function(e) {
        if ($mobileMenu.hasClass('open')) {
            if (!$(e.target).closest('#mobile-menu, #hamburger-btn').length) {
                $hamburger.removeClass('active');
                $mobileMenu.removeClass('open');
            }
        }
    });
});

// Settings menu open/close logic
$(function() {
    const $settingsBtn = $('#settings-btn');
    const $settingsMenu = $('#settings-menu');
    const $settingsClose = $('#settings-menu-close');
    const $settingsOverlay = $('.settings-menu-overlay');

    function openSettingsMenu() {
        $settingsMenu.addClass('open');
        $settingsOverlay.show();
    }
    function closeSettingsMenu() {
        $settingsMenu.removeClass('open');
        $settingsOverlay.hide();
    }

    $settingsBtn.on('click', function(e) {
        e.stopPropagation();
        openSettingsMenu();
    });
    $settingsClose.on('click', function() {
        closeSettingsMenu();
    });
    $settingsOverlay.on('click', function() {
        closeSettingsMenu();
    });
    // Prevent clicks inside the menu from closing it
    $settingsMenu.on('mousedown touchstart', function(e) {
        e.stopPropagation();
    });
});

// Settings menu toggles logic
$(function() {
    // Toggle keys and their corresponding elements
    const displayToggles = [
        { key: 'N', selector: '#toggle-numeric' },
        { key: 'O', selector: '#toggle-octal' },
        { key: 'X', selector: '#toggle-hex' },
        { key: 'D', selector: '#toggle-description' },
        { key: 'U', selector: '#toggle-unicode' },
        { key: 'H', selector: '#toggle-html' }
    ];
    const categoryToggles = [
        { key: 'ascii', selector: '#cat-ascii', nav: "[data-section='ascii']" },
        { key: 'letters', selector: '#cat-letters', nav: "[data-section='letters']" },
        { key: 'punctuation', selector: '#cat-punctuation', nav: "[data-section='punctuation']" },
        { key: 'numbers', selector: '#cat-numbers', nav: "[data-section='numbers']" },
        { key: 'math', selector: '#cat-math', nav: "[data-section='math']" },
        { key: 'currency', selector: '#cat-currency', nav: "[data-section='currency']" },
        { key: 'symbols', selector: '#cat-symbols', nav: "[data-section='symbols']" },
        { key: 'arrows', selector: '#cat-arrows', nav: "[data-section='arrows']" },
        { key: 'emojis', selector: '#cat-emojis', nav: "[data-section='emojis']" },
        { key: 'hearts', selector: '#cat-hearts', nav: "[data-section='hearts']" }
    ];
    const printableToggle = { key: 'P', selector: '#toggle-printable' };

    // Load from cookie
    function getSettingsCookie() {
        const match = document.cookie.match(/(?:^|; )charTogglesV2=([^;]*)/);
        if (match) {
            try { return JSON.parse(decodeURIComponent(match[1])); } catch (e) {}
        }
        return null;
    }
    function setSettingsCookie(state) {
        document.cookie = 'charTogglesV2=' + encodeURIComponent(JSON.stringify(state)) + ';path=/;max-age=31536000';
    }

    // Default state
    let settingsState = {
        N: true, O: true, X: true, D: true, U: true, H: true, P: true,
        ascii: true, letters: true, punctuation: true, numbers: true, math: true, currency: true, symbols: true, arrows: true, emojis: true, hearts: true
    };
    // Load saved state
    const saved = getSettingsCookie();
    if (saved) settingsState = Object.assign(settingsState, saved);
    // Sync to global toggleState for display toggles on load
    ['N','O','X','D','U','H','P'].forEach(k => { toggleState[k] = !!settingsState[k]; });

    // Sync toggles with state
    function syncTogglesUI() {
        displayToggles.forEach(t => $(t.selector).prop('checked', !!settingsState[t.key]));
        categoryToggles.forEach(t => $(t.selector).prop('checked', !!settingsState[t.key]));
        $(printableToggle.selector).prop('checked', !!settingsState.P);
        // Sync to global toggleState for display toggles
        ['N','O','X','D','U','H','P'].forEach(k => { toggleState[k] = !!settingsState[k]; });
    }
    syncTogglesUI();

    // Sync nav visibility
    function syncNavVisibility() {
        let visibleCount = 0;
        categoryToggles.forEach(t => {
            const show = !!settingsState[t.key];
            $(`#main-nav ${t.nav}, #mobile-main-nav ${t.nav}`).toggle(show);
            if (show) visibleCount++;
        });
        // Hide nav bar and hamburger if only one category is visible
        if (visibleCount <= 1) {
            $('#main-nav-container').hide();
            $('#mobile-menu').hide();
            $('#hamburger-btn').hide();
        } else {
            $('#main-nav-container').show();
            $('#mobile-menu').removeClass('open');
            $('#hamburger-btn').show();
        }
    }
    syncNavVisibility();

    // Ensure at least one category is always enabled
    function ensureOneCategory() {
        const anyOn = categoryToggles.some(t => settingsState[t.key]);
        if (!anyOn) {
            settingsState.ascii = true;
            $("#cat-ascii").prop('checked', true);
        }
    }

    // Handle category toggle change
    categoryToggles.forEach(t => {
        $(t.selector).on('change', function() {
            settingsState[t.key] = $(this).is(':checked');
            ensureOneCategory();
            setSettingsCookie(settingsState);
            syncNavVisibility();
            // If ASCII Table is off and we're on root, redirect to first visible
            if (!settingsState.ascii && (window.location.hash === '' || window.location.hash === '#ascii')) {
                const firstOn = categoryToggles.find(ct => settingsState[ct.key]);
                if (firstOn) window.location.hash = firstOn.key;
            }
        });
    });

    // Handle display toggles
    displayToggles.forEach(t => {
        $(t.selector).on('change', function() {
            settingsState[t.key] = $(this).is(':checked');
            // Sync to global toggleState
            toggleState[t.key] = settingsState[t.key];
            setSettingsCookie(settingsState);
            renderSection(currentSection);
        });
    });
    // Handle printable toggle
    $(printableToggle.selector).on('change', function() {
        settingsState.P = $(this).is(':checked');
        toggleState.P = settingsState.P;
        setSettingsCookie(settingsState);
        renderSection(currentSection);
    });

    // On load, if ASCII Table is off and we're on root, redirect
    if (!settingsState.ascii && (window.location.hash === '' || window.location.hash === '#ascii')) {
        const firstOn = categoryToggles.find(ct => settingsState[ct.key]);
        if (firstOn) window.location.hash = firstOn.key;
    }

    // Save state on unload
    window.addEventListener('beforeunload', function() {
        setSettingsCookie(settingsState);
    });
});

// Appearance (dark/light mode) switch logic
$(function() {
    const $appearanceSwitch = $('#appearance-switch');
    // Sync switch with current mode on load
    function syncAppearanceSwitch() {
        const isDark = $('body').hasClass('night-mode');
        $appearanceSwitch.prop('checked', isDark);
    }
    syncAppearanceSwitch();
    $appearanceSwitch.on('change', function() {
        const isDark = $(this).is(':checked');
        if (isDark) {
            $('body').addClass('night-mode');
            localStorage.setItem('darkMode', 'true');
        } else {
            $('body').removeClass('night-mode');
            localStorage.setItem('darkMode', 'false');
        }
    });
    // Also update switch if mode is changed elsewhere
    window.addEventListener('storage', function(e) {
        if (e.key === 'darkMode') syncAppearanceSwitch();
    });
});




// 4. On document ready, render grid and set up toggles/nav
$(function() {
    // Load unicode.json
    $.getJSON('assets/unicode.json', function(data) {
        allChars = data;
        isDataLoaded = true;
        // Render initial section
        const section = getSectionFromHash();
        renderSection(section);
    });

    // Nav tab click
    $('#main-nav, #mobile-main-nav').on('click', '.nav-link', function(e) {
        const section = $(this).data('section');
        // If not on home, go to /index.php#section
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.php') {
            window.location.href = '/index.php#' + section;
            return;
        }
        // If already on home, just update hash and prevent default
        e.preventDefault();
        window.location.hash = section;
        // Clear search box and state
        $('#char-search').val('');
        currentSearch = '';
    });

    // Listen for hash changes
    window.addEventListener('hashchange', function() {
        const section = getSectionFromHash();
        renderSection(section);
    });

    // Search input handler (debounced)
    $('#char-search').off('input').on('input', function() {
        clearTimeout(searchTimeout);
        currentSearch = $(this).val();
        searchTimeout = setTimeout(() => {
            renderSection(currentSection);
        }, SEARCH_DEBOUNCE_MS);
    });
    // Search on Enter or submit
    $('#char-search').off('keydown').on('keydown', function(e) {
        if (e.key === 'Enter') {
            const term = $(this).val();
            if (window.location.pathname !== '/' && window.location.pathname !== '/index.php') {
                window.location.href = '/index.php#search=' + encodeURIComponent(term);
                return;
            }
            // Already on home, just trigger search
            currentSearch = term;
            renderSection(currentSection);
        }
    });
    // On homepage, parse hash for search=...
    if (window.location.pathname === '/' || window.location.pathname === '/index.php') {
        const hash = window.location.hash;
        const searchMatch = hash.match(/^#search=(.*)$/);
        if (searchMatch) {
            const term = decodeURIComponent(searchMatch[1]);
            $('#char-search').val(term);
            currentSearch = term;
            renderSection(currentSection);
        }
    }
   
}); 
