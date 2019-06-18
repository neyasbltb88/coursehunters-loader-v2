// Базовый URL локального сервера
const server_url = 'http://localhost:3000/';

// --- Дополнительные инструменты ---
function liveReloadClientInit() {
    if (!window.liveReloadClient) {
        window.liveReloadClient = true;

        class LiveReloadClient {
            constructor(server_url) {
                this.server_url = server_url.endsWith('/') ? server_url : server_url + '/';
                this.live_reload_url = this.server_url + 'livereload.js';
                this.live_reload_real_url = 'http://localhost:35729/livereload.js';
                this.state_livereload = null;
                this.btn = null;
                this.btn_base_class = 'live-reload-btn';
                this.btn_style_hide = [
                    ' position: fixed;',
                    'min-height: 40px;',
                    'top: 0;',
                    'left: 0;',
                    'padding: 0 5px;',
                    'font-size: 10px;',
                    'align-items: center;',
                    'border-radius: 5px;',
                    'background-color: rgba(0, 0, 0, .42);',
                    'box-shadow: 0 0 20px 0 rgba(0, 0, 0, .6);',
                    'cursor: pointer;',
                    'z-index: 9999;',
                    'user-select: none;',
                    'display: none;'
                ].join(' ');

                this.btn_style_ready = this.btn_style_hide + [
                    ' display: flex;',
                    'color: #C3CFE0 !important;',
                    'border: 1px solid #C3CFE0 !important;',
                ].join(' ');

                this.btn_style_disable = this.btn_style_ready + [
                    ' cursor: default;',
                    'opacity: .3;',
                ].join(' ');

                this.btn_style_active = this.btn_style_hide + [
                    ' display: flex;',
                    'color: #ffc000 !important;',
                    'border: 1px solid #ffc000 !important;',
                ].join(' ');

                this.btn_style_error = this.btn_style_hide + [
                    ' display: flex;',
                    'color: #F92672 !important;',
                    'border: 1px solid #F92672 !important;',
                ].join(' ');



                // Точка входа
                this.init();
            }

            // Приводит src скриптов к абсолютному виду
            normalizeSrc(script_src) {
                // Если не передан src, или это не строка, то выходим
                if (!script_src || typeof script_src !== 'string') return false;
                let result = false;
                // https://regex101.com/r/kvqlZe/2/
                let regex = /^http|^\/\//mi;

                // Если src абсолютный, оставляем его как есть
                if (script_src.search(regex) !== -1) {
                    result = script_src;

                    // Если src относительный, дописываем к нему адрес локального сервера
                } else {
                    // https://regex101.com/r/kvqlZe/3
                    let replace_regex = /^\W+/mi;
                    result = this.server_url + script_src.replace(replace_regex, '');
                }

                return result;
            }

            // Вставляет контент скрипта на страницу
            appendScript(script, script_content) {
                let elem = document.createElement('script');
                elem.textContent = script_content;
                elem.className = script.className ? script.className : '';
                elem.id = script.id ? script.id : '';

                document.head.appendChild(elem);
            }

            // Получает скрипт и вставляет его на страницу
            loadScript(script) {
                // Если у скрипта нет ни src, ни контента, то выходим
                if (!script.src && !script.textContent) return false;

                let script_src = this.normalizeSrc(script.getAttribute('src'));
                let show_name = script.id || script.className || script_src;
                console.log('%c%s', (window.log_color) ? window.log_color.yellow : '', `*ScriptsAutoload* подключение скрипта: ${show_name}`);

                // Если текущий скрипт - это livereload, то его надо загрузить по-другому
                if (script.id === 'livereload') {
                    this.live_reload_url = script_src;
                    this.fetchLiveReloadScript();

                    return;
                }

                // Если скрипт инлайновый, то у него не должно быть src, но должен быть контент
                if (!script_src && script.textContent) {
                    // Вставим на страницу контент этого скрипта
                    this.appendScript(script, script.textContent);

                    // Если у скрипта есть src
                } else if (script_src) {
                    // Получим содержимое скрипта по src
                    fetch(script_src, { mode: 'cors' })
                        .then(res => res.text())
                        .then(res => {
                            this.appendScript(script, res);
                        });
                }
            }

            // Метод инъекции массива скриптов на страницу
            insertScripts(scripts) {
                // Если передан не массив элементов скриптов, а строка с адресом
                if (typeof scripts === 'string') {
                    scripts = [{
                        src: scripts,
                        getAttribute: function(attr) {
                            return this[attr];
                        }
                    }];
                }

                scripts.forEach(script => {
                    // Загрузить и вставить скрипты на страницу
                    this.loadScript(script);
                });
            }

            // Метод сбора скриптов, подключенных к index.html на сервере
            fetchScriptsUrl() {
                fetch(this.server_url, { mode: 'cors' })
                    .then(response => response.text())
                    .then(text => {
                        let parser = new DOMParser();
                        let doc = parser.parseFromString(text, "text/html");

                        let scripts_selector = 'script:not(#__bs_script__)';

                        let scripts_elems = Array.from(doc.querySelectorAll(scripts_selector));
                        scripts_elems = scripts_elems.filter(script => !script.classList.contains('ignore'))

                        this.insertScripts(scripts_elems);
                    })
                    .catch(err => {
                        console.log('%c%s', (window.log_color) ? window.log_color.red : '', '*ScriptsAutoload* не удалось подключить рабочие скрипты');
                        console.log(err);
                    })
            }

            // Метод изменения состояния кнопки
            stateLiveReloadButton(state = {}) {
                if (!this.btn) return;

                this.btn.setAttribute('style', this[`btn_style_${state.state}`]);
                this.btn.className = `${this.btn_base_class} live-reload-${state.state}`;
            }

            // Обработчик клика на кнопке
            handlerLiveReloadButton(e) {
                if (e.target.classList.contains('live-reload-disable')) {
                    return;
                } else if (window.LiveReload && e.target.classList.contains('live-reload-ready')) {
                    // console.log('LiveReload загружен, кнопка ready');

                    LiveReload.connector.connect();
                } else if (window.LiveReload && e.target.classList.contains('live-reload-active')) {
                    // console.log('LiveReload загружен, кнопка active');

                    LiveReload.connector.disconnect();
                } else if (!window.LiveReload && e.target.classList.contains('live-reload-ready')) {
                    // console.log('LiveReload не загружен, кнопка ready');

                    this.fetchLiveReloadScript();
                } else if (window.LiveReload && e.target.classList.contains('live-reload-error')) {
                    // console.log('LiveReload загружен, кнопка error');

                    LiveReload.connector.connect();
                } else if (!window.LiveReload && e.target.classList.contains('live-reload-error')) {
                    // console.log('LiveReload не загружен, кнопка error');

                    this.stateLiveReloadButton({
                        state: 'ready',
                    });

                    this.fetchLiveReloadScript();
                }

            }

            // Установить обработчики события коннекта/дисконнекта скрипта livereload с сервером
            handlerLiveReloadConnect() {
                // Коннект
                LiveReload.connector.handlers.connected = () => {
                    console.log('%c%s', (window.log_color) ? window.log_color.green : '', '*ScriptsAutoload* livereload подключен к серверу');
                    this.state_livereload = 'connect';
                    this.stateLiveReloadButton({
                        state: 'active',
                    });
                }

                // Дисконнект
                LiveReload.connector.handlers.disconnected = (reason, delay) => {
                    console.log('%c%s', (window.log_color) ? window.log_color.red : '', '*ScriptsAutoload* livereload отключен от сервера');
                    // console.log(`Причина дисконнекта: ${reason}`);

                    if (reason === 'manual') {
                        this.stateLiveReloadButton({
                            state: 'ready',
                        });
                    } else if (reason === 'broken' && this.state_livereload !== 'manual') {
                        this.stateLiveReloadButton({
                            state: 'error',
                        });

                        console.log(`Переподключение через: ${delay}`);
                    } else if (reason === 'broken' && this.state_livereload === 'manual') {
                        this.stateLiveReloadButton({
                            state: 'ready',
                        });
                    } else if (reason === 'cannot-connect') {
                        this.stateLiveReloadButton({
                            state: 'error',
                        });

                        console.log(`Переподключение через: ${delay}`);
                    }

                    this.state_livereload = reason;
                }

                // Ошибка
                LiveReload.connector._onerror = (error) => {
                    // console.log('Событие ошибки', error);
                }
            }

            // Не лагающая рекурсивная проверка доступности body
            checkBody(callback, arg) {
                requestAnimationFrame(function launch(arg) {
                    if (!document.body) {
                        requestAnimationFrame(launch.bind(this, arg));
                    } else {
                        callback.call(this, arg);
                    }
                }.bind(this, arg))
            }

            // Вставляет кнопку на страницу
            insertLiveReloadButton(btn) {
                document.body.appendChild(btn);

                if (this.state_livereload === 'connect') {
                    this.stateLiveReloadButton({
                        state: 'active',
                    });
                } else if (this.state_livereload === 'manual') {
                    this.stateLiveReloadButton({ state: 'ready' });
                } else if (this.state_livereload === null) {
                    this.stateLiveReloadButton({ state: 'ready' });
                } else {
                    this.stateLiveReloadButton({ state: 'error' });
                }

            }

            // Создает кнопку и пытается вставить ее на страницу
            createLiveReloadButton() {
                let btn = document.createElement('div');
                btn.classList.add(this.btn_base_class);
                btn.textContent = 'LiveReload';

                btn.addEventListener('click', this.handlerLiveReloadButton.bind(this));

                this.btn = btn;

                this.checkBody(this.insertLiveReloadButton, btn);
            }

            // livereload скрипт успешно загружен
            fetchLiveReloadScriptSuccess() {
                // Когда скрипт будет загружен, подвязаться к событиям livereload
                this.handlerLiveReloadConnect();

                this.stateLiveReloadButton({
                    state: 'active',
                });

            }

            // Ошибка загрузки livereload скрипта
            fetchLiveReloadScriptError() {
                console.log('%c%s', (window.log_color) ? window.log_color.red : '', '*ScriptsAutoload* не удалось подключить livereload');
                this.stateLiveReloadButton({
                    // state: 'ready',
                    state: 'error',
                });
            }

            // Метод подгрузки скрипта автоматического обновления страницы
            fetchLiveReloadScript() {
                if (!document.querySelector('script.live_reload_client')) {
                    fetch(this.live_reload_url, { mode: 'cors' })
                        .then(response => response.text())
                        .then(res => {
                            if (res) {
                                let live_reload_client = document.createElement('script');
                                live_reload_client.className = 'live_reload_client';
                                live_reload_client.src = this.live_reload_real_url;

                                live_reload_client.onload = this.fetchLiveReloadScriptSuccess.bind(this);

                                live_reload_client.onerror = () => {
                                    let live_reload_client2 = document.createElement('script');
                                    live_reload_client2.className = 'live_reload_client';
                                    live_reload_client2.textContent = res;
                                    document.head.appendChild(live_reload_client2);

                                    this.fetchLiveReloadScriptSuccess();
                                };

                                document.head.appendChild(live_reload_client);
                            }

                        }).catch((err) => {
                            console.log('%c%s', (window.log_color) ? window.log_color.red : '', `Ошибка в fetchLiveReloadScript: ${err}`);
                            console.log('Ошибка XHR.request(live_reload_url)');

                            this.fetchLiveReloadScriptError();
                        });
                }
            }

            init() {
                // Если еще нет кнопки
                if (!document.querySelector(`.${this.btn_base_class}`)) {
                    // Создать кнопку управления livereload
                    this.createLiveReloadButton();
                }

                // Получение скриптов локального проекта 
                this.fetchScriptsUrl();

            }

        }


        window.liveReloadClient = new LiveReloadClient(server_url);
    }
}

