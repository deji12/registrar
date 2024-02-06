(function ($) {

    'use restrict';

    $(window).resize(navResize);
    $(document).on('click', '.tlp-single-item-popup' ,function (e) {
        e.preventDefault();
        var current,
            $this = $(this),
            $ids = $this.parents('.tlp-team-wrap').find(".tlp-team-item-count");
        var baseURL = "index.php?option=com_tlpteam&task=singleItem&format=raw";
        current = $(this).attr("data-id");
        var itemArray;
        if ($ids.length) {
            itemArray = $ids.find("span").map(function () {
                return $(this).text();
            }).get();
        }
        $.ajax({
            type: "post",
            url: baseURL,
            data: "id=" + current,
            beforeSend: function () {
                initPopup();
                setLevel(current, itemArray);
            },
            success: function (data) {
                $("#tlp-popup-wrap .tlp-popup-content").html(data);
            },
            error: function () {
                $("#tlp-popup-wrap .tlp-popup-content").html("<p>Loading error!!!</p>");
            }
        });

        $(document).on('click', '.tlp-popup-next', function () {
            var nextId = nextItem(current, itemArray);
            current = nextId;
            $.ajax({
                type: "post",
                url: baseURL,
                data: "id=" + current,
                beforeSend: function () {
                    setLevel(current, itemArray);
                    $('#tlp-popup-wrap .tlp-popup-content').html('<div class="tlp-popup-loading"></div>');
                },
                success: function (data) {
                    $('#tlp-popup-wrap .tlp-popup-content').html(data);
                }
            });
        });
        $(document).on('click', '.tlp-popup-prev', function () {
            var prevId = prevItem(current, itemArray);
            current = prevId;
            $.ajax({
                type: "post",
                url: baseURL,
                data: "id=" + current,
                beforeSend: function () {
                    setLevel(current, itemArray);
                    $('#tlp-popup-wrap .tlp-popup-content').html('<div class="tlp-popup-loading"></div>');
                },
                success: function (data) {
                    $('#tlp-popup-wrap .tlp-popup-content').html(data);
                }
            });
        });
        $(document).on('click', '.tlp-popup-close', function () {
            animation();
        });

        return false;
    });
    /* Fixing for hover effect at IOS */
    $('*').on('touchstart', function () {
        $(this).trigger('hover');
    }).on('touchend', function () {
        $(this).trigger('hover');
    });
    /* progress bar */
    progressBarList();

    /* isotope */
    $('.tlp-team-wrap').each(function () {
        var container = $(this),
            $isotop = $('.tlp-team-grid', container),
            $button_group = $('.filter-button-group', container),
            temp_filterValue = $button_group.find('button.selected').attr('data-filter'),
            filterValue = typeof(temp_filterValue) != 'undefined' && temp_filterValue != '' ? temp_filterValue : '*';
        console.log(temp_filterValue);
        $isotop = $('.tlp-team-grid').imagesLoaded(function () {

            $isotop.isotope({
                // options
                itemSelector: '.team-item',
                layoutMode: 'fitRows',
                filter: filterValue,
            });
        });
        $button_group.on('click', 'button', function () {
            filterValue = $(this).attr('data-filter');
            $isotop.isotope({filter: filterValue});
            $(this).parent().find('.selected').removeClass('selected');
            $(this).addClass('selected');
        });
    });

    /* special layout */

    $(".rt-special-wrapper").each(function () {
        var container = $(this),
            selected = container.find('.special-items-wrapper .rt-grid-item.selected'),
            selectedId = selected.attr('data-id'),
            baseURL = "index.php?option=com_tlpteam&task=getSpecialSelectedData&format=raw",
            target = container.find('#special-selected-wrapper'),
            html_loading = '<div class="rt-loading-overlay"></div><div class="rt-loading rt-ball-clip-rotate"><div></div></div>',
            specialLayoutEqualHeight = function () {
                var target = $('.special-selected-top-wrap > .img');
                target.imagesLoaded(function () {
                    var imgHeight = target.outerHeight();
                    $('.special-selected-top-wrap .ttp-label, .special-selected-bottom-wrap').height(imgHeight);
                });
            },
            scrollToTopMember = function () {
                if ($(window).width() < 768) {
                    $('html, body').animate({
                        scrollTop: $('#special-selected-wrapper').offset().top - 35
                    }, 200);
                }
            },
            placeholder_loading = function () {
                if (container.find('.rt-loading-overlay').length == 0) {
                    container.addClass('ttp-pre-loader');
                    container.append(html_loading);
                }
            },
            remove_placeholder_loading = function () {
                container.find('.rt-loading-overlay, .rt-loading').remove();
                container.removeClass('ttp-pre-loader');
            };
        selected.remove();

        if (selectedId) {
            $.ajax({
                    url: baseURL,
                    type: 'POST',
                    data: "memberId=" + selectedId,
                    cache: false,
                    beforeSend: function () {
                        placeholder_loading();
                    },
                    success: function (data) {
                        var response = $.parseJSON(data);
                        if (!response.data.error) {
                            target.html(response.data.data);
                            target.attr('data-id', selectedId);
                            specialLayoutEqualHeight();
                            remove_placeholder_loading();
                        }
                    },
                    error: function (data) {
                        console.log(data);
                        remove_placeholder_loading();
                    }
                }
            );
        }

        $(document).on('click', '.single-team-item.image-wrapper', function () {
            var self = $(this),
                memberId = self.attr('data-id'),
                toggleId = target.attr('data-id');
            $.ajax({
                    url: baseURL,
                    type: 'POST',
                    data: "memberId=" + memberId + "&toggleId=" + toggleId,
                    cache: false,
                    beforeSend: function () {
                        placeholder_loading();
                    },
                    success: function (data) {
                        var response = $.parseJSON(data);
                        if (!response.data.error) {
                            target.attr('data-id', memberId);
                            target.html(response.data.data);
                            self.attr('data-id', toggleId);
                            self.parent().attr('data-id', toggleId);
                            self.html("<img class='img-responsive' src='" + response.data.toggle_image_src + "' />");
                            specialLayoutEqualHeight();
                            remove_placeholder_loading();
                            scrollToTopMember();
                        }
                    },
                    error: function (data) {
                        console.log(data);
                        remove_placeholder_loading();
                    }
                }
            );
        });

        $(window).on('resize', function () {
            specialLayoutEqualHeight();
        });
    });


    $(window).resize(heightResize);

    $(window).load(function () {
        heightResize();
    })

    /*Start from here */

})(jQuery);


