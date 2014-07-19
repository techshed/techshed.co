/* jshint camelcase: false */
/* global NProgress, FastClick */

(function() {
    'use strict';

    var el, path, timer, TechshedCo = {

        siteElements: {
            // Nav
            $navPrimary: $('.nav-primary'),
            $navToggle: $('.nav-primary__menu-toggle'),
            $navPrimaryMenu: $('.nav-primary__menu'),
            $navPrimaryMenuLg: $('.nav-primary__menu--lg'),
            $navPrimaryLink: $('.nav-primary__link'),
            $pageWindow: $('#page-window'),
            $pageFooter: $('#page-footer')
        },

        init: function() {
            window.TechshedCo = this;
            TechshedCo = this;
            el = TechshedCo.siteElements;
            path = TechshedCo.getCurrentPath();
            FastClick.attach(document.body);

            NProgress.configure({
                trickleRate: 0.01,
                trickleSpeed: 100,
                minimum: 0.7
            });

            TechshedCo.bindEvents();
            TechshedCo.getPage(path);
        },

        getCurrentPath: function() {
            return window.location.pathname.split('/').pop().replace(/[^a-z0-9\s]/gi, '');
        },

        bindEvents: function() {

            // Nav toggle button
            el.$navToggle.on('click', function(ev) {
                // Prevent multiple clicks within .4s window
                if (!$(this).data('isClicked')) {
                    TechshedCo.toggleNavMenu();
                    var link = $(this);
                    link.data('isClicked', true);
                    setTimeout(function() {
                        link.removeData('isClicked');
                    }, 400);
                }
                ev.preventDefault();
            });

            // Page links
            el.$navPrimaryLink.on('click', function(ev) {
                var $this = $(this),
                    page = $this.attr('class').split(' ')[0];
                path = TechshedCo.getCurrentPath();

                // ~~~~~~ mobile nav logic (need to refactor) ~~~~~~
                if ($this.parents().hasClass('nav-primary__menu')) {
                    TechshedCo.toggleNavMenu();
                }
                // hide mobile nav menu if logo is clicked
                if ($this.hasClass('logo') && !el.$navPrimaryMenu.hasClass('is-hidden')) {
                    TechshedCo.toggleNavMenu();
                }
                // check if already on the requested page
                if (path !== page) {
                    NProgress.start();
                    // update path in address bar
                    history.pushState({}, '', '/' + page);

                    // scroll to the top of the page before loading new page
                    $.smoothScroll({
                        scrollTarget: '0',
                        afterScroll: function() {
                            TechshedCo.getPage(page);
                        }
                    });
                }
                ev.preventDefault();
            });


            // Enable back button via HTML5 pop state
            $(window).on('popstate', function(ev) {
                var path = window.location.pathname.split('/').pop();
                TechshedCo.getPage(path);
                ev.preventDefault();
            });

            // disable all transitions when window is being resized
            $(window).on('resize', TechshedCo.debounce(function() {
                clearInterval(timer);
                $('.scroll-down-arrow').addClass('hidden');
                $('body').addClass('no-transitions');
                timer = setTimeout(function() {
                    $('body').removeClass('no-transitions');
                }, 1000);
            }, 0));
        },

        getPage: function(page) {

            // page html path
            var pageSrc = ('/pages/' + page + '.html');
            $('.page-footer').addClass('hidden');

            // check if page = home
            if (page === 'home' || page === '') {
                $('.home').addClass('active').siblings().removeClass('active');
                el.$pageWindow.load('/pages/home.html', function() {
                    TechshedCo.showPage(page);
                    NProgress.done();
                });
                // not home, so load the url
            } else {
                $('.' + page).addClass('active').siblings().removeClass('active');
                el.$pageWindow.load(pageSrc, function(response, status) {
                    if (status === 'error') {
                        el.$pageWindow.load('/pages/404.html');
                    }
                    TechshedCo.showPage(page);
                    NProgress.done();
                });
            }
        },

        showPage: function(page) {

            el.$pageWindow.removeClass('is-transitioning');
            TechshedCo.setWaypoints();
            $('.page-footer').removeClass('hidden');
            $('#page-window p, h2, h3, h4').unorphanize(1);

            // init home
            if (page === 'home' || page === '') {
                $('body').removeClass().addClass('home');
                TechshedCo.fitText();
                TechshedCo.setHeaderHeight();

                // remove video poster after play to avoid loop flicker
                var $homeVideo = $('.video-bg');
                $homeVideo.on('playing', function() {
                    $(this).attr('poster', '');
                });

            } else if (page === 'jobs') {
                window._jobscore_loader = false;
                setTimeout(function() {
                    TechshedCo.initJobScoreWidget();
                }, 400);
                $('body').removeClass().addClass(page + ' subpage');

            } else {
                // init general subpage
                $('body').removeClass().addClass(page + ' subpage');
            }

            // prevent pageWindow collapsing to 0 height
            $('.page-window').css({
                'min-height': $('.page-window').height()
            });
        },

        fitText: function() {
            $('.fit-text').fitText(0.697, {
                minFontSize: '84px'
            });
        },

        toggleNavMenu: function() {
            if (el.$navPrimaryMenu.hasClass('is-hidden')) {
                $('.page-footer').css({
                    'display': 'none'
                });
                el.$pageWindow.addClass('no-scroll');
                el.$navPrimary.addClass('nav-primary__menu--on');
                el.$navToggle.html('CLOSE <span>×</span>');
                el.$navPrimaryMenu.css({
                    'display': 'block'
                });
                setTimeout(function() {
                    el.$navPrimaryMenu.removeClass('is-hidden');
                }, 30);

            } else {
                $('.page-footer').css({
                    'display': 'block'
                });
                el.$pageWindow.removeClass('no-scroll');
                el.$navPrimary.removeClass('nav-primary__menu--on');
                el.$navToggle.html('MENU <span>☰</span>');
                el.$navPrimaryMenu
                    .addClass('is-hidden')
                    .one('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', function(ev) {
                        el.$navPrimaryMenu.css({
                            'display': 'none'
                        });
                        el.$navPrimaryMenu.off('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd');
                        ev.stopPropagation();
                    });
            }
        },

        setHeaderHeight: function() {
            var winHeight = $(window).height(),
                pageHeader = $('.page-header'),
                downArrow = $('.scroll-down-arrow');

            // if (pageHeader.height() > winHeight && winHeight > 900) {
            //   console.log('header is taller than window');
            //   pageHeader.css(
            //     'max-height', winHeight
            //   );
            // }

            // 'scroll down' arrow
            setTimeout(function() {
                if (downArrow.hasClass('hidden') && pageHeader.height() > winHeight && $(window).scrollTop() <= 1) {
                    downArrow.removeClass('hidden');
                }
            }, 7000);
        },

        setWaypoints: function() {
            $('.dormant').waypoint(function() {
                var $this = $(this);
                if ($this.hasClass('dormant')) {
                    $(this).waypoint('disable').removeClass('dormant');
                }
            }, {
                offset: '67%'
            });

            $.waypoints('below');
        },

        initJobScoreWidget: function() {
            (function(d, s, c) {
                if (window._jobscore_loader) {
                    return;
                } else {
                    window._jobscore_loader = true;
                }
                var o = d.createElement(s);
                o.type = 'text/javascript';
                o.async = true;
                var sc = d.getElementsByTagName(s)[0];
                sc.parentNode.insertBefore(o, sc);
                o.src = ('https:' === d.location.protocol ? 'https:' : 'http:') + '//www.jobscore.com/jobs/' + c + '/widget.js';
            })(document, 'script', 'redbeacon');
        },

        debounce: function(func, timer) {
            var timeoutID;
            return function() {
                var scope = this,
                    args = arguments;
                clearTimeout(timeoutID);
                timeoutID = setTimeout(function() {
                    func.apply(scope, Array.prototype.slice.call(args));
                }, timer);
            };
        }
    };
    TechshedCo.init();
})();
