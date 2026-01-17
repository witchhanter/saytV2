// Универсальный скрипт для анимации последовательного появления элементов
class FadeUpAnimation {
    constructor(options = {}) {
        // Настройки по умолчанию
        this.defaults = {
            selector: '.fade-up',          // Селектор элементов
            startDelay: 50,                // Задержка перед началом анимации
            staggerDelay: 80,              // Задержка между элементами
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
        
        // Отдельно анимируем welcome-section
        const welcomeSection = document.querySelector('.welcome-section');
        if (welcomeSection) {
            setTimeout(() => {
                welcomeSection.classList.add('show');
            }, 100);
        }
        
        // Анимация карточек сетки построчно
        const gridItems = Array.from(this.elements).filter(el => 
            el.classList.contains('grid-item')
        );
        
        if (gridItems.length > 0) {
            const columns = this.getGridColumns();
            
            gridItems.forEach((item, index) => {
                const row = Math.floor(index / columns);
                const col = index % columns;
                
                // Задержка: строка * 100ms + колонка * 40ms
                const delay = 200 + (row * 100) + (col * 40);
                
                setTimeout(() => {
                    item.classList.add('show');
                    
                    // Если это последний элемент, вызываем коллбек
                    if (index === gridItems.length - 1) {
                        this.onAnimationComplete();
                    }
                }, delay);
            });
            
            // Футер после завершения анимации карточек
            const lastRow = Math.floor((gridItems.length - 1) / columns);
            const lastDelay = 200 + (lastRow * 100) + 150;
            
            setTimeout(() => {
                const footer = document.querySelector('.footer');
                if (footer) {
                    footer.classList.add('show');
                }
            }, lastDelay);
        } else {
            // Если нет сетки, анимируем все элементы последовательно
            this.elements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('show');
                    
                    // Если это последний элемент, вызываем коллбек
                    if (index === this.elements.length - 1) {
                        this.onAnimationComplete();
                    }
                }, index * this.config.staggerDelay);
            });
        }
    }
    
    getGridColumns() {
        const grid = document.querySelector('.grid-table');
        if (!grid) return 3;
        
        const style = window.getComputedStyle(grid);
        const gridTemplateColumns = style.gridTemplateColumns;
        
        if (gridTemplateColumns === 'none') {
            // Для мобильных - 2 колонки
            return window.innerWidth < 480 ? 2 : 3;
        }
        
        return gridTemplateColumns.split(' ').length;
    }
    
    setupAutoFocus() {
        if (!this.config.focusElement) return;
        
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
                    
                    // Последний элемент
                    if (index === elements.length - 1) {
                        setTimeout(resolve, 300);
                    }
                }, index * 40);
            });
        });
    }
}

// Проверка авторизации
function checkAuth() {
    try {
        const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        
        if (!savedUser) {
            // Если нет сохраненного пользователя, создаем гостевой аккаунт
            const guestUser = {
                id: 'guest_' + Date.now(),
                name: 'Гость',
                email: '',
                isGuest: true,
                loginTime: new Date().toISOString()
            };
            
            // Сохраняем гостя в sessionStorage
            sessionStorage.setItem('currentUser', JSON.stringify(guestUser));
            return guestUser;
        }
        
        return JSON.parse(savedUser);
    } catch (e) {
        console.error('Ошибка авторизации:', e);
        return null;
    }
}

// Показать информацию пользователя (исправлено двойное отображение)
function showUserInfo(user) {
    const userInfo = document.getElementById('userInfo');
    if (!userInfo) return;
    
    if (user && user.isGuest) {
        // Для гостя показываем только "Гость"
        userInfo.innerHTML = `
            <div class="user-details">
                <span class="user-name">👤 Гость</span>
            </div>
        `;
    } else if (user) {
        // Для авторизованного пользователя
        userInfo.innerHTML = `
            <div class="user-details">
                <span class="user-name">👤 ${user.name}</span>
                <span class="user-email">📧 ${user.email}</span>
            </div>
        `;
    } else {
        // На всякий случай
        userInfo.innerHTML = `
            <div class="user-details">
                <span class="user-name">Не авторизован</span>
            </div>
        `;
    }
    
    // Анимация появления информации
    setTimeout(() => {
        userInfo.classList.add('loaded');
    }, 300);
}

// Обновление времени
function updateTime() {
    const timeElement = document.getElementById('currentTime');
    if (!timeElement) return;
    
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const timeString = now.toLocaleString('ru-RU', options);
    timeElement.textContent = timeString;
}

// Настройка выхода
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;
    
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Анимация нажатия
        this.style.transform = 'scale(0.9)';
        this.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            // Удаляем данные
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            
            // Переход на страницу входа
            window.location.href = 'login_form.html';
        }, 150);
    });
}

// Скрытие хедера при скролле
function setupScrollHide() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    let lastScroll = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll > 100) {
                    if (currentScroll > lastScroll) {
                        // Вниз
                        container.classList.add('hidden');
                    } else {
                        // Вверх
                        container.classList.remove('hidden');
                    }
                } else {
                    container.classList.remove('hidden');
                }
                
                lastScroll = currentScroll;
                ticking = false;
            });
            
            ticking = true;
        }
    });
}

// Инициализация интерактивности
function setupInteractions() {
    // Анимация нажатия для карточек
    const cards = document.querySelectorAll('.grid-card');
    cards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
        
        // Для десктопа
        card.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Анимация нажатия для кнопок
    const buttons = document.querySelectorAll('.nav-btn, .logout-btn');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
            this.style.transition = 'transform 0.1s ease';
        });
        
        btn.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
}

// Автоматическая инициализация с настройками для главной страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация приложения...');
    
    // Проверяем авторизацию
    const currentUser = checkAuth();
    
    // Показываем информацию о пользователе
    setTimeout(() => {
        showUserInfo(currentUser);
    }, 500);
    
    // Настраиваем обновление времени
    updateTime();
    setInterval(updateTime, 30000);
    
    // Настраиваем выход
    setupLogout();
    
    // Настраиваем скрытие хедера
    setupScrollHide();
    
    // Настраиваем интерактивность
    setupInteractions();
    
    // Создаем экземпляр анимации для главной страницы
    window.fadeUpAnimation = new FadeUpAnimation({
        staggerDelay: 80,
        excludePages: ['index.html', 'login_form.html', 'register_form.html']
    });
    
    console.log('Приложение инициализировано');
});

// Утилиты для работы с анимациями
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
            element.classList.add('show');
            
            // Автоскрытие через 5 секунд
            setTimeout(() => {
                element.textContent = '';
            }, 5000);
        }
    }
};

// Предотвращение масштабирования на двойной тап
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });