(function ($) {

    $.fn.parallax = function (options) {
        var windowHeight = $(window).height()

        // Establish default settings
        var settings = $.extend({
            speed: 0.15,
        }, options)

        // Iterate over each object in collection
        return this.each(function () {

            // Save a reference to the element
            var $this = $(this)

            // Set up Scroll Handler
            $(document).scroll(function () {

                var scrollTop = $(window).scrollTop()
                var offset = $this.offset().top
                var height = $this.outerHeight()

                // Check if above or below viewport
                if (offset + height <= scrollTop ||
                    offset >= scrollTop + windowHeight) {
                    return
                }

                var yBgPosition = Math.round((offset - scrollTop) * settings.speed)

                // Apply the Y Background Position to Set the Parallax Effect
                $this.css('background-position', 'center ' + yBgPosition + 'px')

            })
        })
    }

    $('.main-slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: true
    })

    $('.products').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: '30px',
        arrows: false,
        dots: false,
        mobileFirst: true,
        responsive: [
            {
                breakpoint: 480,
                settings: 'unslick'
            }
        ]
    })

    $('.input-date').datepicker()

    $('select').niceSelect();

}(jQuery))

if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent))) {
    $('.parallax').parallax({
        speed: 0.2,
    })

}

$('.back-to-top').on('click', function () {
    $('html, body').animate({
        scrollTop: 0,
    }, 700)
})

$(window).scroll(function () {

    var scroll = $(window).scrollTop()
    var windowHeight = $(window).height()

    if (scroll > windowHeight / 2) {
        $('.back-to-top').addClass('back-to-top_active')
    } else {
        $('.back-to-top').removeClass('back-to-top_active')
    }

})