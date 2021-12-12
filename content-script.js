// Regex to extract video ID from YouTube URL.
var REG_EXP = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
var API_KEY /*=  ADD YOUTUBE API KEY HERE */;

/**
 * Extract video ID from URL.
 * @param {String} url [URL of the current tab]
 * @returns {String}
 */
function getIdFromURL(url) {
    var match = url.match(REG_EXP);
    if (match && match[2].length == 11) {
        return match[2];
    } else {
        throw new Error("Not a YouTube URL. Cannot find video id.");
    }
}

/**
 * Get ID of the YouTube video playing on the current tab. 
 * @returns {String} [ID of the video]
 */
function getVideoId() {
    let url = window.location.toString();
    let videoId;
    try {
        videoId = getIdFromURL(url)
    } catch (error) {
        console.log(error);
        return false;
    }
    return videoId;
}


/**
 * Fetch the statistics for the video having the given id.
 * @param {String} videoId [ID of the video]
 * @returns {String} [Dislikes on the given video]
 */
function getVideoDislikeCount(videoId) {
    const ytApi = `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${API_KEY}`;
    return fetch(ytApi)
        .then(
            response => {
                if (response.ok)
                    // Parse the JSON response.
                    return response.json();
                else
                    throw new Error(`HTTP error! status: ${response.status}`);
            },
            error => {
                throw new Error("Cannot fetch data. " + error);
            }
        )
        .then(
            parsedJSON => {
                return parsedJSON.items[0].statistics.dislikeCount;
            },
            error => {
                throw new Error("Cannot parse response. " + error);
            }
        )
        .catch(e => {
            console.log(e.message);
            return false;
        });
}

/**
 * Formats the number to readable format with proper suffix (K - thousand, M - Million, B - Billion).
 * @param {Number} value
 * @returns {String} [Value converted to readable format with proper suffix]
 */
function convertToReadableFormat(value) {
    if (value < 1000)
        return value;
    let count = 0;
    const unitSuffix = ['K', 'M', 'B'];

    do {
        value = value / 1000.0;
        ++count;
    } while (value > 1000 && count < 3);

    // Round value to one decimal place and convert it to string.
    value = Math.round((value + Number.EPSILON) * 10) / 10;
    let valueStr = value.toString();

    // Check number of digits before the decimal point.
    if (valueStr.charAt(1) === '.' && valueStr.charAt(2) !== '0') {
        // Only 1 digit before the decimal point and no zero just after decimal point.
        // e.g.: 5.6789 ==> 5.6 
        valueStr = valueStr.substring(0, 3);
    }
    else {
        // e.g.: 12.345 ==> 12, 5.067 ==> 5
        valueStr = valueStr.substring(0, valueStr.indexOf("."));
    }

    // Add the suffix.
    valueStr = valueStr + unitSuffix[count - 1];
    return valueStr;
}

/**
 * Show dislikes count next to dislike button.
 */
async function showDislikes() {
    let videoId = getVideoId();

    if (!videoId)
        return;

    let dislikes = await getVideoDislikeCount(videoId);

    if (!dislikes)
        return;
    console.log("dislikes = " + dislikes);
    // Update the dislikes count, next to dislike button.
    let buttonsDivElement = document.getElementById("top-level-buttons-computed");
    let dislikeElement = buttonsDivElement.children[1].querySelector("#text");
    dislikeElement.innerHTML = convertToReadableFormat(Number(dislikes));
}
console.log("running");
showDislikes();