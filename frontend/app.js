const API_URL = "http://127.0.0.1:8000";


// ==================================================
// FORM SUBMISSION
// ==================================================

const predictionForm =
    document.getElementById("predictionForm");


if (predictionForm) {

    predictionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const button =
                document.getElementById("predictButton");


            // ==================================================
            // GET INPUT VALUES
            // ==================================================

            const rainfall_mm_hr = Number(
                document.getElementById("rainfall_mm_hr").value
            );

            const elevation_m = Number(
                document.getElementById("elevation_m").value
            );

            const slope_degree = Number(
                document.getElementById("slope_degree").value
            );

            const latitude = Number(
                document.getElementById("latitude").value
            );

            const longitude = Number(
                document.getElementById("longitude").value
            );

            const rain_1h = Number(
                document.getElementById("rain_1h").value
            );

            const rain_3h = Number(
                document.getElementById("rain_3h").value
            );

            const rain_6h = Number(
                document.getElementById("rain_6h").value
            );

            const rain_12h = Number(
                document.getElementById("rain_12h").value
            );

            const rain_24h = Number(
                document.getElementById("rain_24h").value
            );

            const rainfall_change = Number(
                document.getElementById("rainfall_change").value
            );


            // ==================================================
            // VALIDATE VALUES
            // ==================================================

            const values = [
                rainfall_mm_hr,
                elevation_m,
                slope_degree,
                latitude,
                longitude,
                rain_1h,
                rain_3h,
                rain_6h,
                rain_12h,
                rain_24h,
                rainfall_change
            ];


            if (
                values.some(
                    value => !Number.isFinite(value)
                )
            ) {

                showError(
                    "Please enter valid numeric values in all fields."
                );

                return;
            }


            // ==================================================
            // VALIDATE LOCATION
            // ==================================================

            if (
                latitude < -90 ||
                latitude > 90
            ) {

                showError(
                    "Latitude must be between -90 and 90."
                );

                return;
            }


            if (
                longitude < -180 ||
                longitude > 180
            ) {

                showError(
                    "Longitude must be between -180 and 180."
                );

                return;
            }


            // ==================================================
            // UPDATE LOCATION DISPLAY
            // ==================================================

            const locationDisplay =
                document.getElementById("locationDisplay");


            if (locationDisplay) {

                locationDisplay.textContent =
                    `📍 ${latitude.toFixed(8)}, ${longitude.toFixed(8)}`;
            }


            // ==================================================
            // UPDATE RAINFALL SUMMARY
            // ==================================================

            updateRainfallSummary({
                rainfall_mm_hr,
                rain_1h,
                rain_3h,
                rain_6h,
                rain_12h,
                rain_24h
            });


            // ==================================================
            // LOADING STATE
            // ==================================================

            button.disabled = true;

            button.innerHTML = `
                <span>⏳</span>
                Predicting...
            `;


            try {

                // ==================================================
                // SEND REQUEST TO FASTAPI
                // ==================================================

                const response = await fetch(
                    `${API_URL}/predict`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            rainfall_mm_hr:
                                rainfall_mm_hr,

                            elevation_m:
                                elevation_m,

                            slope_degree:
                                slope_degree,

                            rain_1h:
                                rain_1h,

                            rain_3h:
                                rain_3h,

                            rain_6h:
                                rain_6h,

                            rain_12h:
                                rain_12h,

                            rain_24h:
                                rain_24h,

                            rainfall_change:
                                rainfall_change

                        })
                    }
                );


                // ==================================================
                // API ERROR
                // ==================================================

                if (!response.ok) {

                    const errorText =
                        await response.text();

                    throw new Error(
                        `API error ${response.status}: ${errorText}`
                    );
                }


                // ==================================================
                // READ RESULT
                // ==================================================

                const result =
                    await response.json();


                console.log(
                    "Prediction result:",
                    result
                );


                // ==================================================
                // DISPLAY RESULT
                // ==================================================

                displayResult(result);


                // ==================================================
                // SAVE TO HISTORY
                // ==================================================

                savePredictionToHistory(
                    result,
                    {
                        latitude,
                        longitude,
                        rainfall_mm_hr
                    }
                );

            }


            catch (error) {

                console.error(
                    "Prediction error:",
                    error
                );

                showError(
                    error.message
                );

            }


            finally {

                button.disabled = false;

                button.innerHTML = `
                    <span>⚡</span>
                    Predict Flood Risk
                `;
            }

        }
    );
}


// ==================================================
// UPDATE RAINFALL SUMMARY
// ==================================================

function updateRainfallSummary(data) {

    const fields = {

        summaryCurrent:
            data.rainfall_mm_hr,

        summary1h:
            data.rain_1h,

        summary3h:
            data.rain_3h,

        summary6h:
            data.rain_6h,

        summary12h:
            data.rain_12h,

        summary24h:
            data.rain_24h

    };


    Object.entries(fields).forEach(
        ([id, value]) => {

            const element =
                document.getElementById(id);

            if (element) {

                element.textContent =
                    Number(value).toFixed(6);
            }

        }
    );
}


