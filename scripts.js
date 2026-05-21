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

let activeShareMenu = null;

function closeShareMenu() {
  if (!activeShareMenu) {
    return;
  }

  activeShareMenu.remove();
  activeShareMenu = null;
}

function trackShareAction({ playlist, clickArea, shareUrl, destination }) {
  const event = {
    event: "playlist_share_click",
    playlist,
    area: clickArea,
    path: window.location.pathname,
    share_url: shareUrl,
    share_destination: destination,
    timestamp: new Date().toISOString()
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);

  if (typeof window.gtag === "function") {
    window.gtag("event", "playlist_share_click", {
      playlist,
      click_area: clickArea,
      page_path: window.location.pathname,
      share_url: shareUrl,
      share_destination: destination
    });
  }
}

function setShareStatus(menu, message) {
  const status = menu.querySelector(".share-menu-status");
  if (!status) {
    return;
  }

  status.textContent = message;
}

async function copyShareText(text, menu, successMessage) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.append(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }
    setShareStatus(menu, successMessage);
  } catch (error) {
    setShareStatus(menu, "Copy failed");
  }
}

function createShareMenuItem(label, type) {
  const element = document.createElement(type === "link" ? "a" : "button");
  element.className = "share-menu-item";
  element.textContent = label;

  if (type !== "link") {
    element.type = "button";
  }

  return element;
}

shareLinks.forEach((button) => {
  button.addEventListener("click", (clickEvent) => {
    clickEvent.stopPropagation();

    const playlist = button.dataset.playlist || "unknown";
    const clickArea = button.dataset.clickArea || "unknown";
    const shareUrl = button.dataset.shareUrl || window.location.href;
    const shareTitle = button.dataset.shareTitle || document.title;
    const shareCaption = `${shareTitle}\n${shareUrl}`;

    if (activeShareMenu && activeShareMenu.dataset.sourceId === playlist) {
      closeShareMenu();
      return;
    }

    closeShareMenu();
    trackShareAction({ playlist, clickArea, shareUrl, destination: "open_menu" });

    const menu = document.createElement("div");
    menu.className = "share-menu";
    menu.dataset.sourceId = playlist;
    menu.setAttribute("role", "menu");
    menu.addEventListener("click", (menuEvent) => {
      menuEvent.stopPropagation();
    });

    const xLink = createShareMenuItem("Post to X", "link");
    const xUrl = new URL("https://twitter.com/intent/tweet");
    xUrl.searchParams.set("text", shareTitle);
    xUrl.searchParams.set("url", shareUrl);
    xLink.href = xUrl.toString();
    xLink.target = "_blank";
    xLink.rel = "noopener";
    xLink.addEventListener("click", () => {
      trackShareAction({ playlist, clickArea, shareUrl, destination: "x" });
      closeShareMenu();
    });

    const copyCaptionButton = createShareMenuItem("Copy for IG/Threads", "button");
    copyCaptionButton.addEventListener("click", () => {
      trackShareAction({ playlist, clickArea, shareUrl, destination: "copy_caption" });
      copyShareText(shareCaption, menu, "Caption copied");
    });

    const copyLinkButton = createShareMenuItem("Copy link", "button");
    copyLinkButton.addEventListener("click", () => {
      trackShareAction({ playlist, clickArea, shareUrl, destination: "copy_link" });
      copyShareText(shareUrl, menu, "Link copied");
    });

    menu.append(xLink, copyCaptionButton, copyLinkButton);

    if (navigator.share) {
      const nativeButton = createShareMenuItem("More share options", "button");
      nativeButton.addEventListener("click", async () => {
        trackShareAction({ playlist, clickArea, shareUrl, destination: "native" });

        try {
          await navigator.share({
            title: shareTitle,
            url: shareUrl
          });
          closeShareMenu();
        } catch (error) {
          setShareStatus(menu, "Share canceled");
        }
      });
      menu.append(nativeButton);
    }

    const status = document.createElement("div");
    status.className = "share-menu-status";
    status.setAttribute("aria-live", "polite");
    menu.append(status);

    document.body.append(menu);

    const rect = button.getBoundingClientRect();
    const menuWidth = 230;
    const left = Math.min(
      rect.left + window.scrollX,
      window.scrollX + window.innerWidth - menuWidth - 16
    );
    menu.style.left = `${Math.max(window.scrollX + 16, left)}px`;
    menu.style.top = `${rect.bottom + window.scrollY + 10}px`;

    activeShareMenu = menu;
  });
});

document.addEventListener("click", closeShareMenu);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeShareMenu();
  }
});
