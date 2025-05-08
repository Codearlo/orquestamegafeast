/**
 * MEGAFEAST ORQUESTA INTERNACIONAL
 * Control de caché agresivo con soporte para imágenes
 * 
 * Este script fuerza la recarga de recursos incluyendo imágenes en todos los dispositivos,
 * especialmente en móviles donde es difícil limpiar la caché manualmente.
 */

// Versión del sitio - INCREMENTAR ESTE NÚMERO CADA VEZ QUE SE HAGA UN CAMBIO IMPORTANTE
const SITE_VERSION = '1.1.0';

// Archivos a excluir del control de caché (loader y preloader)
const EXCLUDE_FILES = [
    'loader-inline.js',
    'preloader.js',
    'logo.png' // Excluir el logo usado por el loader
];

// Carpetas a excluir del control de caché
const EXCLUDE_FOLDERS = [
    // Por ejemplo, si tienes una carpeta específica para el loader
    // 'loader-assets/'
];

/**
 * Función de inicialización principal
 */
(function() {
    // Registrar cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', function() {
        // Comprobar versión y actuar en consecuencia
        checkVersionAndUpdate();
        
        // Aplicar versión a recursos existentes
        addVersionToAllResources();
        
        // Monitorear cambios en el DOM para aplicar a recursos nuevos
        setupMutationObserver();
        
        console.log('Control de caché activado - Versión: ' + SITE_VERSION);
    });
    
    // También ejecutamos algunos controles inmediatamente sin esperar al DOMContentLoaded
    // para manejar recursos que se cargan muy temprano
    earlyResourceControl();
})();

/**
 * Control inicial de recursos antes de DOMContentLoaded
 */
function earlyResourceControl() {
    // Agregar meta tags de control de caché de inmediato
    addCacheControlMetaTags();
    
    // Intentar modificar recursos ya cargados
    setTimeout(function() {
        addVersionToEarlyResources();
    }, 0);
}

/**
 * Comprueba si la versión ha cambiado y actualiza si es necesario
 */
function checkVersionAndUpdate() {
    try {
        // Obtener timestamp actual (para uso en URLs)
        const timestamp = new Date().getTime();
        
        // Comparar con versión almacenada
        const storedVersion = localStorage.getItem('megafeast-version');
        const storedTimestamp = localStorage.getItem('megafeast-timestamp');
        
        // Si es una nueva versión o ha pasado más de 1 hora desde la última verificación
        const forceCheck = !storedTimestamp || (timestamp - parseInt(storedTimestamp) > 3600000);
        
        if (!storedVersion || storedVersion !== SITE_VERSION || forceCheck) {
            console.log('Actualizando recursos a versión: ' + SITE_VERSION);
            
            // Actualizar versión y timestamp en almacenamiento
            localStorage.setItem('megafeast-version', SITE_VERSION);
            localStorage.setItem('megafeast-timestamp', timestamp.toString());
            
            // Forzar recarga de recursos
            reloadAllResources(timestamp);
            
            // Si la versión cambió y no es recarga de página, recargar completamente
            if (storedVersion && storedVersion !== SITE_VERSION && performance.navigation.type !== 1) {
                console.log('Detectada nueva versión, recargando página...');
                
                // Guardar un indicador para evitar bucles de recarga
                sessionStorage.setItem('megafeast-reloading', 'true');
                
                // Recargar después de un breve retraso
                setTimeout(function() {
                    window.location.reload(true);
                }, 100);
            }
        } else if (sessionStorage.getItem('megafeast-reloading')) {
            // Limpiar indicador de recarga
            sessionStorage.removeItem('megafeast-reloading');
            console.log('Página actualizada a versión: ' + SITE_VERSION);
        }
    } catch (e) {
        console.warn('Error en control de versiones:', e);
    }
}

/**
 * Añade meta tags para control de caché
 */
