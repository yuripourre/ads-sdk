import { fetchNFT, fetchActiveAd, sendMetric } from '../../utils/networking';
import { formats, defaultFormat } from '../../utils/formats';
import { log } from './logger';
import './visibility_check';


AFRAME.registerComponent('zesty-ad', {
  data: {},
  schema: {
    adSpace: { type: 'string' },
    creator: { type: 'string' },
    network: { type: 'string', default: 'polygon', oneOf: ['matic', 'polygon', 'rinkeby'] },
    adFormat: { type: 'string', default: defaultFormat, oneOf: ['tall', 'wide', 'square'] },
    height: { type: 'float', default: 1 },
  },

  init: function() {
    // This slows down the tick
    this.tick = AFRAME.utils.throttleTick(this.tick, 200, this);
    this.registerEntity()
  },

  registerEntity: function() {
    this.system.registerEntity(this.el, this.data.adSpace, this.data.creator, this.data.network, this.data.adFormat, this.data.height);
  },

  // Every 200ms check for `visible` component
  tick: function() {
    let component = this.el;
    if (component.getAttribute('visible') == false) {
      while (component.firstChild) {
        component.removeChild(component.lastChild);
      }
    }

    if (!!component.getAttribute('visible') && !component.firstChild) {
      this.registerEntity();
    }
  },

  remove: function() {
    this.system.unregisterEntity(this.el);
  },
});

AFRAME.registerComponent('zesty-ad', {
  data: {},
  schema: {
    adSpace: { type: 'string' },
    space: { type: 'string' },
    creator: { type: 'string' },
    network: { type: 'string', default: 'polygon', oneOf: ['matic', 'polygon', 'rinkeby'] },
    adFormat: { type: 'string', oneOf: ['tall', 'wide', 'square'] },
    format: { type: 'string', oneOf: ['tall', 'wide', 'square'] },
    style: { type: 'string', default: defaultStyle, oneOf: ['standard', 'minimal'] },
    height: { type: 'float', default: 1 },
  },

  init: function() {
    // This slows down the tick
    this.tick = AFRAME.utils.throttleTick(this.tick, 200, this);
    this.registerEntity()
  },

  registerEntity: function() {
    let space = this.data.space ? this.data.space : this.data.adSpace;
    let format = (this.data.format ? this.data.format : this.data.adFormat) || defaultFormat;
    this.system.registerEntity(this.el, space, this.data.creator, this.data.network, format, this.data.style, this.data.height);
  },

  // Every 200ms check for `visible` component
  tick: function() {
    let component = this.el;
    if (component.getAttribute('visible') == false) {
      while (component.firstChild) {
        component.removeChild(component.lastChild);
      }
    }

    if (!!component.getAttribute('visible') && !component.firstChild) {
      this.registerEntity();
    }
  },

  remove: function() {
    this.system.unregisterEntity(this.el);
  },
});


async function loadAd(adSpace, creator, network, adFormat) {
  const activeNFT = await fetchNFT(adSpace, creator, network);
  const activeAd = await fetchActiveAd(activeNFT.uri, adFormat);

  // Need to add https:// if missing for page to open properly
  let url = activeAd.data.url;
  url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;

  let image = activeAd.data.image;
  image = image.match(/^.+\.(png|jpe?g)/i) ? image : `https://ipfs.zesty.market/ipfs/${image}`;

  const img = document.createElement('img');
  img.setAttribute('id', activeAd.uri)
  img.setAttribute('crossorigin', '');
  if (activeAd.data.image) {
    img.setAttribute('src', image);
    return new Promise((resolve, reject) => {
      img.onload = () => resolve({ img: img, uri: activeAd.uri, url: url });
      img.onerror = () => reject('img load error');
    });
  } else {
    return { id: 'blank' };
  }
}

