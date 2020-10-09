addEventListener('fetch', event => {
  event.respondWith(new Promise((resolve, reject) => {
    // get the url of the request
    let url = new URL(event.request.url);

    // the /links route
    if (url.pathname === "/links") {
      resolve(handleLinksRequest(event.request));
    }
    else {
      // fetch the static HTML page and pass it to handleHTMLRequest
      fetch('https://static-links-page.signalnerve.workers.dev')
      .then((res) => {
        resolve(handleHTMLRequest(event.request, res));
      });
    }
  }));
})

// the global variable links that we'll use
let links = [
  { "name": "Personal Site", "url": "https://zackseliger.com" },
  { "name": "Battlefields.io", "url": "https://battlefields.io" },
  { "name": "Google", "url": "https://google.com" }
];

async function handleHTMLRequest(request, html) {
  return new Promise((resolve, reject) => {
    // transform the HTML
    let transformedHTML = new HTMLRewriter()
    .on('div#links', new LinksTransformer(links))
    .on('div#profile', { element: (element) => {
      element.removeAttribute('style');
    }})
    .on('img#avatar', { element: (element) => {
      element.setAttribute('src', 'https://pbs.twimg.com/profile_images/1000193675706675200/gJNNrXp2_400x400.jpg');
    }})
    .on('h1#name', { element: (element) => {
      element.setInnerContent("Zack Seliger");
    }})
    .on('div#social', new SocialTransformer())
    .on('title', { element: element => {
      element.setInnerContent("Zack Seliger");
    }})
    .on('body', { element: element => {
      element.setAttribute("class", "bg-gray-800");
    }})
    .transform(html);

    // return the transformed HTML
    // Content-Type is already correctly set
    resolve(transformedHTML);
  });
}

// returns the links as JSON
async function handleLinksRequest(request) {
  return new Response(JSON.stringify(links), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// puts our links inside of whatever element is given to us
class LinksTransformer {
  constructor(links) {
    this.links = links;
  }

  async element(element) {
    this.links.forEach((link) => {
      element.append(`<a href="${link.url}" target="_blank">${link.name}</a>`, { html: true });
    });
  }
}

// modifies the given element and puts social info inside
class SocialTransformer {
  constructor() {
    this.socials = [
      { url: "https://github.com/zackseliger", icon: "https://simpleicons.org/icons/github.svg" },
      { url: "https://twitter.com/zack_seliger", icon: "https://simpleicons.org/icons/twitter.svg" }
    ];
  }

  async element(element) {
    element.removeAttribute('style');
    this.socials.forEach((social) => {
      element.append(`<a href="${social.url}" target="_blank"><img src="${social.icon}"/></a>`, { html: true });
    });
  }
}