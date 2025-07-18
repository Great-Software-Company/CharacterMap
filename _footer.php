  <!-- Settings Menu Overlay -->
  <div class="settings-menu-overlay"></div>
    <!-- Settings Menu (hidden by default) -->
    <div id="settings-menu" class="settings-menu">
        <div class="settings-menu-header">
            <span class="settings-menu-title">Settings</span>
            <button id="settings-menu-close" class="settings-menu-close" aria-label="Close">&times;</button>
        </div>
        <div class="settings-menu-content">
            <div class="settings-section">
                <div class="settings-section-title">Display for each symbol:</div>
                <label class="settings-switch-label">Numeric code
                    <input type="checkbox" class="settings-switch" id="toggle-numeric" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">Octal code
                    <input type="checkbox" class="settings-switch" id="toggle-octal" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">Hex code
                    <input type="checkbox" class="settings-switch" id="toggle-hex" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">Description
                    <input type="checkbox" class="settings-switch" id="toggle-description" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">Unicode code point
                    <input type="checkbox" class="settings-switch" id="toggle-unicode" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">HTML code
                    <input type="checkbox" class="settings-switch" id="toggle-html" checked>
                    <span class="settings-slider"></span>
                </label>
            </div>
            <div class="settings-section">
                <div class="settings-section-title">Categories:</div>
                <label class="settings-switch-label">ASCII Table
                    <input type="checkbox" class="settings-switch" id="cat-ascii" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">Letters
                    <input type="checkbox" class="settings-switch" id="cat-letters" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">Punctuation
                    <input type="checkbox" class="settings-switch" id="cat-punctuation" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">Numbers
                    <input type="checkbox" class="settings-switch" id="cat-numbers" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">Math
                    <input type="checkbox" class="settings-switch" id="cat-math" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">Currency
                    <input type="checkbox" class="settings-switch" id="cat-currency" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">Symbols
                    <input type="checkbox" class="settings-switch" id="cat-symbols" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">Arrows
                    <input type="checkbox" class="settings-switch" id="cat-arrows" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">Emojis
                    <input type="checkbox" class="settings-switch" id="cat-emojis" checked>
                    <span class="settings-slider"></span>
                </label>
                <label class="settings-switch-label">Hearts
                    <input type="checkbox" class="settings-switch" id="cat-hearts" checked>
                    <span class="settings-slider"></span>
                </label>
            </div>
                 <div class="settings-section">
                <div class="settings-section-title">Settings:</div>
                
                <label class="settings-switch-label">Hide non-printable characters
                    <input type="checkbox" class="settings-switch" id="toggle-printable" checked>
                    <span class="settings-slider"></span>
                </label>
                <div class="settings-row">
                    <span>Appearance:</span>
                    <span class="settings-row-right toggle-container">
                    <label class="toggle-switch" for="switch">
                <input id="switch" class="input" type="checkbox">
                <span class="icon-toggle icon--moon">
                    <?php echo isset($moon_icon) ? $moon_icon : ''; ?>
                </span>
                <span class="w-8 icon-toggle icon--sun">
                    <?php echo isset($sun_icon) ? $sun_icon : ''; ?>
                </span>
            </label>
                    </span>
                </div>
            </div>
        </div>
    </div>
    
    <footer class="footer text-center py-2">
        <small>
            CharacterMap.org - Copyright 2025
            <a href="https://greatsoftwarecompany.com/" target="_blank">Great Software Company<?=$outside_link_icon?></a> -
            <a href="/terms">Privacy Policy and Terms of Service</a>
        </small>
    </footer>

        <!-- Bootstrap JS and dependencies -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/theme.js"></script>
    <script src="assets/js/charactermap.js"></script>