function addCacheControlMetaTags() {
    const metaTags = [
        { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
        { httpEquiv: 'Pragma', content: 'no-cache' },
        { httpEquiv: 'Expires', content: '0' }
    ];
    
    metaTags.forEach(meta => {
        let metaEl = document.createElement('meta');
        metaEl.httpEquiv = meta.httpEquiv;
        metaEl.content = meta.content;
        document.head.appendChild(metaEl);
    });
}

/**
 * Recarga todos los recursos con un parámetro de versión
 */
function reloadAllResources(timestamp) {
    // Intentar usar la API Cache moderna
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName.startsWith('megafeast')) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).catch(err => {
            console.warn('Error al limpiar caché:', err);
        });
    }
    
    // Archivos a recargar con mayor prioridad
    reloadStylesheets(timestamp);
    reloadScripts(timestamp);
    reloadImages(timestamp);
}

/**
 * Recarga hojas de estilo CSS
 */
function reloadStylesheets(timestamp) {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !shouldExcludeFile(href)) {
            const newHref = addVersionParam(href, timestamp || SITE_VERSION);
            
            // Crear un nuevo elemento en lugar de modificar el existente
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = newHref;
            
            // Reemplazar el enlace antiguo cuando el nuevo esté listo
            newLink.onload = function() {
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            };
            
            // Insertar el nuevo enlace
            if (link.parentNode) {
                link.parentNode.insertBefore(newLink, link.nextSibling);
            }
        }
    });
}

/**
 * Recarga scripts JavaScript
 */
function reloadScripts(timestamp) {
    document.querySelectorAll('script[src]').forEach(script => {
        const src = script.getAttribute('src');
        if (src && !shouldExcludeFile(src) && !src.includes('cdnjs.cloudflare') && !src.includes('googleapis')) {
            const newSrc = addVersionParam(src, timestamp || SITE_VERSION);
            
            // Crear un nuevo script
            const newScript = document.createElement('script');
            newScript.src = newSrc;
            if (script.async) newScript.async = true;
            if (script.defer) newScript.defer = true;
            
            // Insertar el nuevo script y eliminar el viejo
            if (script.parentNode) {
                script.parentNode.insertBefore(newScript, script);
                // Eliminamos el antiguo script con un pequeño retraso
                setTimeout(() => {
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                }, 100);
            }
        }
    });
}

/**
 * Recarga imágenes con control de versión
 */
function reloadImages(timestamp) {
    // Procesamos imágenes con src
    document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !shouldExcludeFile(src) && !src.includes('data:')) {
            // Solo recargar si no es una imagen de loader o excluida
            const newSrc = addVersionParam(src, timestamp || SITE_VERSION);
            
            // Para imágenes, aplicamos directamente al mismo elemento
            // ya que no tienen dependencias de carga como scripts o CSS
            img.setAttribute('src', newSrc);
        }
    });
    
    // Procesamos fondos con background-image
    document.querySelectorAll('[style*="background-image"]').forEach(el => {
        const style = el.getAttribute('style');
        if (style && style.includes('url(') && !style.includes('data:')) {
            // Extraer todas las URLs del estilo
            const urlPattern = /url\(['"]?([^'"]+)['"]?\)/g;
            let newStyle = style;
            let match;
            
            // Reemplazar todas las URLs con versiones actualizadas
            while ((match = urlPattern.exec(style)) !== null) {
                const url = match[1];
                if (!shouldExcludeFile(url)) {
                    const newUrl = addVersionParam(url, timestamp || SITE_VERSION);
                    newStyle = newStyle.replace(url, newUrl);
                }
            }
            
            // Aplicar el nuevo estilo
            if (newStyle !== style) {
                el.setAttribute('style', newStyle);
            }
        }
    });
}

/**
 * Aplica versión a todos los recursos en la página
 */
