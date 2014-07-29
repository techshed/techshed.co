/* jshint camelcase: false */
/* global NProgress, FastClick */

(function() {
    'use strict';

    var el, page, timer, TechshedCo = {

        siteElements: {
            // Nav
            $navPrimary: $('.nav-primary'),
            $navToggle: $('.nav-primary__menu-toggle'),
            $navPrimaryMenu: $('.nav-primary__menu'),
            $navPrimaryMenuLg: $('.nav-primary__menu--lg'),
            $navPrimaryLink: $('.nav-primary__link'),
            $pageWindow: $('#pages-container')
        },

        init: function() {
            window.TechshedCo = this;
            TechshedCo = this;
            el = TechshedCo.siteElements;
            page = TechshedCo.getCurrentPath();
            FastClick.attach(document.body);
            NProgress.configure({
                trickleRate: 0.01,
                trickleSpeed: 100,
                minimum: 0.7
            });
            TechshedCo.bindEvents();
            TechshedCo.showPage(page);
            el.$navPrimary.addClass('visible');
        },

        getCurrentPath: function() {
            return window.location.pathname.split('/').pop().replace(/[^a-z0-9\s]/gi, '');
        },

        bindEvents: function() {
            // nav toggle
            el.$navToggle.on('click', function(ev) {
                // Prevent multiple clicks within .4s window
                if (!$(this).data('isClicked')) {
                    TechshedCo.toggleNavMenu();
                    var link = $(this);
                    link.data('isClicked', true);
                    setTimeout(function() {
                        link.removeData('isClicked');
                    }, 600);
                }
                ev.preventDefault();
            });

            // primary nav link
            el.$navPrimaryLink.on('click', function(ev) {
                ev.preventDefault();
                var $this = $(this),
                    page = $this.attr('class').split(' ')[0],
                    path = TechshedCo.getCurrentPath();

                if (page === 'logo') { page = 'home'; }

                // ~~~~~~ mobile nav logic (need to refactor) ~~~~~~
                if ($this.parents().hasClass('nav-primary__menu')) {
                    TechshedCo.toggleNavMenu();
                }
                // if menu is open, tapping the logo will hide it
                if ($this.hasClass('logo') && !el.$navPrimaryMenu.hasClass('is-hidden')) {
                    TechshedCo.toggleNavMenu();
                }
                // check if already on page
                if (path === page) {

                } else{
                    // update path in address bar
                    history.pushState({}, '', '/' + page);
                    TechshedCo.showPage(page);
                }
            });

            // enable back button via HTML5 pop state
            $(window).on('popstate', function(ev) {
                ev.preventDefault();
                var path = TechshedCo.getCurrentPath();
                TechshedCo.showPage(path);
            });

            // disable all transitions when window is being resized
            $(window).on('resize', TechshedCo.debounce(function() {
                clearInterval(timer);
                $('body').addClass('no-transitions');
                timer = setTimeout(function() {
                    $('body').removeClass('no-transitions');
                }, 1000);
            }, 0));
        },

        showPage: function(page) {
                    if (page === '') { page = 'home'; }
                    var pageContainer = $( '#page-' + page);

                    // underline nav link
                    $('.' + page).addClass('active').siblings().removeClass('active');

                    // check if page already loaded, else go load it first
                    if($('#page-' + page).length){
                        TechshedCo.toggleVideoPlaying(page);
                        pageContainer.removeClass().addClass('is-visible');
                        pageContainer.siblings().removeClass().addClass('is-hidden');
                        // el.$pageWindow.height(pageContainer.height());

                        // set body class
                        if (page === 'home') {
                            TechshedCo.fitText();
                            $('body').removeClass().addClass('home');

                            $('#video-bg').on('loadedmetadata', function() {
                                $(this).removeClass('is-hidden');
                            });
                            // remove video poster after play to avoid loop flicker
                            $('#video-bg').on('playing', function() {
                                $(this).attr('poster', '');
                            });



                            // disable video if device is mobile
                            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                              $('#video-bg').remove();
                            }
                        } else {
                            // init general subpage
                            $('body').removeClass().addClass(page + ' subpage');
                        }
                        // page doesn't exist yet so let's go load it
                    } else{
                        TechshedCo.loadPage(page);
                    }
                },

        loadPage: function(page) {
                    // loading bar start
                    NProgress.start();
                    // path to html
                    var pageHtml = ('/pages/' + page + '.html');

                    // create page container
                    var pageContainer = $( '<div id=page-' + page + ' class="is-hidden" />');
                    el.$pageWindow.append(pageContainer);

                    // load & append html into unique page container
                    pageContainer.load(pageHtml, function(response, status) {
                        if (status === 'error') {
                            pageContainer.remove();
                            TechshedCo.showPage('error');
                        } else{
                            TechshedCo.showPage(page);
                        }
                        if (page === 'jobs') {
                            TechshedCo.initJobScoreWidget();
                        }
                        pageContainer.find('p').unorphanize(1);
                        TechshedCo.setWaypoints();
                        NProgress.done();
                    });
                },

        fitText: function() {
          setTimeout(function() {
            $('.fit-text').css('opacity','1').fitText(0.697, {
                minFontSize: '84px'
            });
          }, 40);

        },

        toggleNavMenu: function() {
            if (el.$navPrimaryMenu.hasClass('is-hidden')) {

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

        toggleVideoPlaying: function(page) {
            var video = $('#video-bg');

            setTimeout( function() {
                if((page === 'home')){
                    video[0].play();
                } else{
                    video[0].pause();
                }
            }, 100);

        },

        setHeaderHeight: function() {
            var winHeight = $(window).height(),
                pageHeader = $('.page-header');

            if (pageHeader.height() > winHeight && winHeight > 900) {

              pageHeader.css(
                'max-height', winHeight
              );
            }
        },

        setWaypoints: function() {
            $.waypoints('below');
            $('.dormant').waypoint(function() {
                var $this = $(this);
                if ($this.hasClass('dormant')) {
                    $(this).waypoint('disable').removeClass('dormant');
                }
            }, {
                offset: '67%'
            });
        },

        initJobScoreWidget: function() {
            (function(d, s, c) {
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
