/* ============================================
   EITHAN SMITH FITNESS - SCRIPT PRINCIPAL
   ============================================
   Versión: 2.0
   Optimizado para: Performance, Mantenibilidad y SEO
   ============================================ */

'use strict';

/* ============================================
   CONFIGURACIÓN GLOBAL
   ============================================ */
const CONFIG = {
    // Navbar
    NAVBAR_SCROLL_THRESHOLD: 100,
    NAVBAR_OFFSET: 70,
    
    // Carrusel
    CAROUSEL_AUTO_PLAY_INTERVAL: 5000,
    CAROUSEL_TRANSITION_DELAY: 600,
    
    // Performance
    DEBOUNCE_DELAY: 250,
    THROTTLE_DELAY: 100,
    
    // EmailJS
    EMAILJS_SERVICE_ID: 'service_12wukyn',
    EMAILJS_USER_TEMPLATE_ID: 'template_8hmktot',
    EMAILJS_ADMIN_TEMPLATE_ID: 'template_dpth0s6',
    EMAILJS_ADMIN_EMAIL: 'indpagesweb@gmail.com',
    
    // Storage
    STORAGE_FORM_DRAFT: 'contactFormDraft',
    STORAGE_SUBMISSIONS: 'contactSubmissions',
    MAX_SUBMISSIONS: 50
};

/* ============================================
   UTILIDADES - Funciones Helper
   ============================================ */
const Utils = {
    /**
     * Debounce - Retrasa la ejecución de una función
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle - Limita la frecuencia de ejecución
     * @param {Function} func - Función a ejecutar
     * @param {number} limit - Límite en ms
     * @returns {Function}
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Smooth Scroll - Desplazamiento suave a elemento
     * @param {HTMLElement} element - Elemento objetivo
     * @param {number} offset - Offset superior
     */
    smoothScrollTo(element, offset = CONFIG.NAVBAR_OFFSET) {
        if (!element) return;
        const offsetTop = element.offsetTop - offset;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    },
    
    /**
     * Verificar si elemento es visible en viewport
     * @param {HTMLElement} element 
     * @returns {boolean}
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    /**
     * Log de debug (solo en desarrollo)
     * @param {string} message 
     * @param {any} data 
     */
    log(message, data = null) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log(`[Eithan Fitness] ${message}`, data || '');
        }
    },
    
    /**
     * Log de error
     * @param {string} message 
     * @param {Error} error 
     */
    error(message, error = null) {
        console.error(`[Eithan Fitness ERROR] ${message}`, error || '');
    }
};

/* ============================================
   MÓDULO: NAVBAR
   ============================================ */