function addVersionToAllResources() {
    const timestamp = new Date().getTime();
    
    // Imágenes con src
    document.querySelectorAll('img').forEach(img => {
        if (img.src && !img.src.includes('data:') && !img.hasAttribute('data-no-cache')) {
            // Verificar si debe ser excluida
            if (!shouldExcludeFile(img.src)) {
                img.src = addVersionParam(img.src, timestamp);
            }
        }
    });
    
    // Fondos con background-image
    document.querySelectorAll('[style*="background-image"]').forEach(el => {
        const style = el.getAttribute('style');
        if (style && style.includes('url(') && !style.includes('data:')) {
            // Extraer la URL
            const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (match && match[1]) {
                const url = match[1];
                if (!shouldExcludeFile(url)) {
                    const newUrl = addVersionParam(url, timestamp);
                    const newStyle = style.replace(url, newUrl);
                    el.setAttribute('style', newStyle);
                }
            }
        }
    });
    
    // Videos y audios
    document.querySelectorAll('video source, audio source').forEach(source => {
        if (source.src && !shouldExcludeFile(source.src)) {
            source.src = addVersionParam(source.src, timestamp);
        }
    });
}

/**
 * Aplica versión a recursos cargados temprano
 */
function addVersionToEarlyResources() {
    const timestamp = new Date().getTime();
    
    // Hojas de estilo que ya están cargadas
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !shouldExcludeFile(href)) {
            link.href = addVersionParam(href, timestamp);
        }
    });
}

/**
 * Configura un observador de mutaciones para aplicar versión a nuevos recursos
 */
function setupMutationObserver() {
    // Crear un observador que vigile cambios en el DOM
    const observer = new MutationObserver(function(mutations) {
        let needsUpdate = false;
        
        mutations.forEach(function(mutation) {
            // Verificar si se agregaron nuevos nodos
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    // Verificar si es un elemento con src o href
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        if ((node.tagName === 'IMG' || node.tagName === 'SCRIPT' || 
                             node.tagName === 'LINK' || node.tagName === 'VIDEO' || 
                             node.tagName === 'AUDIO') && !shouldExcludeFile(node.src || node.href)) {
                            needsUpdate = true;
                        }
                        
                        // También verificar elementos con estilo inline
                        if (node.hasAttribute('style') && 
                            node.getAttribute('style').includes('background-image')) {
                            needsUpdate = true;
                        }
                    }
                });
            }
        });
        
        // Si se detectaron recursos nuevos, aplicar versión
        if (needsUpdate) {
            addVersionToAllResources();
        }
    });
    
    // Configurar el observador para vigilar todo el documento
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'href', 'style']
    });
}

/**
 * Agrega parámetro de versión a una URL
 */
function addVersionParam(url, version) {
    if (!url || url.includes('data:') || url.includes('blob:')) {
        return url;
    }
    
    // No modificar URLs externas
    if (url.includes('//') && !url.includes(window.location.hostname)) {
        return url;
    }
    
    // No modificar archivos excluidos
    if (shouldExcludeFile(url)) {
        return url;
    }
    
    // Eliminar parámetros de versión anteriores si existen
    url = url.replace(/([?&])(v|version|_v|t|timestamp)=([^&]*)/g, (match, prefix, key, value) => {
        return prefix === '?' ? '?' : '';
    });
    
    // Eliminar ? final si quedó solo después de remover parámetros
    url = url.replace(/\?$/, '');
    
    // Añadir nuevo parámetro de versión
    const separator = url.includes('?') ? '&' : '?';
    return url + separator + 'v=' + version;
}

/**
 * Determina si un archivo debe ser excluido del control de caché
 */
function shouldExcludeFile(url) {
    if (!url) return false;
    
    // 1. Verificar archivos específicos
    for (const excludeFile of EXCLUDE_FILES) {
        if (url.includes(excludeFile)) {
            return true;
        }
    }
    
    // 2. Verificar carpetas excluidas
    for (const excludeFolder of EXCLUDE_FOLDERS) {
        if (url.includes(excludeFolder)) {
            return true;
        }
    }
    
    // 3. Verificar si tiene atributo de no-caché
    const element = document.querySelector(`[src="${url}"], [href="${url}"]`);
    if (element && element.hasAttribute('data-no-cache')) {
        return true;
    }
    
    return false;
}