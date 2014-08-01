/* jshint camelcase: false */
/* global NProgress, FastClick */

var TechshedCo = (function() {
    'use strict';

    var $navPrimary     = $('.nav-primary'),
        $navToggle      = $('.nav-primary__menu-toggle'),
        $navPrimaryMenu = $('.nav-primary__menu'),
        $navPrimaryLink = $('.nav-primary__link'),
        $pageWindow     = $('#pages-container'),
        page,
        timer;

    function init() {
        page = getCurrentPath();
        FastClick.attach(document.body);
        NProgress.configure({
            trickleRate: 0.01,
            trickleSpeed: 100,
            minimum: 0.7
        });
        bindEvents();
        showPage(page);
        $navPrimary.addClass('visible');
    }

    function getCurrentPath() {
        return window.location.pathname.split('/').pop().replace(/[^a-z0-9\s]/gi, '');
    }

    function bindEvents() {
        // nav toggle
        $navToggle.on('click', function(ev) {
            // Prevent multiple clicks within .4s window
            if (!$(this).data('isClicked')) {
                toggleNavMenu();
                var link = $(this);
                link.data('isClicked', true);
                setTimeout(function() {
                    link.removeData('isClicked');
                }, 600);
            }
            ev.preventDefault();
        });

        // primary nav link
        $navPrimaryLink.on('click', function(ev) {
            ev.preventDefault();
            var $this = $(this),
                page = $this.attr('class').split(' ')[0],
                path = getCurrentPath();

            if (page === 'logo') { page = 'home'; }

            // ~~~~~~ mobile nav logic (need to refactor) ~~~~~~
            if ($this.parents().hasClass('nav-primary__menu')) {
                toggleNavMenu();
            }
            // if menu is open, tapping the logo will hide it
            if ($this.hasClass('logo') && !$navPrimaryMenu.hasClass('is-hidden')) {
                toggleNavMenu();
            }
            // check if already on page
            if (path === page) {

            } else{
                // update path in address bar
                history.pushState({}, '', '/' + page);
                showPage(page);
            }
        });

        // enable back button via HTML5 pop state
        $(window).on('popstate', function(ev) {
            ev.preventDefault();
            var path = getCurrentPath();
            showPage(path);
        });

        // disable all transitions when window is being resized
        $(window).on('resize', debounce(function() {
            clearInterval(timer);
            $('body').addClass('no-transitions');
            timer = setTimeout(function() {
                $('body').removeClass('no-transitions');
            }, 1000);
        }, 0));
    }

    function showPage(page) {
        if (page === '') { page = 'home'; }
        var pageContainer = $( '#page-' + page);

        // underline nav link
        $('.' + page).addClass('active').siblings().removeClass('active');

        // check if page already loaded, else go load it first
        if($('#page-' + page).length){
            toggleVideoPlaying(page);
            pageContainer.removeClass().addClass('is-visible');
            pageContainer.siblings().removeClass().addClass('is-hidden');
            // $pageWindow.height(pageContainer.height());

            // set body class
            if (page === 'home') {
                fitText();
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
                  $('.dormant').removeClass('dormant');
                }
            } else {
                // init general subpage
                $('body').removeClass().addClass(page + ' subpage');
            }
            // page doesn't exist yet so let's go load it
        } else{
            loadPage(page);
        }
    }

    function loadPage(page) {
        // loading bar start
        NProgress.start();
        // path to html
        var pageHtml = ('/pages/' + page + '.html');

        // create page container
        var pageContainer = $( '<div id=page-' + page + ' class="is-hidden" />');
        $pageWindow.append(pageContainer);

        // load & append html into unique page container
        pageContainer.load(pageHtml, function(response, status) {
            if (status === 'error') {
                pageContainer.remove();
                showPage('error');
            } else{
                showPage(page);
            }
            if (page === 'jobs') {
                initJobScoreWidget();
            }
            pageContainer.find('p').unorphanize(1);
            setWaypoints();
            NProgress.done();
        });
    }

    function fitText() {
      setTimeout(function() {
        $('.fit-text').css('opacity','1').fitText(0.697, {
            minFontSize: '84px'
        });
      }, 40);
    }

    function toggleNavMenu() {
        if ($navPrimaryMenu.hasClass('is-hidden')) {
            $pageWindow.addClass('no-scroll');
            $navPrimary.addClass('nav-primary__menu--on');
            $navToggle.html('CLOSE <span>×</span>');
            $navPrimaryMenu.css({
                'display': 'block'
            });
            setTimeout(function() {
                $navPrimaryMenu.removeClass('is-hidden');
            }, 30);

        } else {
            $pageWindow.removeClass('no-scroll');
            $navPrimary.removeClass('nav-primary__menu--on');
            $navToggle.html('MENU <span>☰</span>');
            $navPrimaryMenu
                .addClass('is-hidden')
                .one('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', function(ev) {
                    $navPrimaryMenu.css({
                        'display': 'none'
                    });
                    $navPrimaryMenu.off('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd');
                    ev.stopPropagation();
                });
        }
    }

    function toggleVideoPlaying(page) {
        var video = $('#video-bg');

        setTimeout( function() {
            if((page === 'home')){
                video[0].play();
            } else{
                video[0].pause();
            }
        }, 100);
    }

    function setWaypoints() {
        $.waypoints('below');
        $('.dormant').waypoint(function() {
            var $this = $(this);
            if ($this.hasClass('dormant')) {
                $(this).waypoint('disable').removeClass('dormant');
            }
        }, {
            offset: '67%'
        });
    }

    function initJobScoreWidget() {
        (function(d, s, c) {
            var o = d.createElement(s);
            o.type = 'text/javascript';
            o.async = true;
            var sc = d.getElementsByTagName(s)[0];
            sc.parentNode.insertBefore(o, sc);
            o.src = ('https:' === d.location.protocol ? 'https:' : 'http:') + '//www.jobscore.com/jobs/' + c + '/widget.js';
        })(document, 'script', 'redbeacon');
    }

    function debounce(func, timer) {
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
    init();
})();
