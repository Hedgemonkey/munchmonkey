// FILE: booking/static/booking/js/datepicker_init.js

document.addEventListener('DOMContentLoaded', function() {
    $('#id_location').on('change', function() {
        $('#id_date').val('');
        $('#datepicker-container').datepicker('clearDates');
        highlightDatesForLocation();
        filterEvents();
    });

    $('#datepicker-container').datepicker({
        beforeShowDay: function(date) {
            const dateString = $.fn.datepicker.DPGlobal.formatDate(date, 'yyyy-mm-dd', 'en');
            if (availableDates.includes(dateString)) {
                return {
                    classes: 'highlight',
                    tooltip: 'Available'
                };
            }
            return {};
        },
        format: 'yyyy-mm-dd',
        todayHighlight: true,
        autoclose: true,
        inline: true
    }).on('changeDate', function(e) {
        $('#id_date').val(e.format('yyyy-mm-dd')).trigger('change');
        filterEvents();
    });

    $('#reset-button').on('click', function() {
        $('#id_location').val('');
        $('#id_date').val('');
        $('#datepicker-container').datepicker('clearDates');
        filterEvents();
    });

    function highlightDatesForLocation() {
        const location = $('#id_location').val();
        const datesForLocation = availableDates.filter(date => {
            return $('.event-card[data-location="' + location + '"][data-date="' + date + '"]').length > 0;
        });

        $('#datepicker-container').datepicker('update');
        $('#datepicker-container td.day').each(function() {
            const date = $(this).text().padStart(2, '0');
            const month = ($(this).data('month') + 1).toString().padStart(2, '0');
            const year = $(this).data('year');
            const fullDate = `${year}-${month}-${date}`;
            if (datesForLocation.includes(fullDate)) {
                $(this).addClass('bordered-date');
            } else {
                $(this).removeClass('bordered-date');
            }
        });
    }

    function filterEvents() {
        const location = $('#id_location').val();
        const date = $('#id_date').val();
        $('.event-card').each(function() {
            const cardLocation = $(this).data('location');
            const cardDate = $(this).data('date');
            const matchesLocation = !location || cardLocation === location;
            const matchesDate = !date || cardDate === date;
            if (matchesLocation && matchesDate) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // Initial load
    filterEvents();
});