// === Дополнительные инструменты ===



/////////////////////////////////////////////////////////////
//          === ЗДЕСЬ ИНИЦИАЛИЗАЦИЯ СКРИПТОВ ====          //
/////////////////////////////////////////////////////////////
// Не будем запускать скрипт, если скрипт загрузился в iframe.
// Нужно для того, чтобы скрипт повторно не срабатывал из iframe
if (window.top === window) {

    window.log_color = {
        green: [
            'color: #272822;',
            'background-color: #A6E22E;',
            'padding: 2px 10px;',
            'width: 100%'
        ].join(' '),
        red: [
            'color: #272822;',
            'background-color: #F92672;',
            'padding: 2px 10px;'
        ].join(' '),
        yellow: [
            'color: #272822;',
            'background-color: #E6DB74;',
            'padding: 2px 10px;'
        ].join(' '),
        orange: [
            'color: #272822;',
            'background-color: #FD971F;',
            'padding: 2px 10px;'
        ].join(' '),
        blue: [
            'color: #272822;',
            'background-color: #66D9EF;',
            'padding: 2px 10px;'
        ].join(' '),
        purple: [
            'color: #272822;',
            'background-color: #AE81FF;',
            'padding: 2px 10px;'
        ].join(' ')
    };

    console.log('%c%s', (window.log_color) ? window.log_color.green : '', `*ScriptsAutoload* Скрипт запущен на странице: ${document.title}`);

    // --- Подключение дополнительных инструментов ---

    liveReloadClientInit();

    // === Подключение дополнительных инструментов ===

    window.addEventListener('load', () => {
        // Если нужен запуск после загрузки страницы

    });
}