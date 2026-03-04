document.addEventListener("DOMContentLoaded", function(){

const loginForm = document.getElementById("loginForm");

if(loginForm){
loginForm.addEventListener("submit", function(e){
e.preventDefault();
window.location.href = "dashboard.html";
});
}

});