const Navbar = {
    elements: {},
    state: {
        isMenuOpen: false,
        lastScrollY: 0
    },
    
    /**
     * Inicializar navbar
     */
    init() {
        this.cacheElements();
        if (!this.elements.navbar) {
            Utils.error('Navbar no encontrado');
            return;
        }
        this.bindEvents();
        Utils.log('✅ Navbar inicializado');
    },
    
    /**
     * Cachear elementos del DOM
     */
    cacheElements() {
        this.elements = {
            navbar: document.querySelector('.navbar'),
            hamburger: document.getElementById('hamburger'),
            navMenu: document.getElementById('navMenu'),
            navLinks: document.querySelectorAll('.nav-link'),
            ctaButtons: document.querySelectorAll('.btn-cta, .reserva_sesion')
        };
    },
    
    /**
     * Vincular eventos
     */
    bindEvents() {
        // Toggle hamburger
        if (this.elements.hamburger && this.elements.navMenu) {
            this.elements.hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });
        }
        
        // Cerrar menú al hacer clic en link
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (this.state.isMenuOpen && 
                this.elements.hamburger && 
                this.elements.navMenu &&
                !this.elements.hamburger.contains(e.target) && 
                !this.elements.navMenu.contains(e.target)) {
                this.closeMenu();
            }
        });
        
        // Scroll effects
        window.addEventListener('scroll', Utils.throttle(() => {
            this.handleScroll();
            this.highlightActiveLink();
        }, CONFIG.THROTTLE_DELAY));
        
        // Setup smooth scroll
        this.setupSmoothScroll();
        
        // Resize handler
        window.addEventListener('resize', Utils.debounce(() => {
            if (window.innerWidth > 768 && this.state.isMenuOpen) {
                this.closeMenu();
            }
        }, CONFIG.DEBOUNCE_DELAY));
        
        // CTA buttons
        this.elements.ctaButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const contactSection = document.getElementById('contacto');
                Utils.smoothScrollTo(contactSection);
            });
        });
    },
    
    /**
     * Toggle menú hamburguesa
     */
    toggleMenu() {
        this.state.isMenuOpen = !this.state.isMenuOpen;
        this.elements.hamburger.classList.toggle('active');
        this.elements.navMenu.classList.toggle('active');
        this.elements.hamburger.setAttribute('aria-expanded', this.state.isMenuOpen);
        document.body.style.overflow = this.state.isMenuOpen ? 'hidden' : 'auto';
    },
    
    /**
     * Cerrar menú
     */
    closeMenu() {
        this.state.isMenuOpen = false;
        this.elements.hamburger?.classList.remove('active');
        this.elements.navMenu?.classList.remove('active');
        this.elements.hamburger?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = 'auto';
    },
    
    /**
     * Manejar scroll del navbar
     */
    handleScroll() {
        const currentScroll = window.pageYOffset;
        
        // Agregar clase scrolled
        if (this.elements.navbar) {
            if (currentScroll > CONFIG.NAVBAR_SCROLL_THRESHOLD) {
                this.elements.navbar.classList.add('scrolled');
            } else {
                this.elements.navbar.classList.remove('scrolled');
            }
        }
        
        this.state.lastScrollY = currentScroll;
    },
    
    /**
     * Resaltar link activo según sección
     */
    highlightActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    },
    
    /**
     * Configurar smooth scroll para todos los links
     */
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetSection = document.querySelector(targetId);
                Utils.smoothScrollTo(targetSection);
            });
        });
    }
};

/* ============================================
   MÓDULO: CARRUSEL DE HISTORIAS
   ============================================ */
