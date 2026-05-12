const clickLinks = document.querySelectorAll(".js-spotify-click");

clickLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const event = {
      event: "spotify_playlist_click",
      playlist: link.dataset.playlist || "unknown",
      area: link.dataset.clickArea || "unknown",
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);

    const previous = JSON.parse(localStorage.getItem("spotify_click_events") || "[]");
    previous.push(event);
    localStorage.setItem("spotify_click_events", JSON.stringify(previous.slice(-100)));
  });
});
