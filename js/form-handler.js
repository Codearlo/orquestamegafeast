/**
 * MEGAFEAST ORQUESTA INTERNACIONAL
 * Manejador del formulario de contacto
 */

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Verificamos si estamos usando FormSubmit o procesamiento local
        const isUsingFormSubmit = contactForm.getAttribute('action') && 
                                 contactForm.getAttribute('action').includes('formsubmit.co');
        
        // Si no usamos FormSubmit, manejamos el envío nosotros
        if (!isUsingFormSubmit) {
            contactForm.addEventListener('submit', handleFormSubmit);
        } else {
            // Para FormSubmit, solo añadimos validación adicional
            contactForm.addEventListener('submit', function(e) {
                const nameInput = contactForm.querySelector('input[name="name"]');
                const emailInput = contactForm.querySelector('input[name="email"]');
                const subjectInput = contactForm.querySelector('input[name="subject"]');
                const messageInput = contactForm.querySelector('textarea[name="message"]');
                
                // Si la validación falla, detenemos el envío
                if (!validateForm(nameInput, emailInput, subjectInput, messageInput)) {
                    e.preventDefault();
                }
            });
        }
        
        // Añadir validación en tiempo real
        setupRealTimeValidation();
    }
});

/**
 * Maneja el envío del formulario de contacto
 * @param {Event} e - Evento de submit
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Obtener los elementos del formulario
    const form = e.target;
    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const subjectInput = form.querySelector('input[name="subject"]');
    const messageInput = form.querySelector('textarea[name="message"]');
    const submitButton = form.querySelector('.submit-button');
    
    // Validar campos (validación básica)
    if (!validateForm(nameInput, emailInput, subjectInput, messageInput)) {
        return;
    }
    
    // Cambiar estado del botón
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    
    // Preparar datos para enviar
    const formData = {
        name: nameInput.value,
        email: emailInput.value,
        subject: subjectInput.value,
        message: messageInput.value,
        date: new Date().toISOString()
    };
    
    // Enviar utilizando Fetch API (simulado)
    sendFormData(formData)
        .then(response => {
            // Éxito
            form.reset();
            showNotification('success', '¡Mensaje enviado! Nos pondremos en contacto contigo pronto.');
        })
        .catch(error => {
            // Error
            console.error('Error al enviar formulario:', error);
            showNotification('error', 'Hubo un problema al enviar tu mensaje. Por favor, intenta de nuevo más tarde.');
        })
        .finally(() => {
            // Restaurar botón
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        });
}

/**
 * Configura la validación en tiempo real
 */
function setupRealTimeValidation() {
    const contactForm = document.getElementById('contactForm');
    
    // Validar campos al perder el foco
    const inputs = contactForm.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });
}

/**
 * Valida un campo específico
 * @param {HTMLElement} input - El campo a validar
 * @returns {boolean} - Indica si el campo es válido
 */
function validateInput(input) {
    let isValid = true;
    let errorMessage = '';
    
    // Valor vacío
    if (!input.value.trim()) {
        isValid = false;
        errorMessage = 'Este campo es obligatorio';
    } 
    // Email
    else if (input.type === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(input.value)) {
            isValid = false;
            errorMessage = 'Por favor, ingresa un email válido';
        }
    } 
    // Mensaje
    else if (input.tagName === 'TEXTAREA' && input.value.length < 10) {
        isValid = false;
        errorMessage = 'El mensaje debe tener al menos 10 caracteres';
    }
    
    if (isValid) {
        markValid(input);
    } else {
        markInvalid(input, errorMessage);
    }
    
    return isValid;
}

/**
 * Valida los campos del formulario
 * @returns {boolean} - Indica si el formulario es válido
 */
function validateForm(nameInput, emailInput, subjectInput, messageInput) {
    let isValid = true;
    
    // Validar nombre (no vacío)
    if (!validateInput(nameInput)) {
        isValid = false;
    }
    
    // Validar email (formato correcto)
    if (!validateInput(emailInput)) {
        isValid = false;
    }
    
    // Validar asunto (no vacío)
    if (!validateInput(subjectInput)) {
        isValid = false;
    }
    
    // Validar mensaje (no vacío y mínimo 10 caracteres)
    if (!validateInput(messageInput)) {
        isValid = false;
    }
    
    return isValid;
}

/**
 * Marca un campo como inválido
 */
function markInvalid(input, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    
    // Buscar o crear el mensaje de error
    let errorMessage = input.parentElement.querySelector('.error-message');
    
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        input.parentElement.appendChild(errorMessage);
    }
    
    errorMessage.textContent = message;
}

/**
 * Marca un campo como válido
 */
function markValid(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    
    // Eliminar mensaje de error si existe
    const errorMessage = input.parentElement.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

/**
 * Envía los datos del formulario al servidor
 * @param {Object} formData - Datos del formulario
 * @returns {Promise} - Promesa que se resuelve cuando se completa el envío
 */
function sendFormData(formData) {
    // Esta función simula el envío a un servidor real
    // En una implementación real, usarías fetch o XMLHttpRequest
    
    return new Promise((resolve, reject) => {
        // Simulación de la respuesta del servidor después de 1.5 segundos
        setTimeout(() => {
            // Simular éxito (90% de las veces)
            const success = Math.random() < 0.9;
            
            if (success) {
                // En lugar de enviar a un servidor, guardamos en localStorage para demostración
                saveContactToLocalStorage(formData);
                
                resolve({ 
                    success: true, 
                    message: 'Mensaje guardado correctamente'
                });
            } else {
                reject(new Error('Error simulado en el envío'));
            }
        }, 1500);
    });
}

/**
 * Muestra una notificación al usuario
 */
function showNotification(type, message) {
    // Buscar si ya existe una notificación
    let notification = document.querySelector('.form-notification');
    
    // Si no existe, crearla
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'form-notification';
        document.getElementById('contactForm').after(notification);
    }
    
    // Configurar la notificación
    notification.className = 'form-notification ' + type;
    notification.textContent = message;
    
    // Hacer visible
    notification.style.opacity = '1';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        
        // Remover después de la transición
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

/**
 * Guarda el mensaje de contacto en localStorage (demostración)
 */
function saveContactToLocalStorage(formData) {
    // Obtener mensajes existentes o crear un arreglo vacío
    const contacts = JSON.parse(localStorage.getItem('megafeast-contacts') || '[]');
    
    // Añadir nuevo mensaje
    contacts.push(formData);
    
    // Guardar en localStorage
    localStorage.setItem('megafeast-contacts', JSON.stringify(contacts));
    
    // Enviar a console para demostración
    console.log('Mensaje guardado:', formData);
}