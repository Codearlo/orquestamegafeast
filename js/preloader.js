// preloader.js - Script para precargar la imagen del logo antes de todo
// Este script debe colocarse lo más arriba posible en el head del documento

(function() {
    // Comenzar a precargar la imagen del logo inmediatamente
    var logoPreloader = new Image();
    
    // Guardar la imagen en el objeto window para acceso global
    window.preloadedLogo = {
        loaded: false,
        dataUrl: null,
        path: null
    };
    
    // Ruta a la imagen del logo
    var logoPath = 'img/logo.png';
    
    // Manejar la carga exitosa de la imagen
    logoPreloader.onload = function() {
        // Guardar la ruta original como fallback
        window.preloadedLogo.path = logoPreloader.src;
        window.preloadedLogo.loaded = true;
        
        // Convertir la imagen a Data URL para uso inmediato
        try {
            var canvas = document.createElement('canvas');
            canvas.width = logoPreloader.width;
            canvas.height = logoPreloader.height;
            
            var ctx = canvas.getContext('2d');
            ctx.drawImage(logoPreloader, 0, 0);
            
            // Guardar como Data URL
            window.preloadedLogo.dataUrl = canvas.toDataURL('image/png');
            
            // Disparar evento personalizado para notificar que el logo está listo
            var event = new CustomEvent('logoPreloaded');
            document.dispatchEvent(event);
            
            // Almacenar en sessionStorage para uso futuro
            try {
                sessionStorage.setItem('megafeast_logo_cache', window.preloadedLogo.dataUrl);
            } catch(e) {
                // Si falla sessionStorage, continuamos sin cachear
                console.log('Error al guardar en sessionStorage:', e);
            }
        } catch(e) {
            // Si falla la conversión a dataURL, usamos la imagen normal
            console.log('Error al convertir a dataURL:', e);
            window.preloadedLogo.loaded = true;
            window.preloadedLogo.path = logoPreloader.src;
            
            // Disparar evento aún así
            var event = new CustomEvent('logoPreloaded');
            document.dispatchEvent(event);
        }
    };
    
    // Manejar errores de carga
    logoPreloader.onerror = function() {
        // Marcar como no cargado, para que el loader use la ruta normal
        console.warn('No se pudo precargar el logo');
        window.preloadedLogo.loaded = false;
        window.preloadedLogo.path = logoPath;
        
        // Disparar evento de error
        var event = new CustomEvent('logoPreloadError');
        document.dispatchEvent(event);
    };
    
    // Intentar usar logo cacheado primero
    try {
        var cachedLogo = sessionStorage.getItem('megafeast_logo_cache');
        if (cachedLogo) {
            // Si ya tenemos el logo en caché, úsalo inmediatamente
            window.preloadedLogo.dataUrl = cachedLogo;
            window.preloadedLogo.loaded = true;
            window.preloadedLogo.path = logoPath;
            
            setTimeout(function() {
                var event = new CustomEvent('logoPreloaded');
                document.dispatchEvent(event);
            }, 10);
        } else {
            // Si no hay caché, cargar normalmente
            logoPreloader.src = logoPath;
        }
    } catch(e) {
        // Si falla sessionStorage, cargar normalmente
        console.log('Error al acceder a sessionStorage:', e);
        logoPreloader.src = logoPath;
    }
})();