const HistoriasCarousel = {
    elements: {},
    state: {
        currentIndex: 0,
        isTransitioning: false,
        autoPlayInterval: null,
        touchStartX: 0,
        touchEndX: 0
    },
    
    /**
     * Inicializar carrusel
     */
    init() {
        this.cacheElements();
        
        if (!this.elements.track || !this.elements.cards.length) {
            Utils.log('⚠️ Carrusel de historias no encontrado');
            return;
        }
        
        this.bindEvents();
        this.updateCarousel(0, false);
        Utils.log('✅ Carrusel de historias inicializado');
    },
    
    /**
     * Cachear elementos del DOM
     */
    cacheElements() {
        this.elements = {
            track: document.getElementById('historiasTrack'),
            prevBtn: document.getElementById('historiasPriv'),
            nextBtn: document.getElementById('historiasNext'),
            indicators: document.querySelectorAll('#historiasIndicators .indicator'),
            cards: document.querySelectorAll('.historia_card')
        };
    },
    
    /**
     * Vincular eventos
     */
    bindEvents() {
        // Botones de navegación
        this.elements.prevBtn?.addEventListener('click', () => this.prev());
        this.elements.nextBtn?.addEventListener('click', () => this.next());
        
        // Indicadores
        this.elements.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Touch/swipe support
        this.setupTouchEvents();
        
        // Keyboard navigation
        this.setupKeyboardNav();
        
        // Resize
        window.addEventListener('resize', Utils.debounce(() => {
            this.updateCarousel(this.state.currentIndex, false);
        }, CONFIG.DEBOUNCE_DELAY));
    },
    
    /**
     * Configurar eventos táctiles
     */
    setupTouchEvents() {
        this.elements.track.addEventListener('touchstart', (e) => {
            this.state.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.elements.track.addEventListener('touchend', (e) => {
            this.state.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    },
    
    /**
     * Configurar navegación por teclado
     */
    setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
            } else if (e.key === 'ArrowRight') {
                this.next();
            }
        });
    },
    
    /**
     * Manejar gestos de swipe
     */
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.state.touchStartX - this.state.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            diff > 0 ? this.next() : this.prev();
        }
    },
    
    /**
     * Actualizar posición del carrusel
     * @param {number} index - Índice de la tarjeta
     * @param {boolean} smooth - Transición suave
     */
    updateCarousel(index, smooth = true) {
        if (this.state.isTransitioning) return;
        
        const totalCards = this.elements.cards.length;
        this.state.currentIndex = Math.max(0, Math.min(index, totalCards - 1));
        this.state.isTransitioning = true;
        
        // Calcular offset
        const firstCard = this.elements.cards[0];
        const cardWidth = firstCard.offsetWidth;
        const cardStyle = window.getComputedStyle(firstCard);
        const gap = parseFloat(cardStyle.marginRight) || 32;
        const offset = -(this.state.currentIndex * (cardWidth + gap));
        
        // Aplicar transformación
        this.elements.track.style.transition = smooth ? 
            `transform ${CONFIG.CAROUSEL_TRANSITION_DELAY}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none';
        this.elements.track.style.transform = `translateX(${offset}px)`;
        
        // Actualizar indicadores
        this.updateIndicators();
        
        // Liberar transición
        setTimeout(() => {
            this.state.isTransitioning = false;
        }, CONFIG.CAROUSEL_TRANSITION_DELAY);
    },
    
    /**
     * Actualizar estado de los indicadores
     */
    updateIndicators() {
        this.elements.indicators.forEach((indicator, i) => {
            const isActive = i === this.state.currentIndex;
            indicator.classList.toggle('active', isActive);
            indicator.setAttribute('aria-selected', isActive);
        });
    },
    
    /**
     * Navegar a siguiente slide
     */
    next() {
        const totalCards = this.elements.cards.length;
        const nextIndex = this.state.currentIndex >= totalCards - 1 ? 
            0 : this.state.currentIndex + 1;
        this.updateCarousel(nextIndex);
    },
    
    /**
     * Navegar a slide anterior
     */
    prev() {
        const totalCards = this.elements.cards.length;
        const prevIndex = this.state.currentIndex <= 0 ? 
            totalCards - 1 : this.state.currentIndex - 1;
        this.updateCarousel(prevIndex);
    },
    
    /**
     * Ir a slide específico
     * @param {number} index 
     */
    goToSlide(index) {
        this.updateCarousel(index);
    }
};

/* ============================================
   MÓDULO: FORMULARIO DE CONTACTO
   ============================================ */
const ContactForm = {
    elements: {},
    validators: {},
    state: {
        isSubmitting: false
    },
    
    /**
     * Inicializar formulario
     */
    init() {
        this.cacheElements();
        
        if (!this.elements.form) {
            Utils.log('⚠️ Formulario de contacto no encontrado');
            return;
        }
        
        this.setupValidators();
        this.bindEvents();
        this.loadSavedData();
        Utils.log('✅ Formulario de contacto inicializado');
    },
    
    /**
     * Cachear elementos del DOM
     */
    cacheElements() {
        this.elements = {
            form: document.getElementById('contactoForm'),
            successMessage: document.getElementById('successMessage'),
            newMessageBtn: document.getElementById('newMessageBtn'),
            submitBtn: document.getElementById('submitBtn'),
            resetBtn: document.getElementById('resetBtn'),
            btnText: document.getElementById('btnText'),
            inputs: {
                nombre: document.getElementById('nombre'),
                email: document.getElementById('email'),
                telefono: document.getElementById('telefono'),
                objetivo: document.getElementById('objetivo'),
                mensaje: document.getElementById('mensaje'),
                terminos: document.getElementById('terminos'),
                newsletter: document.getElementById('newsletter')
            },
            errors: {
                nombre: document.getElementById('nombre-error'),
                email: document.getElementById('email-error'),
                telefono: document.getElementById('telefono-error'),
                objetivo: document.getElementById('objetivo-error'),
                mensaje: document.getElementById('mensaje-error'),
                terminos: document.getElementById('terminos-error')
            },
            charCounter: document.getElementById('mensaje-counter')
        };
        
        // Obtener loader del botón
        if (this.elements.submitBtn) {
            this.elements.buttonLoader = this.elements.submitBtn.querySelector('.button_loader');
        }
    },
    
    /**
     * Configurar reglas de validación
     */
    setupValidators() {
        this.validators = {
            nombre: {
                required: true,
                minLength: 3,
                maxLength: 50,
                pattern: /^[a-záéíóúñü\s]+$/i,
                messages: {
                    required: 'El nombre es obligatorio',
                    minLength: 'El nombre debe tener al menos 3 caracteres',
                    maxLength: 'El nombre no puede exceder 50 caracteres',
                    pattern: 'El nombre solo puede contener letras y espacios'
                }
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                messages: {
                    required: 'El email es obligatorio',
                    pattern: 'Por favor, introduce un email válido'
                }
            },
            telefono: {
                required: false,
                pattern: /^[+]?[0-9\s\-()]+$/,
                minLength: 7,
                messages: {
                    pattern: 'Por favor, introduce un teléfono válido',
                    minLength: 'El teléfono debe tener al menos 7 dígitos'
                }
            },
            objetivo: {
                required: true,
                messages: {
                    required: 'Por favor, selecciona un objetivo'
                }
            },
            mensaje: {
                required: false,
                maxLength: 500,
                messages: {
                    maxLength: 'El mensaje no puede exceder 500 caracteres'
                }
            },
            terminos: {
                required: true,
                messages: {
                    required: 'Debes aceptar la política de privacidad'
                }
            }
        };
    },
    
    /**
     * Vincular eventos
     */
    bindEvents() {
        // Submit del formulario
        this.elements.form?.addEventListener('submit', (e) => {
            this.handleSubmit(e);
        });
        
        // Reset del formulario
        this.elements.resetBtn?.addEventListener('click', () => {
            this.resetForm();
        });
        
        // Nuevo mensaje
        this.elements.newMessageBtn?.addEventListener('click', () => {
            this.showForm();
        });
        
        // Validación en tiempo real
        Object.keys(this.elements.inputs).forEach(key => {
            const input = this.elements.inputs[key];
            if (!input) return;
            
            // Validar al perder el foco
            input.addEventListener('blur', () => {
                if (input.value) {
                    this.validateField(key);
                }
            });
            
            // Limpiar error al escribir
            input.addEventListener('input', () => {
                this.clearError(key);
                
                // Contador de caracteres para mensaje
                if (key === 'mensaje') {
                    this.updateCharCounter();
                }
            });
            
            // Auto-guardar en localStorage (debounced)
            input.addEventListener('input', Utils.debounce(() => {
                this.saveFormData();
            }, 500));
        });
    },
    
    /**
     * Validar campo individual
     * @param {string} fieldName - Nombre del campo
     * @returns {boolean} - Es válido
     */
    validateField(fieldName) {
        const input = this.elements.inputs[fieldName];
        const validator = this.validators[fieldName];
        const value = input?.type === 'checkbox' ? input?.checked : input?.value?.trim();
        
        if (!input || !validator) return true;
        
        // Validar required
        if (validator.required && !value) {
            this.showError(fieldName, validator.messages.required);
            return false;
        }
        
        // Si no es required y está vacío, es válido
        if (!validator.required && !value) {
            this.clearError(fieldName);
            return true;
        }
        
        // Validar minLength
        if (validator.minLength && value.length < validator.minLength) {
            this.showError(fieldName, validator.messages.minLength);
            return false;
        }
        
        // Validar maxLength
        if (validator.maxLength && value.length > validator.maxLength) {
            this.showError(fieldName, validator.messages.maxLength);
            return false;
        }
        
        // Validar pattern
        if (validator.pattern && !validator.pattern.test(value)) {
            this.showError(fieldName, validator.messages.pattern);
            return false;
        }
        
        // Campo válido
        this.clearError(fieldName);
        input.classList.add('success');
        return true;
    },
    
    /**
     * Validar formulario completo
     * @returns {boolean} - Es válido
     */
    validateForm() {
        let isValid = true;
        const fieldsToValidate = ['nombre', 'email', 'telefono', 'objetivo', 'mensaje', 'terminos'];
        
        fieldsToValidate.forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    /**
     * Mostrar error en campo
     * @param {string} fieldName - Nombre del campo
     * @param {string} message - Mensaje de error
     */
    showError(fieldName, message) {
        const input = this.elements.inputs[fieldName];
        const errorElement = this.elements.errors[fieldName];
        
        if (input && errorElement) {
            input.classList.add('error', 'shake');
            input.classList.remove('success');
            errorElement.textContent = message;
            
            // Remover animación shake
            setTimeout(() => {
                input.classList.remove('shake');
            }, 500);
        }
    },
    
    /**
     * Limpiar error de campo
     * @param {string} fieldName - Nombre del campo
     */
    clearError(fieldName) {
        const input = this.elements.inputs[fieldName];
        const errorElement = this.elements.errors[fieldName];
        
        if (input && errorElement) {
            input.classList.remove('error');
            errorElement.textContent = '';
        }
    },
    
    /**
     * Actualizar contador de caracteres
     */
    updateCharCounter() {
        const mensaje = this.elements.inputs.mensaje;
        const counter = this.elements.charCounter;
        
        if (mensaje && counter) {
            const length = mensaje.value.length;
            counter.textContent = `${length} / 500`;
            
            if (length > 450) {
                counter.style.color = '#ff4444';
            } else {
                counter.style.color = 'rgba(255, 255, 255, 0.5)';
            }
        }
    },
    
    /**
     * Manejar envío del formulario
     * @param {Event} e 
     */
    handleSubmit(e) {
        e.preventDefault();
        
        // Evitar múltiples envíos
        if (this.state.isSubmitting) return;
        
        // Validar formulario
        if (!this.validateForm()) {
            this.showNotification('Por favor, corrige los errores antes de enviar', 'error');
            return;
        }
        
        // Marcar como enviando
        this.state.isSubmitting = true;
        
        // Mostrar loader
        this.showLoader();
        
        // Recopilar datos
        const formData = this.getFormData();
        
        // Enviar con EmailJS
        this.submitFormData(formData);
    },
    
    /**
     * Obtener datos del formulario
     * @returns {Object} - Datos del formulario
     */
    getFormData() {
        return {
            nombre: this.elements.inputs.nombre.value.trim(),
            email: this.elements.inputs.email.value.trim(),
            telefono: this.elements.inputs.telefono.value.trim(),
            objetivo: this.elements.inputs.objetivo.value,
            mensaje: this.elements.inputs.mensaje.value.trim(),
            newsletter: this.elements.inputs.newsletter.checked,
            fecha: new Date().toISOString(),
            id: Date.now()
        };
    },
    
    /**
     * Enviar datos con EmailJS
     * @param {Object} formData 
     */
    submitFormData(formData) {
        try {
            Utils.log('📧 Iniciando envío de emails', formData);
            
            // Parámetros para email al usuario
            const userTemplateParams = {
                to_email: formData.email,
                to_name: formData.nombre,
                from_name: 'Eithan Smith Fitness',
                objetivo: this.getObjetivoLabel(formData.objetivo),
                mensaje: formData.mensaje || 'No se proporcionó mensaje adicional',
                telefono: formData.telefono || 'No proporcionado'
            };
            
            // Parámetros para email al admin
            const adminTemplateParams = {
                to_email: CONFIG.EMAILJS_ADMIN_EMAIL,
                cliente_nombre: formData.nombre,
                cliente_email: formData.email,
                cliente_telefono: formData.telefono || 'No proporcionado',
                objetivo: this.getObjetivoLabel(formData.objetivo),
                mensaje: formData.mensaje || 'No se proporcionó mensaje adicional',
                fecha: new Date().toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
            
            // Enviar ambos emails
            Promise.all([
                emailjs.send(
                    CONFIG.EMAILJS_SERVICE_ID,
                    CONFIG.EMAILJS_USER_TEMPLATE_ID,
                    userTemplateParams
                ),
                emailjs.send(
                    CONFIG.EMAILJS_SERVICE_ID,
                    CONFIG.EMAILJS_ADMIN_TEMPLATE_ID,
                    adminTemplateParams
                )
            ])
            .then((responses) => {
                Utils.log('✅ Emails enviados exitosamente', responses);
                
                // Guardar en localStorage
                this.saveSubmission(formData);
                
                // Ocultar loader
                this.hideLoader();
                
                // Mostrar mensaje de éxito
                this.showSuccess();
                
                // Limpiar formulario
                this.elements.form.reset();
                this.clearAllErrors();
                this.clearSavedData();
                
                // Liberar estado
                this.state.isSubmitting = false;
                
                // Scroll al mensaje de éxito
                setTimeout(() => {
                    this.elements.successMessage.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 300);
            })
            .catch((error) => {
                Utils.error('Error al enviar emails', error);
                this.hideLoader();
                this.state.isSubmitting = false;
                this.showNotification(
                    'Hubo un error al enviar el mensaje. Por favor, intenta de nuevo.', 
                    'error'
                );
            });
            
        } catch (error) {
            Utils.error('Error general en submitFormData', error);
            this.hideLoader();
            this.state.isSubmitting = false;
            this.showNotification('Hubo un error inesperado. Por favor, intenta de nuevo.', 'error');
        }
    },
    
    /**
     * Guardar envío en localStorage
     * @param {Object} data 
     */
    saveSubmission(data) {
        try {
            const submissions = JSON.parse(localStorage.getItem(CONFIG.STORAGE_SUBMISSIONS) || '[]');
            submissions.push(data);
            
            if (submissions.length > CONFIG.MAX_SUBMISSIONS) {
                submissions.shift();
            }
            
            localStorage.setItem(CONFIG.STORAGE_SUBMISSIONS, JSON.stringify(submissions));
        } catch (error) {
            Utils.error('Error al guardar envío', error);
        }
    },
    
    /**
     * Guardar borrador en localStorage
     */
    saveFormData() {
        try {
            const data = {
                nombre: this.elements.inputs.nombre.value,
                email: this.elements.inputs.email.value,
                telefono: this.elements.inputs.telefono.value,
                objetivo: this.elements.inputs.objetivo.value,
                mensaje: this.elements.inputs.mensaje.value,
                newsletter: this.elements.inputs.newsletter.checked
            };
            
            localStorage.setItem(CONFIG.STORAGE_FORM_DRAFT, JSON.stringify(data));
        } catch (error) {
            Utils.error('Error al guardar borrador', error);
        }
    },
    
    /**
     * Cargar datos guardados
     */
    loadSavedData() {
        try {
            const savedData = localStorage.getItem(CONFIG.STORAGE_FORM_DRAFT);
            
            if (savedData) {
                const data = JSON.parse(savedData);
                
                Object.keys(data).forEach(key => {
                    const input = this.elements.inputs[key];
                    if (input) {
                        if (input.type === 'checkbox') {
                            input.checked = data[key];
                        } else {
                            input.value = data[key];
                        }
                    }
                });
                
                this.updateCharCounter();
            }
        } catch (error) {
            Utils.error('Error al cargar datos guardados', error);
        }
    },
    
    /**
     * Limpiar datos guardados
     */
    clearSavedData() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_FORM_DRAFT);
        } catch (error) {
            Utils.error('Error al limpiar datos guardados', error);
        }
    },
    
    /**
     * Mostrar loader en botón
     */
    showLoader() {
        const btn = this.elements.submitBtn;
        if (btn) {
            btn.classList.add('loading');
            btn.disabled = true;
            if (this.elements.buttonLoader) {
                this.elements.buttonLoader.style.display = 'block';
            }
        }
    },
    
    /**
     * Ocultar loader del botón
     */
    hideLoader() {
        const btn = this.elements.submitBtn;
        if (btn) {
            btn.classList.remove('loading');
            btn.disabled = false;
            if (this.elements.buttonLoader) {
                this.elements.buttonLoader.style.display = 'none';
            }
        }
    },
    
    /**
     * Mostrar mensaje de éxito
     */
    showSuccess() {
        this.elements.form.style.display = 'none';
        this.elements.successMessage.style.display = 'block';
    },
    
    /**
     * Mostrar formulario
     */
    showForm() {
        this.elements.form.style.display = 'grid';
        this.elements.successMessage.style.display = 'none';
        this.resetForm();
    },
    
    /**
     * Resetear formulario
     */
    resetForm() {
        this.elements.form.reset();
        this.clearAllErrors();
        this.clearSavedData();
        this.updateCharCounter();
    },
    
    /**
     * Limpiar todos los errores
     */
    clearAllErrors() {
        Object.keys(this.elements.inputs).forEach(key => {
            this.clearError(key);
            const input = this.elements.inputs[key];
            if (input) {
                input.classList.remove('success', 'error');
            }
        });
    },
    
    /**
     * Mostrar notificación toast
     * @param {string} message - Mensaje
     * @param {string} type - Tipo (info|error|success)
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : '#00cc66'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    },
    
    /**
     * Obtener label del objetivo
     * @param {string} value 
     * @returns {string}
     */
    getObjetivoLabel(value) {
        const labels = {
            'perder-peso': 'Perder Peso',
            'ganar-musculo': 'Ganar Músculo',
            'tonificar': 'Tonificar y Definir',
            'fuerza': 'Aumentar Fuerza',
            'resistencia': 'Mejorar Resistencia',
            'rehabilitacion': 'Rehabilitación',
            'otro': 'Otros Objetivos'
        };
        return labels[value] || value;
    }
};

/* ============================================
   MÓDULO: ANIMACIONES
   ============================================ */
const Animations = {
    observer: null,
    
    /**
     * Inicializar animaciones
     */
    init() {
        this.setupHeroAnimations();
        this.setupScrollRevealAnimations();
        Utils.log('✅ Animaciones inicializadas');
    },
    
    /**
     * Configurar animaciones del hero (entrada inicial)
     */
    setupHeroAnimations() {
        // Las animaciones hero se activan automáticamente con CSS
        // porque la clase .hero-animate ya está en el HTML
        Utils.log('Hero animations ready');
    },
    
    /**
     * Configurar animaciones on-scroll
     */
    setupScrollRevealAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Agregar clase revealed para activar la animación
                    entry.target.classList.add('revealed');
                    
                    // Dejar de observar después de animar (performance)
                    this.observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observar todos los elementos con clases de scroll-reveal
        const scrollRevealElements = document.querySelectorAll(`
            .scroll-reveal,
            .scroll-reveal-left,
            .scroll-reveal-right,
            .scroll-reveal-scale
        `);
        
        scrollRevealElements.forEach(el => {
            this.observer.observe(el);
        });
        
        Utils.log(`Observando ${scrollRevealElements.length} elementos para scroll reveal`);
    },
    
    /**
     * Destruir observer (cleanup)
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
};

/* ============================================
   INICIALIZACIÓN DE LA APLICACIÓN
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    Utils.log('============================================');
    Utils.log('🚀 EITHAN SMITH FITNESS - Inicializando...');
    Utils.log('============================================');
    
    try {
        // Inicializar módulos
        Navbar.init();
        HistoriasCarousel.init();
        ContactForm.init();
        Animations.init();
        
        Utils.log('============================================');
        Utils.log('✅ Aplicación inicializada correctamente');
        Utils.log('============================================');
    } catch (error) {
        Utils.error('Error fatal durante inicialización', error);
    }
});

/* ============================================
   MANEJO DE ERRORES GLOBAL
   ============================================ */
window.addEventListener('error', (event) => {
    Utils.error('Error no capturado', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    Utils.error('Promesa rechazada no manejada', event.reason);
});