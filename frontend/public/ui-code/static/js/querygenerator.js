document.addEventListener("DOMContentLoaded", function () {
    debugger; // will stop once DOM is ready
    console.log("querygenerator.js loaded");
});
function fetchvalue(val){
    document.getElementById('test_submit').value=val;
}

function fetch_id(data,data1,data2){
        $('#api_id').val(data);
        $('#api_name').val(data1);
        $('#description').val(data2)
}


$('#test_submit').click(function() {
    var id = document.getElementById('test_submit').value;
    console.log(id);
    $.ajax({
        url: window.location.protocol + '//'+ window.location.host + "/delete_permission",
        type: 'POST',
        dataType: "json",
        data: '{"api_id":"' + id + '"}',
        success: function(response) {
                     window.location.href = response.url;
                },
        error:function(response){
                    alert('error');
                }

    });
});
document.getElementById("download-btn").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent default form submission
    window.location.href = window.location.protocol + '//' + window.location.host + "/download-template";
});
document.querySelector('button[onclick="window.location.href=\'/download-sql\'"]').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default action
    window.location.href = window.location.protocol + '//' + window.location.host + "/download-sql";  // This will call the Flask route to download SQL files
});

// Function to show messages on the page
function showMessage(message, type) {
    let messageBox = document.getElementById('message-box');
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.id = 'message-box';
        document.querySelector('.dropzone').after(messageBox); // Place message below the uploader
    }
    messageBox.innerText = message;
    messageBox.className = `message ${type}`;
}

// Add some CSS for styling messages
let style = document.createElement('style');
style.innerHTML = `
    .message {
        margin-top: 10px;
        padding: 10px;
        border-radius: 5px;
        text-align: center;
        font-weight: bold;
        font-size: 14px;
    }
    .message.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .message.error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .message.info { background-color: #cce5ff; color: #004085; border: 1px solid #b8daff; }
`;
Dropzone.autoDiscover = false;  // Disable auto-discovery

// Initialize the first dropzone
var dropzone1 = new Dropzone("#my-dropzone", {
    url: window.location.protocol + '//' + window.location.host + "/upload-template", // Dynamic Flask endpoint URL
    method: "POST",
    paramName: "file",
    maxFiles: 1,
    maxFilesize: 2,  // Max file size in MB
    acceptedFiles: ".xlsx",
    autoProcessQueue: false, // Disable auto-uploading
    success: function(file, response) {
        // Update success message in the specified element
        document.getElementById("success_message").textContent = 'Excel File uploaded successfully!';
        document.getElementById("success_message").classList.remove("text-danger");
        document.getElementById("success_message").classList.add("text-success");

        console.log(response);
    },
    error: function(file, errorMessage) {
        // Show error message instead of success
        document.getElementById("success_message").textContent = 'Excel File upload failed. Please try again.';
        document.getElementById("success_message").classList.remove("text-success");
        document.getElementById("success_message").classList.add("text-danger");

        console.error(errorMessage);
    }
});

// Initialize the second dropzone
var dropzone2 = new Dropzone("#my-dropzone2", {
    url: window.location.protocol + '//' + window.location.host + "/upload-sql", // Dynamic Flask endpoint URL
    method: "POST",
    paramName: "file",
    maxFiles: 1,
    maxFilesize: 2,  // Max file size in MB
    acceptedFiles: ".sql",
    autoProcessQueue: false, // Disable auto-uploading
    success: function(file, response) {
        // Update success message in the specified element
        document.getElementById("success_message_1").textContent = 'SQL File uploaded successfully!';
        document.getElementById("success_message_1").classList.remove("text-danger");
        document.getElementById("success_message_1").classList.add("text-success");

        console.log(response);
    },
    error: function(file, errorMessage) {
        // Show error message instead of success
        document.getElementById("success_message_1").textContent = 'SQL File upload failed. Please try again.';
        document.getElementById("success_message_1").classList.remove("text-success");
        document.getElementById("success_message_1").classList.add("text-danger");

        console.error(errorMessage);
    }
});

// Trigger upload when button is clicked
document.querySelector('#upload_btn').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default action (e.g., link redirect)

    // Upload files manually for each Dropzone
    if (dropzone1.files.length > 0) {
        dropzone1.processQueue(); // Manually upload files in the first dropzone
    }
    if (dropzone2.files.length > 0) {
        dropzone2.processQueue(); // Manually upload files in the second dropzone
    }
});
