const clickLinks = document.querySelectorAll(".js-spotify-click");
const youtubeLinks = document.querySelectorAll(".js-youtube-click");

clickLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const playlist = link.dataset.playlist || "unknown";
    const clickArea = link.dataset.clickArea || "unknown";
    const event = {
      event: "spotify_playlist_click",
      playlist,
      area: clickArea,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);

    if (typeof window.gtag === "function") {
      window.gtag("event", "spotify_playlist_click", {
        playlist,
        click_area: clickArea,
        page_path: window.location.pathname,
        link_url: link.href
      });
    }

    const previous = JSON.parse(localStorage.getItem("spotify_click_events") || "[]");
    previous.push(event);
    localStorage.setItem("spotify_click_events", JSON.stringify(previous.slice(-100)));
  });
});

youtubeLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const playlist = link.dataset.playlist || "unknown";
    const clickArea = link.dataset.clickArea || "unknown";
    const event = {
      event: "youtube_playlist_click",
      playlist,
      area: clickArea,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);

    if (typeof window.gtag === "function") {
      window.gtag("event", "youtube_playlist_click", {
        playlist,
        click_area: clickArea,
        page_path: window.location.pathname,
        link_url: link.href
      });
    }

    const previous = JSON.parse(localStorage.getItem("youtube_click_events") || "[]");
    previous.push(event);
    localStorage.setItem("youtube_click_events", JSON.stringify(previous.slice(-100)));
  });
});
