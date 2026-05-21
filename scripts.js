const clickLinks = document.querySelectorAll(".js-spotify-click");
const youtubeLinks = document.querySelectorAll(".js-youtube-click");
const shareLinks = document.querySelectorAll(".js-share-link");

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

shareLinks.forEach((button) => {
  button.addEventListener("click", async () => {
    const playlist = button.dataset.playlist || "unknown";
    const clickArea = button.dataset.clickArea || "unknown";
    const shareUrl = button.dataset.shareUrl || window.location.href;
    const shareTitle = button.dataset.shareTitle || document.title;
    const event = {
      event: "playlist_share_click",
      playlist,
      area: clickArea,
      path: window.location.pathname,
      share_url: shareUrl,
      timestamp: new Date().toISOString()
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);

    if (typeof window.gtag === "function") {
      window.gtag("event", "playlist_share_click", {
        playlist,
        click_area: clickArea,
        page_path: window.location.pathname,
        share_url: shareUrl
      });
    }

    const originalText = button.textContent;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          url: shareUrl
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      button.textContent = "Copied";
      button.classList.add("is-copied");
    } catch (error) {
      button.textContent = "Copy failed";
    }

    window.setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove("is-copied");
    }, 1800);
  });
});
