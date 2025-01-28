// IP Geolocation API Token
const IPGEOLOCATION_TOKEN = "165116ca9fb4483bb5a00d034d5b8692";

// DM content mapping (updated JSON structure)
var dm_content_mapping = {
  "test_(draft_te) || (all locations)": [
    "What's on offer?",
    "Customize 3 Bedroom into 4 Bedroom",
    "Customize 5 Bedroom into 4 Bedroom",
    "In today’s world, technology is a necessity and a way of life. Nature, on the other hand, is a rare blessing in a concrete jungle. Discover the best of both worlds with luxury residences where technology and nature are in perfect harmony.",
    ["image", "./images/atr1.jpg", "Located in Whitefield"],
    ["image", "./images/dbtw1.jpg", "Pursuit of a Radical Rhapsody"],
    ["image", "./images/tuig1.jpg", "Pursuit of a Radical Rhapsody"],
    ["", "", ""],
    ["", "", ""]
    
  ],
  "luxury homes in bangalore (draft total environment) || (all locations)": [
    "Bangalore’s Finest Homes, Designed for You",
    "Personalize each aspect of your home through edesign",
    "64 completed projects over 28 years | 1200 customers",
    "With “People-Centred Design” at the heart of everything we do, for every project we design, we consider how people will use each space and how our design can inspire and enhance the quality of their lives, always trying to create “design that makes you feel”.",
    ["image", "https://totalenv.blob.core.windows.net/te-galleries/Images/Web/EA171.png", "After the Rain - Master bedroom opening onto garden"],
    ["image", "https://totalenv.blob.core.windows.net/te-galleries/Images/Web/DB469.png", "After the Rain - Natural materials and lush greenery"],
    ["image", "https://totalenv.blob.core.windows.net/te-galleries/Images/Web/CD8AA.jpg", "Down by the Water - Clubhouse view"],
    ["image", "https://totalenv.blob.core.windows.net/te-galleries/Images/Web/26077.jpg", "Down by the Water - Lakeside Walkway"],
    ["", "", ""]
  ],
  "3 bhk in bangalore (draft total environment) || (all locations)": [
   "Perfectly Crafted 3-Bedroom Homes for You",
    "3 bed configurations available across 6 projects in North and East Bangalore ",
    "Price starting 4.5 Cr onwards",
    "Discover spacious 3-bedroom homes designed for comfort and style, offering modern living with nature-inspired elegance.",
    ["image", "https://totalenv.blob.core.windows.net/te-galleries/Images/Web/EA171.png", "After the Rain - Master bedroom opening onto garden"],
    ["image", "https://totalenv.blob.core.windows.net/te-galleries/Images/Web/DB469.png", "After the Rain - Natural materials and lush greenery"],
    ["image", "https://totalenv.blob.core.windows.net/te-galleries/Images/Web/CD8AA.jpg", "Down by the Water - Clubhouse view"],
    ["image", "https://totalenv.blob.core.windows.net/te-galleries/Images/Web/26077.jpg", "Down by the Water - Lakeside Walkway"],
    ["", "", ""]
  ],
  "all traffic (draft total environment) || (us)": [
    "Meet us in the US ",
    "Events in 5 cities ",
    "Dates - 23 Jan to 28 Feb",
    "Meet us in person to avail amazing offers and to discover more about the Total Environment difference.",
    ["image", "https://totalenv.blob.core.windows.net/te-galleries/Images/Web/BC318.png", "New York | 23 Feb | 117 Barrow Street"],
    ["image", "https://totalenv.blob.core.windows.net/te-galleries/Images/Web/DB469.png", "San Franscisco | 28 Feb | Lakshpur"],
    ["image", "https://totalenv.blob.core.windows.net/te-galleries/Images/Web/CBEF4.png", "Chicago | March 3 | Birage Town"],
    ["", "", ""],
    ["", "", ""]
  ]
};

// Store UTM content in cookies
storeSXIContent();

// Initialize variation based on SXI content and country
async function initializeVariation() {
  console.log("Initializing Variation...");

  // Get SXI content from cookie
  const stored_SXI_Content = getSXIContentFromCookie("sxi_content_test");
  console.log("Stored SXI Content:", stored_SXI_Content); // Debugging

  // Get user's country data (code and name)
  const countryData = await getUserCountry();
  console.log("User's country data:", countryData); // Debugging

  // Check if SXI content exists and matches feature flag keys
  const matchingKey = findMatchingKey(stored_SXI_Content, countryData);
  console.log("Matching Key:", matchingKey); // Debugging

  if (matchingKey) {
    console.log("SXI CONTENT AND COUNTRY MATCH FEATURE FLAG...");
    if (dm_content_mapping[matchingKey]) {
      create_offer_section(dm_content_mapping[matchingKey]);
    }
  } else {
    console.log("No matching feature flag found. Skipping variation...");
  }

  // Mutation observer to handle dynamic changes
  const mutationCallback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList" || mutation.type === "attributes") {
        console.log("Mutation Callback Change detected. Reverting...");
        
        // Re-check all three possibilities
        const matchingKey = findMatchingKey(stored_SXI_Content, countryData);
        if (matchingKey && dm_content_mapping[matchingKey]) {
          create_offer_section(dm_content_mapping[matchingKey]);
        }
      }
    }
  };

  const observer = new MutationObserver(mutationCallback);
  const config = { childList: true, attributes: true, subtree: false };

  const targetElement = document.querySelector("#wrapper .section:nth-child(3)");
  if (targetElement) {
    console.log("Observing Target Element", targetElement);
    observer.observe(targetElement, config);
  }
}