function initPopup() {
    var html = '<div id="tlp-popup-wrap" class="tlp-popup-wrap tlp-popup-singlePage-sticky tlp-popup-singlePage">' +
        '<div class="tlp-popup-content">' +
        '<div class="tlp-popup-loading"></div>' +
        '</div>' +
        '<div class="tlp-popup-navigation-wrap">' +
        '<div class="tlp-popup-navigation">' +
        '<div class="tlp-popup-prev" title="Previous (Left arrow key)" data-action="prev"></div>' +
        '<div class="tlp-popup-close" title="Close (Esc arrow key)" data-action="close"></div>' +
        '<div class="tlp-popup-next" title="Next (Right arrow key)" data-action="next"></div>' +
        '<div class="tlp-popup-singlePage-counter"><span class="ccurrent"></span> of <span class="ctotal"></span></div>' +
        '</div>' +
        '</div>' +
        '</div>';
    jQuery("body").append(html);
    var wWidth = jQuery(window).width();
    var $pHolder = jQuery('#tlp-popup-wrap');
    $pHolder.css('display', 'block');
    var navHeight = $pHolder.find('.tlp-popup-navigation-wrap').height();
    $pHolder.find('.tlp-popup-content').css('padding-top', navHeight + "px");
    animation();
}

function animation() {
    var $pHolder = jQuery('#tlp-popup-wrap');
    jQuery('body').addClass('rt-body');
    $pHolder.animate({
        marginLeft: parseInt($pHolder.css('marginLeft'), 10) == 0 ?
            $pHolder.outerWidth() : 0,
    }).promise().done(function () {
        if (parseInt($pHolder.css('marginLeft')) > 0) {
            jQuery('body').removeClass('rt-body');
            jQuery('#tlp-popup-wrap').remove();
        }
    });
}

function nextItem(current, list) {
    var index = list.indexOf(current);
    index++;
    if (index >= list.length)
        index = 0;
    return list[index];
}

function prevItem(current, list) {
    var index = list.indexOf(current);
    index--;
    if (index < 0)
        index = list.length - 1;
    return list[index];
}

function setLevel(current, list) {
    var index = list.indexOf(current) + 1;
    var count = list.length;
    jQuery(".ccurrent").text(index);
    jQuery(".ctotal").text(count);
}

function loadFotorama() {
    if (jQuery('.fotorama').length) {
        var $fotorama = jQuery('.fotorama').fotorama({
            width: "700",
            nav: 'thumbs'
        });
    }
}

function navResize() {
    var wWidth = jQuery(window).width();
    var $pHolder = jQuery('#tlp-popup-wrap');
    $pHolder.css('display', 'block');
    $pHolder.find('.tlp-popup-navigation-wrap').css('width', wWidth + "px");
    $pHolder.find('.tlp-popup-navigation').css('width', wWidth + "px");
}

function progressBarList() {
    jQuery('.tlp-team-skill').find('.fill').css('width', '0%');
    jQuery(window).bind('load', function () {
        jQuery('.tlp-team-skill').each(function () {
            jQuery(this).find('.fill').each(function () {
                var k = 0, f = jQuery(this), p = f.attr('data-progress-animation'), w = f.width();
                if (w == 0) {
                    var go = function () {
                        return k >= p || k >= 100 ? ( false ) : ( k += 1, f.css('width', k + '%'), setTimeout(go, 20) )
                    };
                    go();
                }
            });
        });
    });
}

function progressBarSingle() {
    jQuery('.tlp-team-skill').find('.fill').css('width', '0%');
    jQuery('.tlp-team-skill').each(function () {
        jQuery(this).find('.fill').each(function () {
            var k = 0, f = jQuery(this), p = f.attr('data-progress-animation'), w = f.width();
            if (w == 0) {
                var go = function () {
                    return k >= p || k >= 100 ? ( false ) : ( k += 1, f.css('width', k + '%'), setTimeout(go, 20) )
                };
                go();
            }
        });
    });
}


function heightResize() {
    var maxH = 0;
    jQuery(".tlp-team .tlp-equal-height").height("auto");
    jQuery(".tlp-team .tlp-equal-height").each(function () {
        var cH = jQuery(this).height();
        if (cH > maxH) {
            maxH = cH;
        }

    });

    jQuery(".tlp-team .tlp-equal-height").css('height', maxH + "px");
}