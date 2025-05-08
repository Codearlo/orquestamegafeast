// preloader.js - Script que precarga efectivamente el logo
(function() {
    // Guardar la ruta del logo en el objeto window para acceso global
    window.preloadedLogo = {
        loaded: false,
        path: 'img/logo.png'
    };
    
    // Precargar la imagen del logo
    var logoPreloader = new Image();
    logoPreloader.onload = function() {
        window.preloadedLogo.loaded = true;
    };
    logoPreloader.src = window.preloadedLogo.path;
})();