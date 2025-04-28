$(document).ready(function() {
    // Navbar toggle
    $('#menu-icon').click(function() {
        $('.navbar').toggleClass('active');
    });

    // Remove navbar active on scroll
    $(window).scroll(function() {
        $('.navbar').removeClass('active');
    });

    // Dark Mode toggle
    $('#darkmode').click(function() {
        if ($(this).hasClass('bx-moon')) {
            $(this).removeClass('bx-moon').addClass('bx-sun');
            $('body').addClass('darkmode-active');
        } else {
            $(this).removeClass('bx-sun').addClass('bx-moon');
            $('body').removeClass('darkmode-active');
        }
    });

    // Tab Switching
    $('.tab-btn').click(function() {
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');

        const tabId = $(this).data('tab');
        $('.detection-form').removeClass('active');
        $(`#${tabId}`).addClass('active');

        $('#results').hide().empty();
    });

    // Online Payment Form Submission
    $('#onlinePaymentForm').submit(function(e) {
        e.preventDefault();

        $('#results').html(`
            <div class="loading-spinner">
                <i class='bx bx-loader-alt bx-spin'></i> Analyzing...
            </div>
        `).show();

        const formData = {
            type: $('#payment-type').val(),
            amount: $('#payment-amount').val(),
            oldbalanceOrg: $('#old-balance').val(),
            newbalanceOrig: $('#new-balance').val()
        };

        $.post('/predict_online_payment', formData, function(response) {
            displayOnlinePaymentResult(response);
        }).fail(function() {
            $('#results').html(`
                <div class="result-card error">
                    <h3>Error</h3>
                    <p>Something went wrong!</p>
                </div>
            `);
        });
    });

    // Credit Card Form Submission
    $('#creditCardForm').submit(function(e) {
        e.preventDefault();

        $('#results').html(`
            <div class="loading-spinner">
                <i class='bx bx-loader-alt bx-spin'></i> Analyzing...
            </div>
        `).show();

        const formData = { amount: $('#amount').val() };
        for (let i = 1; i <= 28; i++) {
            formData[`V${i}`] = $(`#v${i}`).val();
        }

        $.post('/predict_credit_card', formData, function(response) {
            displayCreditCardResult(response);
        }).fail(function() {
            $('#results').html(`
                <div class="result-card error">
                    <h3>Error</h3>
                    <p>Something went wrong!</p>
                </div>
            `);
        });
    });

    // Display Online Payment Result
    function displayOnlinePaymentResult(data) {
        if (data.isFraud) {
            $('#results').html(`
                <div class="result-card fraud">
                    <h3><i class='bx bx-error'></i> Fraud Detected!</h3>
                    <p><strong>Amount:</strong> ₹${data.amount}</p>
                    <p><strong>Old Balance:</strong> ₹${data.oldbalanceOrg}</p>
                    <p><strong>New Balance:</strong> ₹${data.newbalanceOrig}</p>
                    <p class="confidence"><strong>Confidence:</strong> ${data.confidence}%</p>
                    <p>${data.message}</p>
                </div>
            `).show();
        } else {
            $('#results').html(`
                <div class="result-card safe">
                    <h3><i class='bx bx-check-circle'></i> No Fraud Detected</h3>
                    <p><strong>Amount:</strong> ₹${data.amount}</p>
                    <p class="confidence"><strong>Confidence:</strong> ${data.confidence}%</p>
                    <p>${data.message}</p>
                </div>
            `).show();
        }
    }

    // Display Credit Card Result
    function displayCreditCardResult(data) {
        if (data.isFraud) {
            $('#results').html(`
                <div class="result-card fraud">
                    <h3><i class='bx bx-error'></i> Fraud Detected!</h3>
                    <p><strong>Amount:</strong> ₹${data.amount}</p>
                    <p class="confidence"><strong>Confidence:</strong> ${data.confidence}%</p>
                    <p>${data.message}</p>
                    <div class="important-features">
                        <h4>Important Features:</h4>
                        ${data.top_features.map(f => `
                            <p><strong>${f.name}:</strong> ${f.value}</p>
                        `).join('')}
                    </div>
                </div>
            `).show();
        } else {
            $('#results').html(`
                <div class="result-card safe">
                    <h3><i class='bx bx-check-circle'></i> Transaction Approved</h3>
                    <p><strong>Amount:</strong> ₹${data.amount}</p>
                    <p class="confidence"><strong>Confidence:</strong> ${data.confidence}%</p>
                    <p>${data.message}</p>
                </div>
            `).show();
        }
    }
});