// ==================================================
// DISPLAY PREDICTION RESULT
// ==================================================

function displayResult(result) {

    const container =
        document.getElementById("resultContainer");


    if (!container) {

        console.error(
            "resultContainer not found."
        );

        return;
    }


    const probability =
        Number(result.flood_probability) * 100;


    const probabilityText =
        probability.toFixed(2);


    const isFlood =
        Number(result.prediction) === 1;


    const risk =
        String(result.risk_level || "LOW")
        .toLowerCase();


    container.innerHTML = `

        <div class="result-content">

            <div class="result-icon">
                ${isFlood ? "⚠️" : "✅"}
            </div>


            <div class="risk-label">
                RISK LEVEL
            </div>


            <h2 class="result-risk ${risk}">
                ${result.risk_level}
            </h2>


            <p class="result-label">

                ${
                    isFlood
                        ? "Flood conditions detected"
                        : "No significant flood conditions detected"
                }

            </p>


            <div class="probability-box">

                <strong class="probability-value">
                    ${probabilityText}%
                </strong>


                <span class="probability-label">
                    Flood Probability
                </span>

            </div>


            <div class="prediction-status">

                <span>
                    Model Prediction
                </span>


                <strong>
                    ${
                        isFlood
                            ? "FLOOD"
                            : "NO FLOOD"
                    }
                </strong>

            </div>

        </div>
    `;
}


// ==================================================
// SHOW ERROR
// ==================================================

function showError(message) {

    const container =
        document.getElementById("resultContainer");


    if (!container) {

        console.error(message);

        return;
    }


    container.innerHTML = `

        <div class="result-placeholder">

            <div class="placeholder-icon">
                ❌
            </div>


            <h3>
                Prediction Failed
            </h3>


            <p>
                Unable to complete the prediction.
            </p>


            <small>
                ${message}
            </small>

        </div>
    `;
}


// ==================================================
// SAVE PREDICTION HISTORY
// ==================================================

function savePredictionToHistory(
    result,
    inputData
) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "floodPredictionHistory"
            ) || "[]"
        );


    const prediction = {

        time:
            new Date().toLocaleString(),

        latitude:
            inputData.latitude,

        longitude:
            inputData.longitude,

        rainfall:
            inputData.rainfall_mm_hr,

        probability:
            result.flood_probability,

        risk:
            result.risk_level,

        prediction:
            result.prediction

    };


    history.unshift(prediction);


    const latestHistory =
        history.slice(0, 10);


    localStorage.setItem(
        "floodPredictionHistory",
        JSON.stringify(latestHistory)
    );


    displayPredictionHistory();
}


// ==================================================
// DISPLAY PREDICTION HISTORY
// ==================================================

function displayPredictionHistory() {

    const container =
        document.getElementById(
            "predictionHistory"
        );


    if (!container) {

        return;
    }


    const history =
        JSON.parse(
            localStorage.getItem(
                "floodPredictionHistory"
            ) || "[]"
        );


    if (history.length === 0) {

        container.innerHTML = `

            <div class="history-empty">

                <div class="history-empty-icon">
                    📊
                </div>


                <h3>
                    No predictions yet
                </h3>


                <p>
                    Your recent predictions
                    will appear here.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        history.map(
            item => {

                const probability =
                    (
                        Number(item.probability) * 100
                    ).toFixed(2);


                const isFlood =
                    Number(item.prediction) === 1;


                const risk =
                    String(item.risk || "LOW")
                    .toLowerCase();


                return `

                    <div class="history-item">

                        <div class="history-main">

                            <div class="
                                history-risk
                                ${risk}
                            ">

                                ${
                                    isFlood
                                        ? "⚠️"
                                        : "✅"
                                }

                                ${item.risk}

                            </div>


                            <div class="history-location">

                                📍

                                ${Number(
                                    item.latitude
                                ).toFixed(6)},

                                ${Number(
                                    item.longitude
                                ).toFixed(6)}

                            </div>


                            <div class="history-time">

                                ${item.time}

                            </div>

                        </div>


                        <div class="history-details">

                            <div>

                                <span>
                                    Rainfall
                                </span>

                                <strong>
                                    ${Number(
                                        item.rainfall
                                    ).toFixed(2)}
                                    mm/hr
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Probability
                                </span>

                                <strong>
                                    ${probability}%
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Result
                                </span>

                                <strong>
                                    ${
                                        isFlood
                                            ? "FLOOD"
                                            : "NO FLOOD"
                                    }
                                </strong>

                            </div>

                        </div>

                    </div>

                `;

            }
        ).join("");
}


// ==================================================
// CLEAR HISTORY
// ==================================================

const clearHistoryButton =
    document.getElementById(
        "clearHistoryButton"
    );


if (clearHistoryButton) {

    clearHistoryButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "floodPredictionHistory"
            );


            displayPredictionHistory();

        }
    );
}


// ==================================================
// LOAD HISTORY
// ==================================================

displayPredictionHistory();