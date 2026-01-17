

// Универсальный скрипт для анимации последовательного появления элементов
class FadeUpAnimation {
    constructor(options = {}) {
        // Настройки по умолчанию
        this.defaults = {
            selector: '.fade-up',          // Селектор элементов
            startDelay: 50,                // Задержка перед началом анимации
            staggerDelay: 120,             // Задержка между элементами
            focusElement: null,            // ID элемента для автофокуса
            focusDelay: 200,               // Задержка перед фокусом
            onComplete: null,              // Коллбек по завершении
            excludePages: []               // Страницы, где не применять
        };
        
        this.config = { ...this.defaults, ...options };
        this.elements = [];
        this.isAnimating = false;
        
        // Проверяем, не на исключенной ли странице
        if (this.shouldSkipAnimation()) {
            return;
        }
        
        this.init();
    }
    
    shouldSkipAnimation() {
        const currentPage = window.location.pathname.split('/').pop();
        return this.config.excludePages.includes(currentPage);
    }
    
    init() {
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }
    
    start() {
        // Находим все элементы
        this.elements = document.querySelectorAll(this.config.selector);
        
        if (this.elements.length === 0) {
            console.log('FadeUpAnimation: элементов не найдено');
            return;
        }
        
        console.log(`FadeUpAnimation: найдено ${this.elements.length} элементов`);
        
        // Запускаем анимацию через небольшую задержку
        setTimeout(() => {
            this.animateElements();
            this.setupAutoFocus();
        }, this.config.startDelay);
    }
    
    animateElements() {
        this.isAnimating = true;
        
        this.elements.forEach((element, index) => {
            // Проверяем, не виден ли элемент уже
            if (element.classList.contains('show')) {
                return;
            }
            
            setTimeout(() => {
                element.classList.add('show');
                
                // Если это последний элемент, вызываем коллбек
                if (index === this.elements.length - 1) {
                    this.onAnimationComplete();
                }
            }, index * this.config.staggerDelay);
        });
    }
    
    setupAutoFocus() {
        if (!this.config.focusElement) {
            // Автоопределение первого инпута или текстового поля
            const firstInput = document.querySelector('input, textarea, select, button');
            if (firstInput) {
                setTimeout(() => {
                    if (!this.isFormElement(firstInput)) return;
                    firstInput.focus();
                }, this.config.focusDelay + (this.elements.length * this.config.staggerDelay));
            }
            return;
        }
        
        const focusEl = document.getElementById(this.config.focusElement);
        if (focusEl && this.isFormElement(focusEl)) {
            setTimeout(() => {
                focusEl.focus();
            }, this.config.focusDelay + (this.elements.length * this.config.staggerDelay));
        }
    }
    
    isFormElement(element) {
        const formElements = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
        return formElements.includes(element.tagName);
    }
    
    onAnimationComplete() {
        this.isAnimating = false;
        
        if (typeof this.config.onComplete === 'function') {
            this.config.onComplete();
        }
        
        console.log('FadeUpAnimation: анимация завершена');
    }
    
    // Метод для ручного запуска анимации
    restart() {
        // Сначала скрываем все элементы
        this.elements.forEach(el => {
            el.classList.remove('show');
        });
        
        // Затем запускаем заново
        setTimeout(() => {
            this.animateElements();
        }, 100);
    }
    
    // Метод для анимации исчезновения
    fadeOutAll(reverseOrder = true) {
        const elements = reverseOrder 
            ? Array.from(this.elements).reverse() 
            : this.elements;
        
        return new Promise((resolve) => {
            elements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.remove('show');
                    element.classList.add('fade-out');
                    
                    // Последний элемент
                    if (index === elements.length - 1) {
                        setTimeout(resolve, 300);
                    }
                }, index * 40);
            });
        });
    }
}

// Автоматическая инициализация с настройками для разных страниц
document.addEventListener('DOMContentLoaded', function() {
    // Определяем текущую страницу
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Настройки для разных страниц
    const pageConfigs = {
        'index.html': { // Страница с паролем
            staggerDelay: 150,
            focusElement: 'passwordInput'
        },
        'login_form.html': { // Страница входа
            staggerDelay: 120,
            focusElement: 'emailInput'
        },
        'register_form.html': { // Страница регистрации
            staggerDelay: 100,
            focusElement: 'nameInput'
        },
        'gl.html': { // Главная страница
            staggerDelay: 100,
            excludePages: ['gl.html'] // Не применять на главной, если не нужно
        }
    };
    
    // Получаем конфиг для текущей страницы или используем дефолтный
    const config = pageConfigs[currentPage] || { staggerDelay: 120 };
    
    // Создаем экземпляр анимации
    window.fadeUpAnimation = new FadeUpAnimation(config);
});

// Утилиты для работы с анимациями на всех страницах
window.PageAnimations = {
    // Плавный переход на другую страницу
    navigateTo: function(url, reverseOrder = true) {
        if (window.fadeUpAnimation) {
            window.fadeUpAnimation.fadeOutAll(reverseOrder).then(() => {
                window.location.href = url;
            });
        } else {
            window.location.href = url;
        }
    },
    
    // Анимация ошибки для элемента
    shakeElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('shake-error');
            setTimeout(() => {
                element.classList.remove('shake-error');
            }, 500);
        }
    },
    
    // Показать сообщение с анимацией
    showMessage: function(elementId, text, isError = false) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
            element.style.color = isError ? '#ff6b6b' : '#51cf66';
            
            // Анимация появления
            element.classList.remove('fade-out');
            element.classList.add('show');
            
            // Автоскрытие через 5 секунд
            setTimeout(() => {
                element.textContent = '';
            }, 5000);
        }
    }
};