AFRAME.registerSystem('zesty-ad', {
  entities: [],
  data: {},
  schema: {},

  init: function() {
    this.entities = [];
  },

  registerEntity: function(el, adSpace, creator, network, adFormat, height) {
    if((this.adPromise && this.adPromise.isPending && this.adPromise.isPending()) || this.entities.length) return; // Checks if it is a promise, stops more requests from being made

    const scene = document.querySelector('a-scene');
    let assets = scene.querySelector('a-assets');
    if (!assets) {
      assets = document.createElement('a-assets');
      scene.appendChild(assets);
    }

    log(`Loading adSpace: ${adSpace}, creator: ${creator}`);

    this.adPromise = loadAd(adSpace, creator, network, adFormat).then((ad) => {
      if (ad.img) {
        assets.appendChild(ad.img);
      }
      if (ad.url == 'https://www.zesty.market') {
        ad.url = `https://app.zesty.market/space/${adSpace}`;
      }
      return ad;
    });

    this.adPromise.then((ad) => {
      // don't attach plane if element's visibility is false
      if (el.getAttribute('visible') !== false) {
        sendMetric(
          creator,
          adSpace,
          ad.uri,
          ad.img.src,
          ad.url,
          'load', // event
          0, // durationInMs
          'aframe' //sdkType
        );

        const plane = document.createElement('a-plane');
        if (ad.img) {
          plane.setAttribute('src', `#${ad.uri}`);
          plane.setAttribute('width', formats[adFormat].width * height);
          plane.setAttribute('height', height);
          // for textures that are 1024x1024, not setting this causes white border
          plane.setAttribute('transparent', 'true');
          plane.setAttribute('shader', 'flat');
        } else {
          // No ad to display, hide the plane texture while still leaving it accessible to raycasters
          plane.setAttribute('material', 'opacity: 0');
        }
        plane.setAttribute('side', 'double');
        plane.setAttribute('class', 'clickable'); // required for BE

        // handle clicks
        plane.onclick = () => {
          const scene = document.querySelector('a-scene');
          scene.exitVR();
          // Open link in new tab
          if (ad.url) {
            window.open(ad.url, '_blank');
            sendMetric(
              creator,
              adSpace,
              ad.uri,
              ad.img.src,
              ad.url,
              'click', // event
              0, // durationInMs
              'aframe' //sdkType
            );
          }};
        el.appendChild(plane);

        // Set ad properties
        el.adURI = ad.uri;
        el.imgSrc = ad.img.src;
        el.url = ad.cta;
      }
    });

    if (!el.hasAttribute('visibility-check')) {
      el.setAttribute('visibility-check', '');
    }

    this.entities.push(el);
  },

  unregisterEntity: function(el) {
    this.entities = this.entities.filter((sEl) => sEl !== el);
  },
});

AFRAME.registerSystem('zesty-ad', {
  entities: [],
  data: {},
  schema: {},

  init: function() {
    this.entities = [];
  },

  registerEntity: function(el, space, creator, network, format, style, height) {
    if((this.bannerPromise && this.bannerPromise.isPending && this.bannerPromise.isPending()) || this.entities.length) return; // Checks if it is a promise, stops more requests from being made

    const scene = document.querySelector('a-scene');
    let assets = scene.querySelector('a-assets');
    if (!assets) {
      assets = document.createElement('a-assets');
      scene.appendChild(assets);
    }

    log(`Loading space: ${space}, creator: ${creator}`);

    this.bannerPromise = loadBanner(space, creator, network, format, style).then((banner) => {
      if (banner.img) {
        assets.appendChild(banner.img);
      }
      if (banner.url == 'https://www.zesty.market') {
        banner.url = `https://app.zesty.market/space/${space}`;
      }
      return banner;
    });

    this.bannerPromise.then((banner) => {
      // don't attach plane if element's visibility is false
      if (el.getAttribute('visible') !== false) {
        sendMetric(
          creator,
          space,
          banner.uri,
          banner.img.src,
          banner.url,
          'load', // event
          0, // durationInMs
          'aframe' //sdkType
        );

        const plane = document.createElement('a-plane');
        if (banner.img) {
          plane.setAttribute('src', `#${banner.uri}`);
          plane.setAttribute('width', formats[format].width * height);
          plane.setAttribute('height', height);
          // for textures that are 1024x1024, not setting this causes white border
          plane.setAttribute('transparent', 'true');
          plane.setAttribute('shader', 'flat');
        } else {
          // No banner to display, hide the plane texture while still leaving it accessible to raycasters
          plane.setAttribute('material', 'opacity: 0');
        }
        plane.setAttribute('side', 'double');
        plane.setAttribute('class', 'clickable'); // required for BE

        // handle clicks
        plane.onclick = () => {
          const scene = document.querySelector('a-scene');
          scene.exitVR();
          // Open link in new tab
          if (banner.url) {
            window.open(banner.url, '_blank');
            sendMetric(
              creator,
              space,
              banner.uri,
              banner.img.src,
              banner.url,
              'click', // event
              0, // durationInMs
              'aframe' //sdkType
            );
          }};
        el.appendChild(plane);

        // Set ad properties
        el.bannerURI = banner.uri;
        el.imgSrc = banner.img.src;
        el.url = banner.cta;
      }
    });

    if (!el.hasAttribute('visibility-check')) {
      el.setAttribute('visibility-check', '');
    }

    this.entities.push(el);
  },

  unregisterEntity: function(el) {
    this.entities = this.entities.filter((sEl) => sEl !== el);
  },
});

AFRAME.registerPrimitive('a-zesty', {
  defaultComponents: {
    'zesty-ad': { adSpace: '', creator: '' },
    'visibility-check': {}
  },
});