// Normalize country code to handle case sensitivity
function normalizeCountryCode(countryCode) {
  if (!countryCode) return null;
  return countryCode.trim().toLowerCase(); // Convert to lowercase for case-insensitive comparison
}

// Find matching key in dm_content_mapping
function findMatchingKey(sxiContent, country) {
  if (!sxiContent || !country) return null;

  // Normalize SXI content and country for case-insensitive comparison
  const normalizedSxiContent = sxiContent.toLowerCase().trim();
  const normalizedCountry = country.toLowerCase().trim();

  // Check for specific country first
  const specificCountryKey = `${normalizedSxiContent} || (${normalizedCountry})`;
  if (dm_content_mapping[specificCountryKey]) {
    return specificCountryKey;
  }

  // Check for "all locations"
  const allLocationsKey = `${normalizedSxiContent} || (all locations)`;
  if (dm_content_mapping[allLocationsKey]) {
    return allLocationsKey;
  }

  return null;

}

// Get both country code and name
async function getUserCountry() {
  try {
    const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEOLOCATION_TOKEN}`);
    const data = await response.json();
    return {
      code: data.country_code2.toLowerCase(), // Convert to lowercase
      name: data.country_name.toLowerCase()   // Convert to lowercase
    };
  } catch (error) {
    console.error("Error fetching user country:", error);
    return { code: "us", name: "united states" }; // Default to US
  }
}

// Find matching key with 3 checks
function findMatchingKey(sxiContent, countryData) {
  if (!sxiContent || !countryData) return null;

  // Normalize SXI content to lowercase and trim
  const normalizedSxi = sxiContent.toLowerCase().trim();
  console.log("Normalized SXI Content:", normalizedSxi); // Debugging

  // Check all three possibilities
  const possibleKeys = [
    `${normalizedSxi} || (${countryData.code})`,   // 1. SXI + Country Code
    `${normalizedSxi} || (${countryData.name})`,   // 2. SXI + Country Name
    `${normalizedSxi} || (all locations)`          // 3. SXI + All Locations
  ];

  console.log("Possible Keys:", possibleKeys); // Debugging

  // Return first matching key
  for (const key of possibleKeys) {
    if (dm_content_mapping[key]) return key;
  }

  return null;
}

// Get SXI content from cookie
function getSXIContentFromCookie(curr_key) {
  const cookies = document.cookie.split('; ');
  for (let cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === curr_key) {
      return decodeURIComponent(value); // Decode the cookie value
    }
  }
  return null; // Return null if the cookie is not found
}

// Get UTM parameter from URL
function getUTMParameter(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Store SXI content in cookies
function storeSXIContent() {
  const sxi_content = getUTMParameter('sxi_content_test');
  if (sxi_content) {
    // Normalize and store the SXI content
    const normalizedSxi = sxi_content.toLowerCase().trim();
    document.cookie = `sxi_content_test=${encodeURIComponent(normalizedSxi)}; path=/; max-age=${24 * 60 * 60}`;
  }
}

// Create offer section with dynamic content
function create_offer_section(custom_content) {
    let targetDiv = document.querySelector("#wrapper .section:nth-child(3)");
  
    if (document.querySelector('document.querySelector')) {
      return;
    }
  
    console.log('1) Creating Offer Section...');
  
    // Create the offer section container
    const section = document.createElement("div");
    section.classList.add("container", "sxi-offer-section");
  
    console.log('2) Creating Header...', section);
  
    // Add "What's on Offer" header
    const header = `
      <div class="sxi-offer-header">
        <h1 class="sxi-offer-title">${custom_content[0]}</h1>
        <div class="sxi-offer-details">
          <div>🏷️ ${custom_content[1]}</div>
          <div>📍 ${custom_content[2]}</div>
        </div>
      </div>
      <p class="sxi-offer-description">${custom_content[3]}</p>
    `;
    section.innerHTML = header;
  
    console.log('3) Creating Gallery...', section);
  
    // Add carousel
    const gallery = document.createElement("div");
    gallery.classList.add("sxi-project-gallery");
    gallery.innerHTML = `
      <div class="sxi-carousel">
        <button class="sxi-carousel-btn sxi-prev">❮</button>
        <div class="sxi-carousel-track"></div>
        <button class="sxi-carousel-btn sxi-next">❯</button>
      </div>
    `;
    section.appendChild(gallery);
  
    console.log('4) Appending custom div...', section);
  
    let customizedSection = document.createElement("section");
    customizedSection.classList.add("section", "sxi-customized-section");
    customizedSection.appendChild(section);
    targetDiv.parentNode.insertBefore(customizedSection, targetDiv);
  
    console.log('5) Adding Images/Videos...', targetDiv);
  
    // Create carousel items dynamically
    const track = section.querySelector(".sxi-carousel-track");
    const sxi_items = [];
  
    // Loop through custom_content starting from index 4 (cards)
    for (let i = 4; i < custom_content.length; i++) {
      const card = custom_content[i];
      if (Array.isArray(card) && card.length === 3 && card[0] && card[1]) { // Check if card is valid
        const [type, src, caption] = card;
        sxi_items.push({ type, src, caption });
      }
    }
  
    // Add items to the carousel
    sxi_items.forEach((item) => {
      const carouselItem = document.createElement("div");
      carouselItem.classList.add("sxi-carousel-item");
  
      if (item.type === "image") {
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = "Loading...";
        img.classList.add("sxi-carousel-image");
        carouselItem.appendChild(img);
      } else if (item.type === "video") {
        const video = document.createElement("video");
        video.src = item.src;
        video.controls = true;
        video.classList.add("sxi-carousel-video");
        carouselItem.appendChild(video);
      }
  
      const caption = document.createElement("p");
      caption.classList.add("sxi-carousel-caption");
      caption.textContent = item.caption || "";
  
      // Add CTA Button
      const ctaButton = document.createElement("button");
      ctaButton.textContent = "Learn More"; // Button text
      ctaButton.classList.add("sxi-cta-button");
  
      // Add click event to scroll to the top of the page
      ctaButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to the top
      });
  
      caption.appendChild(ctaButton);
      carouselItem.appendChild(caption);
      track.appendChild(carouselItem);
    });
  
    // Carousel functionality (next/prev buttons, etc.)
    const prevButton = section.querySelector(".sxi-carousel-btn.sxi-prev");
    const nextButton = section.querySelector(".sxi-carousel-btn.sxi-next");
    let currentIndex = 0;
  
    function getVisibleItems() {
      const width = window.innerWidth;
      if (width <= 480) return 1;
      if (width <= 768) return 2;
      return 2.5;
    }
  
    function updateCarousel(smooth = true) {
      const visibleItems = getVisibleItems();
      const itemWidth = track.parentElement.offsetWidth / visibleItems;
      const maxIndex = sxi_items.length - (window.innerWidth <= 480 ? 1 : visibleItems);
  
      if (!smooth) {
        track.style.transition = 'none';
      } else {
        track.style.transition = 'transform 0.5s ease-in-out';
      }
  
      let translateX = currentIndex * itemWidth;
  
      if (window.innerWidth <= 480) {
        const lastAllowedTranslate = (sxi_items.length - 1) * itemWidth;
        translateX = Math.min(translateX, lastAllowedTranslate);
      } else {
        const maxTranslate = Math.max(0, (sxi_items.length - visibleItems)) * itemWidth;
        translateX = Math.min(translateX, maxTranslate);
      }
  
      track.style.transform = `translateX(-${translateX}px)`;
    }
  
    function nextSlide() {
      const visibleItems = getVisibleItems();
      const maxIndex = window.innerWidth <= 480 ?
        sxi_items.length - 1 :
        sxi_items.length - Math.floor(visibleItems);
  
      if (currentIndex >= maxIndex) {
        currentIndex = 0;
        track.style.transition = 'none';
        updateCarousel(false);
        setTimeout(() => {
          track.style.transition = 'transform 0.5s ease-in-out';
        }, 50);
      } else {
        currentIndex++;
        updateCarousel(true);
      }
    }
  
    function prevSlide() {
      if (currentIndex <= 0) {
        currentIndex = sxi_items.length - 1;
        track.style.transition = 'none';
        updateCarousel(false);
        setTimeout(() => {
          track.style.transition = 'transform 0.5s ease-in-out';
        }, 50);
      } else {
        currentIndex--;
        updateCarousel(true);
      }
    }
  
    nextButton.addEventListener("click", nextSlide);
    prevButton.addEventListener("click", prevSlide);
  
    // Handle window resize
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const visibleItems = getVisibleItems();
        const maxIndex = sxi_items.length - Math.floor(visibleItems);
        if (currentIndex > maxIndex) {
          currentIndex = maxIndex;
        }
        updateCarousel(false);
      }, 100);
    });
  
    // Initial update
    updateCarousel();
  }
  
  // Call the initialization function immediately if DOM is already loaded
  if (document.readyState === "complete" || document.readyState === "interactive") {
    initializeVariation();
  } else {
    document.addEventListener("DOMContentLoaded", initializeVariation);
  }