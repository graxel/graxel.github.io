document.addEventListener('DOMContentLoaded', function() {
  const clipboard = new ClipboardJS("#copyButton", {
    text: function() {
  	  return "grazel98@gmail.com";
    }
  });

  clipboard.on('success', function(e) {
    var tootip = document.getElementById("toottip");
    tootip.classList.add("visible");

    setTimeout(function() {
      tootip.classList.remove("visible");
    }, 2000);
  });

  clipboard.on('error', function(e) {
    console.error('Action:', e.action);
    console.error('Trigger:', e.trigger);
  });
});