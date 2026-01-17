// Универсальная анимация последовательного появления
class SequentialFadeAnimation {
    constructor() {
        this.elements = [];
        this.initialize();
    }
    
    initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }
    
    start() {
        // Находим все элементы для анимации
        this.elements = document.querySelectorAll('.fade-up');
        
        if (this.elements.length === 0) {
            console.log('Анимация: элементов не найдено');
            return;
        }
        
        console.log(`Анимация: найдено ${this.elements.length} элементов`);
        
        // Начинаем анимацию с задержкой
        setTimeout(() => this.animateSequence(), 100);
    }
    
    animateSequence() {
        // Приветственная секция
        const welcomeSection = document.querySelector('.welcome-section');
        if (welcomeSection) {
            setTimeout(() => {
                welcomeSection.classList.add('show');
            }, 100);
        }
        
        // Карточки сетки - построчная анимация
        const gridItems = Array.from(this.elements).filter(el => 
            el.classList.contains('grid-item')
        );
        
        if (gridItems.length > 0) {
            const columns = this.getGridColumns();
            
            gridItems.forEach((item, index) => {
                const row = Math.floor(index / columns);
                const col = index % columns;
                
                // Задержка: строка * 150ms + колонка * 50ms
                const delay = 300 + (row * 150) + (col * 50);
                
                setTimeout(() => {
                    item.classList.add('show');
                    
                    // Добавляем небольшую анимацию при появлении
                    this.addPopAnimation(item);
                }, delay);
            });
            
            // Футер после завершения анимации карточек
            const lastRow = Math.floor((gridItems.length - 1) / columns);
            const lastDelay = 300 + (lastRow * 150) + 200;
            
            setTimeout(() => {
                const footer = document.querySelector('.footer');
                if (footer) {
                    footer.classList.add('show');
                }
                console.log('Анимация завершена');
            }, lastDelay);
        } else {
            // Если нет сетки, анимируем все элементы последовательно
            this.elements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('show');
                }, 100 + (index * 80));
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
    
    addPopAnimation(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transition = 'transform 0.2s ease';
            element.style.transform = 'scale(1)';
            
            setTimeout(() => {
                element.style.transition = '';
            }, 200);
        }, 10);
    }
}

// Проверка авторизации
function checkAuth() {
    try {
        const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        
        if (!savedUser) {
            // Для главной страницы разрешаем доступ без авторизации
            if (window.location.pathname.includes('gl.html')) {
                // Можно показать гостевой режим
                return null;
            }
            
            if (!window.location.pathname.includes('index.html') && 
                !window.location.pathname.includes('login_form.html') &&
                !window.location.pathname.includes('register_form.html')) {
                window.location.href = 'login_form.html';
            }
            return null;
        }
        
        return JSON.parse(savedUser);
    } catch (e) {
        console.error('Ошибка авторизации:', e);
        return null;
    }
}

// Показать информацию пользователя
function showUserInfo(user) {
    const userInfo = document.getElementById('userInfo');
    if (!userInfo) return;
    
    if (!user) {
        userInfo.innerHTML = `
            <div class="user-details">
                <span class="user-name">Гость</span>
            </div>
        `;
    } else if (user.isGuest) {
        userInfo.innerHTML = `
            <div class="user-details">
                <span class="user-name">Гость</span>
                <span class="user-email">${user.name}</span>
            </div>
        `;
    } else {
        userInfo.innerHTML = `
            <div class="user-details">
                <span class="user-name">${user.name}</span>
                <span class="user-email">${user.email}</span>
            </div>
        `;
    }
    
    userInfo.classList.add('loaded');
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

// Инициализация приложения
function initApp() {
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
    
    // Запускаем анимации
    window.animation = new SequentialFadeAnimation();
    
    console.log('Приложение инициализировано');
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', initApp);

// Предотвращение масштабирования на двойной тап
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });